const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

/**
 * Thu thập dữ liệu hệ thống để gửi cho AI phân tích
 */
async function gatherSystemData() {
    try {
        // 1. Thống kê sản phẩm và giá trị
        const stats = await new Promise((resolve, reject) => {
            db.get(`
                SELECT
                    COUNT(*) as total_products,
                    SUM(CASE WHEN q.total_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
                    SUM(CASE WHEN q.total_quantity <= 10 AND q.total_quantity > 0 THEN 1 ELSE 0 END) as low_stock,
                    COALESCE(SUM(p.price * COALESCE(q.total_quantity, 0)), 0) as total_inventory_value
                FROM products p
                LEFT JOIN (
                    SELECT product_id, SUM(quantity) as total_quantity
                    FROM inventory
                    GROUP BY product_id
                ) q ON p.custom_id = q.product_id
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        // 2. Giao dịch gần đây (7 ngày)
        const recentTransactions = await new Promise((resolve, reject) => {
            db.all(`
                SELECT type, SUM(quantity) as total_qty, COUNT(*) as tx_count
                FROM inventory_transactions
                WHERE transaction_date >= date('now', '-7 days')
                GROUP BY type
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // 3. Đơn hàng đang chờ
        const orders = await new Promise((resolve, reject) => {
            db.get(`
                SELECT
                    COUNT(*) as total_pending,
                    COUNT(CASE WHEN created_at < datetime('now', '-2 days') THEN 1 END) as overdue_pending
                FROM orders
                WHERE status = 'pending'
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        return {
            inventory: stats,
            weekly_activity: recentTransactions,
            orders: orders,
            timestamp: new Date().toISOString()
        };
    } catch (err) {
        console.error('Error gathering system data:', err);
        return null;
    }
}

/**
 * API Phân tích tình hình hệ thống bằng OpenRouter AI
 */
router.post('/analyze-system', authenticate, async (req, res) => {
    try {
        const systemData = await gatherSystemData();
        if (!systemData) {
            return res.status(500).json({ error: 'Không thể thu thập dữ liệu hệ thống' });
        }

        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
        if (!OPENROUTER_API_KEY) {
            return res.status(500).json({
                error: 'Chưa cấu hình OPENROUTER_API_KEY. Vui lòng thêm vào file .env',
                data_summary: systemData
            });
        }

        const prompt = `
            Bạn là một chuyên gia phân tích hệ thống quản lý kho.
            Dưới đây là dữ liệu hiện tại của hệ thống:

            1. Tồn kho:
               - Tổng số sản phẩm: ${systemData.inventory.total_products}
               - Sản phẩm hết hàng: ${systemData.inventory.out_of_stock}
               - Sản phẩm sắp hết (<=10): ${systemData.inventory.low_stock}
               - Tổng giá trị kho: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(systemData.inventory.total_inventory_value)}

            2. Hoạt động 7 ngày qua:
               ${systemData.weekly_activity.map(a => `- ${a.type === 'nhap' ? 'Nhập' : 'Xuất'}: ${a.total_qty} đơn vị (${a.tx_count} giao dịch)`).join('\n')}

            3. Đơn hàng:
               - Tổng đơn chờ xử lý: ${systemData.orders.total_pending}
               - Đơn chờ quá hạn (>2 ngày): ${systemData.orders.overdue_pending}

            Hãy phân tích tình hình hiện tại, đánh giá rủi ro và đưa ra 3 khuyến nghị cụ thể để tối ưu hóa việc quản lý kho.
            Trả lời bằng tiếng Việt, ngắn gọn, súc tích, định dạng Markdown.
        `;

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: "tencent/hy3-preview:free",
            messages: [
                { role: "system", content: "Bạn là chuyên gia phân tích hệ thống kho chuyên nghiệp." },
                { role: "user", content: prompt }
            ],
            top_p: 1,
            temperature: 0.7,
            repetition_penalty: 1
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://github.com/ruvnet/ql_kho_new',
                'X-Title': 'QL Kho AI Assistant',
                'Content-Type': 'application/json'
            }
        });

        res.json({
            analysis: response.data.choices[0].message.content,
            model: response.data.model,
            usage: response.data.usage
        });

    } catch (err) {
        console.error('AI Analysis Error:', err.response?.data || err.message);
        res.status(500).json({
            error: 'Lỗi khi gọi OpenRouter AI',
            details: err.response?.data || err.message
        });
    }
});

module.exports = router;
