// Đảm bảo đã cài node-fetch (npm install node-fetch) hoặc chạy bằng Node v18+ 

// ================= CẤU HÌNH ================= //
const BASE_URL = 'http://localhost:3000/api/v1';
const ADMIN_USER = 'admin';       // Tài khoản
const ADMIN_PASS = 'admin@123';    // Mật khẩu

// ⚠️ THAY ĐỔI CÁC THÔNG SỐ NÀY CHO KHỚP VỚI DATABASE CỦA BẠN
const FROM_WAREHOUSE_ID = 'WH001'; // ID Kho xuất
const TO_WAREHOUSE_ID = 'WH002';   // ID Kho nhập
const PRODUCT_ID = 'SP001';        // ID Sản phẩm
const QUANTITY_TO_TRANSFER = 10;   // Số lượng chuyển
const REPLAY_COUNT = 4;            // Số lần gửi khai thác lỗi (thêm 4 lần = tổng 5 lần)
// ============================================ //

async function runTest() {
    console.log("==========================================");
    console.log("🚀 KỊCH BẢN KIỂM THỬ: LỖI DOUBLE-SPENDING");
    console.log("==========================================\n");

    try {
        // 1. Đăng nhập để lấy Token
        console.log("1️⃣ Đang đăng nhập...");
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS })
        });

        if (!loginRes.ok) throw new Error("Đăng nhập thất bại. Kiểm tra lại mật khẩu.");
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("   ✅ Lấy Token thành công.\n");

        // 2. Tạo phiếu chuyển kho mới (Pending)
        console.log(`2️⃣ Đang tạo phiếu chuyển kho ${QUANTITY_TO_TRANSFER} sản phẩm...`);
        const createRes = await fetch(`${BASE_URL}/transfers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                from_warehouse_id: FROM_WAREHOUSE_ID,
                to_warehouse_id: TO_WAREHOUSE_ID,
                items: [{ product_id: PRODUCT_ID, quantity: QUANTITY_TO_TRANSFER }],
                notes: "Phiếu chuyển kho test Double Spending"
            })
        });

        if (!createRes.ok) {
            const err = await createRes.json();
            throw new Error(`Lỗi tạo phiếu: ${err.error || err.message}`);
        }

        const createData = await createRes.json();
        const transferId = createData.transfer.id;
        console.log(`   ✅ Tạo thành công. ID Phiếu: ${transferId}\n`);

        // 3. Hoàn thành phiếu lần 1 (Happy Path)
        console.log("3️⃣ Gửi yêu cầu Hoàn thành phiếu (Lần 1 - Hợp lệ)...");
        const completeRes = await fetch(`${BASE_URL}/transfers/${transferId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'completed' })
        });

        if (completeRes.ok) {
            console.log("   ✅ Hoàn thành thành công (HTTP 200). Sổ sách đã cập nhật đúng.\n");
        } else {
            throw new Error("Lỗi khi hoàn thành phiếu lần 1");
        }

        // 4. Khai thác lỗi: Gửi lại request nhiều lần (Replay Attack)
        console.log(`4️⃣ KHAI THÁC LỖI: Gửi lặp lại Request thêm ${REPLAY_COUNT} lần...`);
        let successReplayCount = 0;
        let failReplayCount = 0;

        for (let i = 1; i <= REPLAY_COUNT; i++) {
            const replayRes = await fetch(`${BASE_URL}/transfers/${transferId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'completed' })
            });

            if (replayRes.ok) {
                console.log(`   🚨 [CẢNH BÁO LỖI] Lần ${i}: API vẫn trả về 200 OK! Hệ thống đã nhân bản hàng hóa!`);
                successReplayCount++;
            } else {
                console.log(`   🛡️ [ĐÃ FIX] Lần ${i}: API từ chối (HTTP ${replayRes.status}). Hệ thống an toàn.`);
                failReplayCount++;
            }
        }

        console.log("\n================ KẾT QUẢ ==================");
        if (successReplayCount > 0) {
            console.log(`❌ HỆ THỐNG ĐANG CÓ LỖI DOUBLE-SPENDING!`);
            console.log(`❌ Số lượng hàng hoá bị chuyển ảo là: ${successReplayCount * QUANTITY_TO_TRANSFER} sản phẩm.`);
            console.log(`❌ Hãy bỏ comment code fix trong backend/models/transfers.js và thử lại.`);
        } else {
            console.log(`✅ HỆ THỐNG AN TOÀN! (Đã chặn thành công ${failReplayCount} request khai thác)`);
        }
        console.log("===========================================\n");

    } catch (error) {
        console.error("❌ Lỗi trong quá trình chạy script:");
        console.error("   " + error.message);
    }
}

runTest();
