import mongoose from "mongoose";
import { DB_NAME } from "../../constants";


const connectDB = async () => {
    try {
        const mongoUri = process.env?.['MONGO_URI'];
        if (!mongoUri) {
            console.error("MONGO_URI environment variable is not set");
            process.exit(1);
        }
        const connectionInstance = await mongoose.connect(`${mongoUri}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

export default connectDB