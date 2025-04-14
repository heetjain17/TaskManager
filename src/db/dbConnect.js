import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config();

const mongoDB = process.env.MONGO_URI

const dbConnect = async () => {
    try {
        await mongoose.connect(mongoDB)
        console.log("MongoDB connected");
        
    } catch (error) {
        console.log("MongoDB connection failed", error);
        process.exit(1);
    }
}

export default dbConnect