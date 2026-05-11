import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import stripe from "stripe";
import User from "../models/User.js";
import UserBehavior from "../models/UserBehavior.js";

// Helper: ghi purchase events vào UserBehavior
const trackPurchaseEvents = async (userId, items) => {
    try {
        const events = items.map(item => ({
            userId,
            productId: item.product,
            eventType: 'purchase',
            weight: 3.0,
            timestamp: new Date(),
        }));
        await UserBehavior.insertMany(events);
    } catch (err) {
        console.error('Lỗi ghi nhận hành vi mua hàng:', err.message);
    }
};

// Helper: lấy snapshot địa chỉ từ Address document
const getAddressSnapshot = async (addressId) => {
    try {
        const addr = await Address.findById(addressId);
        if (!addr) return {};
        return {
            name: `${addr.firstname} ${addr.lastname}`.trim(),
            phone: addr.phone,
            street: addr.street,
            city: addr.city,
            state: addr.state,
            zipcode: String(addr.zipcode),
            country: addr.country,
        };
    } catch (error) {
        console.error('Lỗi lấy địa chỉ giao hàng:', error.message);
        return {};
    }
};

//Place order COD: /api/order/cod
export const placeOrderCOD = async (req, res) => {
    try {
        const { items, address } = req.body;
        const userId = req.userId;
        if (!address || !items || items.length === 0) {
            return res.json({ success: false, message: 'Dữ liệu không hợp lệ' });
        }

        // Tính tiền VÀ lưu price_at_purchase cho từng item
        let amount = 0;
        const itemsWithPrice = await Promise.all(items.map(async (item) => {
            const product = await Product.findById(item.product);
            if (!product) throw new Error(`Sản phẩm không tồn tại: ${item.product}`);
            const unitPrice = product.offerPrice;
            amount += unitPrice * item.quantity;
            return {
                ...item,
                price_at_purchase: unitPrice,   // Chốt giá tại thời điểm đặt
            };
        }));

        // Add Tax charge (2%)
        amount += Math.floor(amount * 0.02);

        // Snapshot địa chỉ giao hàng
        const shippingAddress = await getAddressSnapshot(address);

        await Order.create({
            userId,
            items: itemsWithPrice,
            amount,
            address,
            shippingAddress,
            paymentType: 'COD',
        });
        // Track purchase behavior
        await trackPurchaseEvents(userId, items);
        return res.json({ success: true, message: 'Đặt hàng thành công' });
    } catch (error) {
        console.error('placeOrderCOD error:', error.message);
        return res.json({ success: false, message: error.message });
    }
}

//Place order Stripe: /api/order/stripe
export const placeOrderStripe = async (req, res) => {
    try {
        const { items, address } = req.body;
        const userId = req.userId;
        const { origin } = req.headers;

        if (!address || !items || items.length === 0) {
            return res.json({ success: false, message: 'Dữ liệu không hợp lệ' });
        }

        let productData = [];
        let amount = 0;

        // Tính tiền VÀ lưu price_at_purchase cho từng item
        const itemsWithPrice = await Promise.all(items.map(async (item) => {
            const product = await Product.findById(item.product);
            if (!product) throw new Error(`Sản phẩm không tồn tại: ${item.product}`);
            const unitPrice = product.offerPrice;
            amount += unitPrice * item.quantity;
            productData.push({
                name: product.name,
                price: unitPrice,
                quantity: item.quantity,
            });
            return {
                ...item,
                price_at_purchase: unitPrice,   // Chốt giá tại thời điểm đặt
            };
        }));

        // Add Tax charge (2%)
        amount += Math.floor(amount * 0.02);

        // Snapshot địa chỉ giao hàng
        const shippingAddress = await getAddressSnapshot(address);

        const order = await Order.create({
            userId,
            items: itemsWithPrice,
            amount,
            address,
            shippingAddress,
            paymentType: 'Online',
        });


        //Stripe gateway Initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        //Create line items for stripe

        const line_items = productData.map((item) => {
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.floor((item.price + item.price * 0.02) / 24700 * 100)
                },
                quantity: item.quantity,
            }
        })

        //create session
        const session = await stripeInstance.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            }
        })

        return res.json({ success: true, url: session.url });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

//Stripe webhook to verify payment: /stripe
export const stripeWebhooks = async (req, res) => {
    //Stripe gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    //Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            //Getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId, userId } = session.data[0].metadata;
            //Mark payment as paid
            await Order.findByIdAndUpdate(orderId, { isPaid: true })
            //Clear user cart
            await User.findByIdAndUpdate(userId, { cartItems: [] });
            // Track purchase behavior
            const order = await Order.findById(orderId);
            if (order) await trackPurchaseEvents(userId, order.items);
            break;
        }
        case 'checkout.session.completed': {
            // Lấy metadata trực tiếp từ session (không cần list theo payment_intent)
            const completedSession = event.data.object;
            const { orderId, userId } = completedSession.metadata || {};
            if (orderId) {
                //Mark payment as paid
                await Order.findByIdAndUpdate(orderId, { isPaid: true });
                //Clear user cart
                if (userId) await User.findByIdAndUpdate(userId, { cartItems: [] });
            }
            break;
        }

        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            //Getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId } = session.data[0].metadata;
            await Order.findByIdAndDelete(orderId);
            break;
        }

        default:
            console.error(`Loại sự kiện chưa xử lý: ${event.type}`);
            break;
    }
    res.json({ received: true });
}



//Get orders by User ID: /api/order/user
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await Order.find({
            userId,
            $or: [{ paymentType: 'COD' }, { isPaid: true }]
        })
        .populate('items.product', 'name image price offerPrice brand category') // Chỉ lấy các field cần thiết
        .sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


//Get all orders (for seller / admin): /api/order/seller
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ paymentType: 'COD' }, { isPaid: true }]
        })
        .populate('items.product', 'name image price offerPrice brand category')
        .sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
