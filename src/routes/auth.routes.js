import {Router} from 'express'
import {getCurrentUser, 
    loginUser, 
    logoutUser, 
    registerUser, 
    resendEmailVerification, 
    verifyEmail, 
    forgotPasswordRequest, 
    resetForgottenPassword,
    refreshAccessToken,
    changeCurrentPassword
} 
    from '../controllers/auth.controllers.js'
import { validate } from '../middlewares/validator.middleware.js'
import { userRegistrationValidator, userLoginValidator, forgotPasswordValidator } from '../validators/index.js'
import isLoggedIn from '../middlewares/isLoggedIn.js'

const router = Router()

router
    .route('/register')
    .post(userRegistrationValidator(), validate, registerUser) // factory pattern
router
    .route('/verify/:token')
    .get(verifyEmail)
router
    .route('/login')
    .post(userLoginValidator(), validate, loginUser)
router
    .route('/logout')
    .get(isLoggedIn, logoutUser)
router
    .route('/profile')
    .get(isLoggedIn, getCurrentUser)
router
    .route('/resendVerificationEmail')
    .post(resendEmailVerification)
router
    .route('/forgotPasswordRequest')
    .post(forgotPasswordRequest)
router
    .route('/resetPassword/:token')
    .post(forgotPasswordValidator(), validate, resetForgottenPassword)
router
    .route('/refreshAccessToken')
    .get(refreshAccessToken)
router
    .route('/changePassword')
    .post(forgotPasswordValidator(), validate, changeCurrentPassword)
    
export default router 


