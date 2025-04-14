import bcrypt from "bcryptjs";
import { User } from "../models/user.models.js";
import { ApiError, ApiSuccess } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationContent, sendMail, forgotPasswordContent } from "../utils/mail.js";
import crypto from "crypto"
import dotenv from "dotenv"
import jwt from 'jsonwebtoken'
import isLoggedIn from "../middlewares/isLoggedIn.js";
import { log } from "console";

dotenv.config();

const registerUser = asyncHandler(async (req, res, next) => {
  const { email, username, password} = req.body;

  try {
    const existingUser = await User.findOne({email})
    
    if(existingUser){
      return next(new ApiError(409, 'User already exists'))
    }
    
    const token = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = Date.now() + (10*60*60*1000)
        
    const user = await User.create({
      username: username,
      email: email,
      password: password,
      emailVerificationToken: token,
      emailVerificationExpiry: tokenExpiry,
    })
    
    if(!user){
      return next(new ApiError(400, 'User not created'))
    }

    const verificationUrl = `${process.env.BASE_URL}/api/v1/user/verify/${user.emailVerificationToken}`
    
    // send veirfication email
    await sendMail({
      email: user.email,
      subject: 'Email verifcation',
      mailGenContent: emailVerificationContent(user.username, verificationUrl)  
    })
    
    return res.status(200).json(
      new ApiSuccess(200, 'User registered successfully. Please verify your email.')
    )    

  } catch (error) {
    next(new ApiError(500, 'Registration failed', error))
  }
});

const verifyEmail = asyncHandler(async (req, res, next) => {
  try {
    const token = req.params.token

    if(!token){
      return next(new ApiError(404, 'User not found'))
    }

    // const user = await User.findOne({
    //   emailVerificationToken: token,
    //   emailVerificationExpiry: {$gt: Date.now()}
    // })

    // if(!user){
    //   return next(new ApiError(400, 'User not found'))
    // }

    // user.isEmailVerified = true

    // user.emailVerificationToken = null
    // user.emailVerificationExpiry = null
    
    // await user.save()

    const user = await User.findOneAndUpdate(
      {
        emailVerificationToken: token,
        emailVerificationExpiry: {$gt: Date.now()},
      },
      {
        $set: {
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpiry: null,
        }
      }
    )

    if(!user){
      return next(new ApiError(400, 'User not found'))
    }
    
    return res.status(200).json(
      new ApiSuccess(200, 'Email verified successfully')
    )    
  } catch (error) {
    next(new ApiError(500, 'Email verification failed', error))
  }
});

const loginUser = asyncHandler(async (req, res, next) => {
  const {email, password} = req.body;
  
  try {
    const user = await User.findOne({email})
    
    if(!user){
      return next(new ApiError(400, 'User not found'))
    }

    if(!user.isEmailVerified){
      return next(new ApiError(400, 'Verify your email first'))
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(!isPasswordValid){
      return next(new ApiError(400, 'Incorrect password'))
    }

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    
    user.refreshToken = refreshToken

    await user.save()

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      secure: false // change to true while deploying
    }

    res.cookie('accessToken', accessToken, cookieOptions)
    res.cookie('refreshToken', refreshToken, cookieOptions)

    return res.status(201).json(
      new ApiSuccess(201, 'Login successfull')
    )    
  } catch (error) {
    next(new ApiError(500, 'Login failed', error))
  }
});

const getCurrentUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findOne({email: req.user.email}).select('-password -refreshToken')
    
    if(!user){
      return next(new ApiError(404, 'User not found'))
    }

    return res.status(200).json(
      new ApiSuccess(200, 'User found', user)
    )  
  } catch (error) {
    next(new ApiError(500, 'Cannot get user profile', error))
  }
});

const logoutUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findOne({email: req.user.email}).select('-password -refreshToken')
    if(!user){
      return next(new ApiError(404, 'User not found'))
    }

    user.refreshToken = null

    await user.save()
    
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'strict',
      path: '/'
    }

    res.clearCookie( 'accessToken', cookieOptions)
    res.clearCookie( 'refreshToken', cookieOptions)

    return res.status(200).json(
      new ApiSuccess(200, 'Logout successfull')
    )   
  } catch (error) {
    next(new ApiError(500, 'Logout failed', error))
  }
});

