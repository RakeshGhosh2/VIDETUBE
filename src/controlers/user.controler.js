import { asynchandler } from "../utils/asynchandeler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apierror.js";
import { uploadoncloudinary, deletefromcloudinary } from '../utils/cloudinary.js';
import { apiresponce } from "../utils/Apiresponce.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

const generateraccessandrefreshtoken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accesstoken = user.generateaccesstoken()
        const refreshtoken = user.generaterefreshtoken()
        user.refreshtoken = refreshtoken
        await user.save({ validateBeforeSave: false })
        return { accesstoken, refreshtoken }
    } catch (error) {
        throw new ApiError(400, "something went wrong while generating accesstoken and refreshtoken")

    }
}

const registeruser = asynchandler(async (req, res) => {
    const { fullname, username, email, password } = req.body

    // console.log("req.body:", req.body)

    console.log("req.body: ", req.body);
    console.log("req.file: ", req.file);


    //validation 

    if ([fullname, username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "all field are required");
    }

    //check if user already exist

    const userexist = await User.findOne({ $or: [{ username }, { email }] });
    if (userexist) {
        throw new ApiError(409, "user with email or username already exists");
    }
    // handel images
    const avatarlocalpath = req.files?.avatar?.[0]?.path;
    const coverlocalpath = req.files?.coverimage?.[0]?.path;




    if (!avatarlocalpath) {
        throw new ApiError(409, "Avatar fill is missing");
    }


    let avatar;
    try {
        avatar = await uploadoncloudinary(avatarlocalpath)
        console.log("uploaded avatar", avatar)
    } catch (error) {
        console.log("Error uploading avatar", error)
        throw new ApiError(500, "failed to uploade avatar")
    }

    let coverimage;
    try {
        coverimage = await uploadoncloudinary(coverlocalpath)
        console.log("uploaded coverimage", coverimage)

    } catch (error) {
        console.log("Error uploading coverimage", error)
        throw new ApiError(500, "failed to uploade coverimage")
    }

    try {
        const user = await User.create({
            fullname,
            username: username,
            email: email,
            password: password,
            avatar: avatar.secure_url,
            coverimage: coverimage.secure_url || ""

        })

        const creatuser = await User.findById(user._id).select(
            "-password -updatedAt -createdAt -__v"
        )

        if (!creatuser) {
            throw new ApiError(404, "user not found")
        }

        return res.status(201).json(new apiresponce(201, creatuser, "user registration succesfully"))
    } catch (error) {
        console.log("user registration error", error)

        if (avatar) {
            await deletefromcloudinary(avatar.public_id)
        }
        if (coverimage) {
            await deletefromcloudinary(coverimage.public_id)
        }

        throw new ApiError(404, "something went wrong while registering a user and images were  deleted")
    }
})


const loginuser = asynchandler(async (req, res) => {
    const { email, username, password } = req.body
    if (!email) {
        throw new ApiError(400, "email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (!user) {
        throw new ApiError(404, "user not found")
    }
    const ispasswordvaild = await user.ispasswordcorrect(password)
    if (!ispasswordvaild) {
        throw new ApiError(404, "password is incorrect")
    }
    const { accesstoken, refreshtoken } = await generateraccessandrefreshtoken(user._id)

    const loggerinuser = await User.findById(user._id)
        .select("-password -refreshToken");

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",

    }

    return res.status(200)
        .cookie("accessToken", accesstoken, option)
        .cookie("refreshToken", refreshtoken, option)
        .json(new apiresponce(200,
            { user: loggerinuser, accesstoken, refreshtoken },
            "user logged in succesfully"))



})

const logoutuser = asynchandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshtoken: undefined,
            }
        },
        { new: true }

    )
    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }
    return res
        .status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(new apiresponce(200, {}, "user logged out succesfully"))
})

const refreshaccesstoken = asynchandler(async (req, res) => {
    const incomingrefretoken = req.cookies.refreshtoken || req.body.refreshtoken
    if (!incomingrefretoken) {
        throw new ApiError(401, "refresh token is required")
    }

    try {
        const decodedtoken = jwt.verify(
            incomingrefretoken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedtoken?._id)
        if (!user) {
            throw new ApiError(404, "invalid refresh token")
        }

        if (incomingrefretoken !== user?.refreshtoken) {
            throw new ApiError(401, "invalid refresh token")
        }
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        }

        const { accesstoken, refreshtoken: newrefreshtoken } =
            await generateraccessandrefreshtoken(user._id)
        return res.
            status(200)
            .cookie("accessToken", accesstoken, options)
            .cookie("refreshToken", newrefreshtoken, options)
            .json(new apiresponce(200,
                {
                    accesstoken,
                    refreshtoken: newrefreshtoken
                },
                "refresh token generated successfully"
            ))

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating new accesstoken")

    }
})

