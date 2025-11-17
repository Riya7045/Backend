import {asyncHandler} from '../utils/asyncHandler.js';
import{ApiError} from "../utils/ApiError.js";
import {user} from '../models/user.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
    // Registration logic here

    //1. get user details from frontend
    const{fullName, email, username}=req.body
    console.log("email:",email);
    //2. validation-not empty

    // if(fullName===""){
    //     throw new ApiError(400,"Fullname is required")
    // }

    if(
        [fullName,email,username],password.some((field)=>
        field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    }
    

    //3. check if user already exists:username,email
    const existingUser= user.findOne({
        $or:[{username},{email}]
    })
    if(existingUser){
        throw new ApiError(409,"User already exists with this email or username")
    }
    

    //4. check for images
    const avatarLocalPath=req.files?.avatar?.[0]?.path
    const coverImageLocalPath=req.files?.coverImage?.[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar image is required")
    }

    //5. upload them to cloudinary,avatar
    const avatarUrl= await uploadToCloudinary(avatarLocalPath,"avatar")
    const coverImageUrl= await uploadToCloudinary(coverImageLocalPath,"coverImage")
    if(!avatarUrl){
        throw new ApiError(400,"Avatar file is required")
    }

    //6. create user object - create entry in db
    const newUser= await user.create({
        fullName,
        email,
        username :username.toLowerCase(),
        avatar:avatarUrl.url,
        coverImage:coverImageUrl?.url||"",
        password,
    })


    //7. remove password and refresh token field from response
    const createdUser= await user.findById(newUser._id).select
    ("-password -refreshTokens");

    

    //8. check for user creation
    if(!createdUser){
        throw new ApiError(500,"User creation failed")
    }

    //9. return response
    return res.status(201).json(
        new ApiResponse("User created successfully",201,createdUser
    ));
    
})





export {registerUser};