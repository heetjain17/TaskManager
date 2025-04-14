import { User } from "../models/user.models.js";
import { ApiError, ApiSuccess } from "../utils/api-error.js";
import jwt from 'jsonwebtoken'
import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
})
const isLoggedIn = async(req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken
        const refreshToken = req.cookies.refreshToken
        
        if(!accessToken){
            if(!refreshToken){
                next(new ApiError(500, 'Unauthorized access, Log In again', error))
            }
            
            const refreshDecoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            
            const user = await User.findOne({_id: refreshDecoded._id} )
            if(!user){
                return next(new ApiError(400, 'User not found'))
            }
            
            const newAccessToken = user.generateAccessToken()
            const newRefreshToken = user.generateRefreshToken()

            user.refreshToken = newRefreshToken
            await user.save();
            
            const cookieOptions = {
                httpOnly: true,
                sameSite: 'strict',
                path: '/',
                secure: false // change to true while deploying
            }

            res.cookie('accessToken', newAccessToken, cookieOptions)
            res.cookie('refreshToken', newRefreshToken, cookieOptions)
            req.user = acccessDecoded;
            next();
        }else{
            const accessDecoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        
            const user = await User.findOneAndUpdate({_id: accessDecoded._id})
            if(!user){
                return next(new ApiError(400, 'User not found'))
            }
            
            const newAccessToken = user.generateAccessToken()
            const newRefreshToken = user.generateRefreshToken()

            user.refreshToken = newRefreshToken
            await user.save();

            const cookieOptions = {
                httpOnly: true,
                sameSite: 'strict',
                path: '/',
                secure: false // change to true while deploying
            }

            res.cookie('accessToken', newAccessToken, cookieOptions)
            res.cookie('refreshToken', newRefreshToken, cookieOptions)
            req.user = accessDecoded

            next();
        }
    } catch (error) {
        next(new ApiError(500, 'User not Logged in', error))
    }
}
export default isLoggedIn