import mongoose from "mongoose";

const connectDB= async()=>{
    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME || "Greencart";

    if (!mongoUri) {
        throw new Error("MONGODB_URI is not configured");
    }

    try {
        mongoose.connection.on('connected',()=> console.log("Database Connected")
        );
        await mongoose.connect(mongoUri, { dbName })
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

export default connectDB;
