import jwt from 'jsonwebtoken';
import { User } from '../models/user.models.js';
import { ApiError } from '../utils/apierror.js';
import { asynchandler } from '../utils/asynchandeler.js';


export const verifyjwt=asynchandler(async(req,__dirname,next)=>{
    const token=req. cookies.accesstoken||req.header("Authorization")?.replace("Bearer ","")
    if(!token){
        throw new ApiError("Unauthorized",401)
    }

    try {
        const decodedtoken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedtoken?.id). select("-password -refreshToken")
        if(!user){
            throw new ApiError("Unauthorized",401)
        }
        req.user=user
        next()

        
    } catch (error) {
        throw new ApiError(401,error?.message|| "invalide access token")
        
    }
})