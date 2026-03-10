import UserBehavior from "../models/UserBehavior.js";

// Weight map cho từng loại event
const EVENT_WEIGHTS = {
    view: 1.0,
    add_to_cart: 2.0,
    purchase: 3.0,
    rating: 2.5,
};

// Track user behavior event: POST /api/behavior/track
export const trackEvent = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId, eventType, metadata } = req.body;

        if (!productId || !eventType) {
            return res.json({ success: false, message: 'productId và eventType là bắt buộc' });
        }

        const validEvents = ['view', 'add_to_cart', 'purchase', 'rating'];
        if (!validEvents.includes(eventType)) {
            return res.json({ success: false, message: 'eventType không hợp lệ' });
        }

        const weight = EVENT_WEIGHTS[eventType] || 1.0;

        // Nếu là view, tránh duplicate trong vòng 30 phút
        if (eventType === 'view') {
            const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
            const recent = await UserBehavior.findOne({
                userId, productId, eventType: 'view',
                timestamp: { $gte: thirtyMinsAgo }
            });
            if (recent) {
                return res.json({ success: true, message: 'Event đã được ghi nhận gần đây' });
            }
        }

        await UserBehavior.create({
            userId,
            productId,
            eventType,
            weight,
            metadata: metadata || {},
            timestamp: new Date(),
        });

        return res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Lấy hành vi của user: GET /api/behavior/user/:userId
export const getUserBehaviors = async (req, res) => {
    try {
        const userId = req.userId;
        const behaviors = await UserBehavior.find({ userId })
            .populate('productId', 'name image category offerPrice')
            .sort({ timestamp: -1 })
            .limit(100);

        return res.json({ success: true, behaviors });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