const resendEmailVerification = asyncHandler(async (req, res, next, err) => {
  const {email} = req.body;
  console.log(email);
  
  try {
    const user = await User.findOne({email: email})
    console.log(user);
    
    if(!user){
      return next(new ApiError(404, 'User not found', err))
    }

    if(user.isEmailVerified){
      return next(new ApiError(400, 'Email is already verified', err))
    }
    
    // checking whether if emailVerification expiry is null or undefined
    if(user.emailVerificationExpiry && user.emailVerificationExpiry > Date.now()) {
      return next(new ApiError(400, 'Email already sent. Please wait or check spam', err))
    }
    
    const token = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = Date.now() + (10*60*60*1000)

    console.log(token);
    console.log(tokenExpiry);

    user.emailVerificationToken = token
    user.emailVerificationExpiry = tokenExpiry

    
    await user.save();

    const verificationUrl = `${process.env.BASE_URL}/api/v1/user/verify/${user.emailVerificationToken}`
    
    await sendMail({
      email: user.email,
      subject: 'Email verifcation',
      mailGenContent: emailVerificationContent(user.username, verificationUrl)  
    })

    console.log(verificationUrl);
    
    return res.status(201).json(
      new ApiSuccess(201, 'Verification Email Sent')
    )  
  } catch (error) {
    next(new ApiError(500, 'Resend email failed', error))
  }
});

const forgotPasswordRequest = asyncHandler(async (req, res, next, err) => {
  const {email} = req.body;

  try {
    const user = await User.findOne({email: email})
    
    if(!user){
      return next(new ApiError(404, 'User not found'))
    }

    const token = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = Date.now() + (4*60*60*1000)
    
    user.forgotPasswordToken = token
    user.forgotPasswordExpiry = tokenExpiry

    await user.save()

    const resetPasswordUrl = `${process.env.BASE_URL}/api/v1/user/resetPassword/${user.forgotPasswordToken}`
    
    await sendMail({
      email: user.email,
      subject: 'Reset password',
      mailGenContent: forgotPasswordContent(user.username, resetPasswordUrl)  
    })

    return res.status(201).json(
      new ApiSuccess(201, 'Reset password link sent')
    )    

  } catch (error) {
    next(new ApiError(500, 'Reset password request failed', error))
  }
});

const resetForgottenPassword = asyncHandler(async (req, res, next) => {
  const {newPassword} = req.body
  
  try {
    const token = req.params.token

    const user = await User.findOne({
      forgotPasswordToken: token,
      forgotPasswordExpiry: {$gt: Date.now()}
    })
    console.log(user);
    
    if(!user){
      return next(new ApiError(404, 'User not found'))
    }

    const samePassword = await bcrypt.compare(newPassword, user.password)

    if(samePassword){
      return next(new ApiError(400, 'Password cannot be same'))
    }

    user.password = newPassword

    user.forgotPasswordToken = null
    user.forgotPasswordExpiry = null

    await user.save()

    return res.status(200).json(
      new ApiSuccess(200, 'Password reset successfully')
    )
  } catch (error) {
    next(new ApiError(500, 'Reset password failed', error))
  }
});

const refreshAccessToken = asyncHandler(async (req, res, next, err) => {
  const refreshToken = req.cookies.refreshToken
  try {
    
    const refreshDecoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findOne({_id: refreshDecoded._id})
    
    if(!user){
      return next(new ApiError(404, 'User not found'))
    }

    const accessToken = user.generateAccessToken()
    const refershToken = user.generateRefreshToken()

    const cookieOptions = {httpOnly: true}

    res.cookie('accessToken', accessToken, cookieOptions)
    res.cookie('refershToken', refershToken, cookieOptions)

    user.refreshToken = refreshToken
    await user.save()

    return res.status(200).json(
      new ApiSuccess(200, 'Refresh Access Token Successfull')
    )    
  } catch (error) {
    next(new ApiError(500, 'Reset password failed', error))
  }

  //validation
});


const changeCurrentPassword = asyncHandler(async (req, res, next, err) => {
  const refreshToken = req.cookies.refreshToken
  const {oldPassword, newPassword} = req.body
  try {
    const user = await User.findOne({refreshToken: refreshToken})
    if(!user){
      return next(new ApiError(404, 'User not found', err))
    }
    
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password)
    if(!isPasswordValid){
      return next(new ApiError(400, 'Incorrect password', err))
    }

    const samePassword = await bcrypt.compare(oldPassword, newPassword)
    if(samePassword){
      return next(new ApiError(400, 'New password cannot be same as previous password', err))
    }

    user.password = newPassword

    await user.save()

    return res.status(201).json(
      new ApiSuccess(201, 'Password changed successfully')
    )   
  } catch (error) {
    next(new ApiError(500, 'Change password failed', error))
  }

});


export {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  verifyEmail,
};
