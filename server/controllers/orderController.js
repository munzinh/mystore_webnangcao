import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from "../models/User.js";
import { request } from "express";


//Place order COD: /api/order/cod
export const placeOrderCOD = async (req, res) => {
    try {
        const { items, address } = req.body;
        const userId = req.userId;
        if(!address || items.length === 0){
            return res.json({success: false, message: 'Dữ liệu không hợp lệ'});
        }
        // Calculate Amout Using Items
        let amount = await items.reduce(async(acc, item) => {
            const product = await Product.findById(item.product);
            return (await acc + (product.offerPrice * item.quantity));
    }, 0)

        // Add Tax charge (2%)
        amount += Math.floor(amount * 0.02);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: 'COD',
        })
        return res.json({success: true, message: 'Đặt hàng thành công'});
    }catch (error) {
        return res.json({success: false, message: error.message });
    }
}
//Place order Stripe: /api/order/stripe
export const placeOrderStripe = async (req, res) => {
    try {
        const { items, address } = req.body;
        const userId = req.userId;
        const {origin} = req.headers;

        if(!address || items.length === 0){
            return res.json({success: false, message: 'Dữ liệu không hợp lệ'});
        }

        let productData = []
        // Calculate Amout Using Items
        let amount = await items.reduce(async(acc, item) => {
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            });
            return (await acc + (product.offerPrice * item.quantity));
    }, 0)

        // Add Tax charge (2%)
        amount += Math.floor(amount * 0.02);

        const order =await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: 'Online',
        });


    //Stripe gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    //Create line items for stripe

    const line_items = productData.map((item)=>{
        return{
            price_data:{
                currency: 'usd',
                product_data:{
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
        metadata:{
            orderId: order._id.toString(),
            userId,
        }
    })

        return res.json({success: true, url: session.url});
    }catch (error) {
        return res.json({success: false, message: error.message });
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
        )
    } catch (error) {
        res.status(400).send(`Webhook Error: ${error.message}`);
    }

    //Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            //Getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId, userId } = session.data[0].metadata;
            //Mark payment as paid
            await Order.findByIdAndUpdate(orderId, {isPaid:true})
            //Clear user cart
            await User.findByIdAndUpdate(userId, {cartItems: []}); 
            break;
        }
        case 'checkout.session.completed':{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            //Getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId, userId } = session.data[0].metadata;
            //Mark payment as paid
            await Order.findByIdAndUpdate(orderId, {isPaid:true})
            //Clear user cart
            await User.findByIdAndUpdate(userId, {cartItems: []}); 
            break;
        }

        case 'payment_intent.payment_failed':{
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
            console.error(`Unhandled event type ${event.type}`);
            break;
    }
    res.json({received: true});
}



//Get orders by User ID: /api/order/user
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await Order.find({
            userId,
            $or: [{paymentType: 'COD'}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});
        res.json({success: true, orders});
    } catch (error) {
        res.json({success: false, message: error.message });
    }
}


//Get all orders (for seller / amdmin)  : /api/order/seller

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{paymentType: 'COD'}, {isPaid: true}]
        }).populate("items.product address");
        res.json({success: true, orders});
    } catch (error) {
        res.json({success: false, message: error.message });
    }
}
