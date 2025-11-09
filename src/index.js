//require("dotenv").config({path:'./env'});
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})

connectDB()









/*
import express from "express";
const app = express();

( async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("Connected to MongoDB");
        app.once("error", (error) => {
            console.log("Error in MongoDB connection:", error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is running on port ${process.env.PORT}`);
        })


    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
})
    */