import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        
        // Connect to MongoDB
        // Using environment variable for MongoDB URI and database name
        //  from constants file
        // Connection instance - to log the host after connection
        const connectionInstance=await mongoose.connect
        (`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n Connected to MongoDB !! DB HOST:
        ${connectionInstance.connection.host} \n`); // Log the host of the connected database
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit process with failure
    }
}

export default connectDB;