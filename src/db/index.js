import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        // --- DEBUG LOGS (Add these lines) ---
        console.log("----------------DEBUG START----------------");
        console.log("1. Original URI:", process.env.MONGODB_URI);
        console.log("2. DB Name:", DB_NAME);
        
        let uri = process.env.MONGODB_URI || ""; // Fallback to empty string if undefined
        if (uri.endsWith("/")) {
            uri = uri.slice(0, -1);
        }
        
        console.log("3. Fixed URI:", uri);
        console.log("4. Final Connection String:", `${uri}/${DB_NAME}`);
        console.log("----------------DEBUG END------------------");
        // ------------------------------------

        const connectionInstance = await mongoose.connect(`${uri}/${DB_NAME}`);
        console.log(`\n Connected to MongoDB !! DB HOST: ${connectionInstance.connection.host} \n`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

export default connectDB;