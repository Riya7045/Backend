import {asyncHandler} from '../utils/asyncHandler.js';
import{ApiError} from "../utils/ApiError.js";
import {User} from '../models/user.model.js';
import { uploadCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';



const generateAccessAndRefreshToken = async(userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshTokens=refreshToken;
        //validateBeforeSave:false to skip other field validations
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    }
    catch(error){
        throw new ApiError(500,"something went wrong while generating refresh and access tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Registration logic here

    //1. get user details from frontend
    const{fullName, email, username,password}=req.body
    //console.log("email:",email);
    //2. validation-not empty

    // if(fullName===""){
    //     throw new ApiError(400,"Fullname is required")
    // }

    if(
        [fullName,email,username,password].some((field)=>
        field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    }
    

    //3. check if user already exists:username,email
    const existingUser= await User.findOne({
        $or:[{username},{email}]
    })
    if(existingUser){
        throw new ApiError(409,"User already exists with this email or username")
    }
    

    //4. check for images
    const avatarLocalPath=req.files?.avatar?.[0]?.path
    //const coverImageLocalPath=req.files?.coverImage?.[0]?.path

    //coverImage is optional
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path
    }

    //5. upload them to cloudinary,avatar
    const avatarUrl= await uploadCloudinary(avatarLocalPath,"avatar")
    const coverImageUrl= await uploadCloudinary(coverImageLocalPath,"coverImage")
    if(!avatarUrl){
        throw new ApiError(400,"Avatar file is required")
    }

    //6. create user object - create entry in db
    const newUser= await User.create({
        fullName,
        email,
        username :username.toLowerCase(),
        avatar:avatarUrl.url,
        coverImage:coverImageUrl?.url||"",
        password

    })


    //7. remove password and refresh token field from response
    const createdUser= await User.findById(newUser._id).select
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

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data le aao
    const{email,username,password}=req.body

    // username or email hai ya nhi
    if(!email && !username){
        throw new ApiError(400,"Username or email is required")
    }

    // Here is an alternative of above code based on logic discussed in video:
    // if both email and username are missing

    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    //find the user
    const user = await User.findOne({
        $or:[
            {email},
            {username}
        ]
    })

    if(!user){
        throw new ApiError(404,"User not found")
    }

    //password check
    const isPasswordValid=await user.isPasswordMatch(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }


    //access and refresh token generate kro and dono ko user ko bhejo
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken");

    //send cookie me token ko
    const option={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new ApiResponse(200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
        
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};