const changecurrentpassword = asynchandler(async (req, res) => {
    const { oldpassword, newpassword } = req.body
    const user = await User.findById(req.user?._id)

    const ispasswordvalid = await user.istruepassword(oldpassword)
    if (!ispasswordvalid) {
        throw new ApiError(401, "old password is not valid")
    }
    user.password = newpassword
    await user.save({ validateBeforeSave: false })
    return res.
        status(200)
        .json(new apiresponce(200, {}, "password changed successfully"))


})

const getcurrentuser = asynchandler(async (req, res) => {
    return res.
        status(200)
        .json(new apiresponce(200, req.user, "user data fetched successfully"))

})

const updateaccountdetails = asynchandler(async (req, res) => {
    const { fullname, email } = req.body
    if (!fullname || !email) {
        throw new ApiError(400, "fullname and email are required")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullname,
                email: email
            }
        },
        { new: true }
    ).select("-password -refreshToken")
    return res.
        status(200)
        .json(new apiresponce(200, user, "account details updated successfully"))




})

const updateuseravater = asynchandler(async (req, res) => {
    const avaterlocalpath = req.file?.path
    if (!avaterlocalpath) {
        throw new ApiError(400, "avater is required")
    }
    const avater = await uploadoncloudinary(avaterlocalpath)
    if (!avater.url) {
        throw new ApiError(500, "something went wrong while uploading avater")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avater: avater.url
            }
        },
        { new: true }
    ).select("-password -refreshToken")
    return res.
        status(200)
        .json(new apiresponce(200, user, "avater updated successfully"))



})

const updateusercoverimage = asynchandler(async (req, res) => {
    const coverimagepath = req.file?.path
    if (!coverimagepath) {
        throw new ApiError(400, "coverimage is required")
    }
    const coverimage = await uploadoncloudinary(coverimagepath)
    if (!coverimage.url) {
        throw new ApiError(500, "something went wrong while uploading coverimage")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverimage: coverimage.url
            }
        },
        { new: true }
    ).select("-password -refreshToken")
    return res.
        status(200)
        .json(new apiresponce(200, user, "coverimage updated successfully"))


})

const getuserchannelprofile = asynchandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new ApiError(400, "username is required")
    }

    const channel = await User.aggregate(
        [
            {
                $match: {
                    username: username?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subcription",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subcribers"
                }
            },
            {
                $lookup: {
                    from: "subcription",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscriberto"
                }
            },
            {
                $addFields: {
                    subscriberscount: {
                        $size: "$subcribers"
                    },
                    channelssubscribertocount: {
                        $size: "$subscriberto"
                    },
                    issubscribed: {
                        $cond: {
                            if: { $in: ["$subscriber.subscriber", req.user._id] },
                            then: true,
                            else: false
                        }
                    }
                }
            },{
                $project: {
                    fullname:1,
                    username:1,
                    subscriberscount:1,
                    channelssubscribertocount:1,
                    avatar:1,
                    issubscribed:1,
                    coverimage:1,
                    email:1
                }    

            }
        ]
    )
    if( !channel?.length){
        throw new Error('Channel not found')
    }
    return res
    .status (200).
    json(new apiresponce(200,
        channel[0], " channel profile fatched successfully"))
    


})

const getwatchhistory = asynchandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: 'video',
                localField: 'watchhistory',
                foreignField: '_id',
                as: 'watchhistory',
                pipeline:[
                    {
                        $lookup:{
                            from: "user",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },{
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }

    ])
    return res
    .status(200)
    .json(new apiresponce(200,
        user[0]?. watchhistory,
        "get watch history successfully",
    ))

})

export {
    registeruser,
    loginuser,
    refreshaccesstoken,
    logoutuser,
    updateuseravater,
    updateusercoverimage,
    updateaccountdetails,
    getcurrentuser,
    changecurrentpassword,
    getuserchannelprofile,
    getwatchhistory
}

