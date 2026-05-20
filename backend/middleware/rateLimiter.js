// Bộ nhớ lưu trữ số lượng request tạm thời theo IP
const rateLimits = new Map();

/**
 * Middleware Rate Limiter (Thuật toán Fixed-Window)
 * @param {number} limit - Số lượng request tối đa
 * @param {number} windowMs - Khoảng thời gian giới hạn (milliseconds)
 */
function rateLimiter(limit, windowMs) {
    return (req, res, next) => {
        // Lấy IP của Client (xử lý trường hợp qua proxy hoặc load balancer)
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const now = Date.now();

        if (!rateLimits.has(ip)) {
            // Đăng ký IP mới
            rateLimits.set(ip, {
                requests: 1,
                resetTime: now + windowMs
            });
            return next();
        }

        const rateData = rateLimits.get(ip);

        // Nếu đã qua khoảng thời gian giới hạn, reset lại bộ đếm
        if (now > rateData.resetTime) {
            rateData.requests = 1;
            rateData.resetTime = now + windowMs;
            return next();
        }

        // Nếu vượt quá giới hạn request
        if (rateData.requests >= limit) {
            const retryAfter = Math.ceil((rateData.resetTime - now) / 1000);
            res.setHeader('Retry-After', retryAfter); // Header tiêu chuẩn báo thời gian đợi
            return res.status(429).json({
                error: 'Too Many Requests',
                message: `Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfter} giây.`
            });
        }

        // Tăng số lượng request đã gửi lên 1
        rateData.requests += 1;
        next();
    };
}

// Hàm dọn dẹp bộ nhớ định kỳ để tránh rò rỉ bộ nhớ (Memory Leak)
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimits.entries()) {
        if (now > data.resetTime) {
            rateLimits.delete(ip);
        }
    }
}, 5 * 60 * 1000); // Dọn dẹp mỗi 5 phút

module.exports = rateLimiter;
