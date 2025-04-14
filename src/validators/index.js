import {body} from 'express-validator'

const userRegistrationValidator = () => {
    return [
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Email is invalid'),
        body('username')
            .trim()
            .notEmpty().withMessage('username is required')
            .isLength({min: 3}).withMessage('Username should contain 3-13 characters')
            .isLength({max: 13}).withMessage('Username should contain 3-13 characters'),
        body('password')
            .trim()
            .notEmpty().withMessage('password is required')
            .isLength({min: 6}).withMessage('Password should contain 6-30 characters')
            .isLength({max: 30}).withMessage('Password should contain 6-30 characters'),
    ]
}

const userLoginValidator = () => {
    return [
        body('email')
            .isEmail().withMessage('Email is invalid'),
        body('password')
            .notEmpty().withMessage('Password cannot be empty ')
    ]
}

const forgotPasswordValidator = () => {
    return [
        body('newPassword')
        .trim()
        .notEmpty().withMessage('password is required')
        .isLength({min: 6}).withMessage('Password should contain 6-30 characters')
        .isLength({max: 30}).withMessage('Password should contain 6-30 characters'),
    ]
}
export {userRegistrationValidator, 
    userLoginValidator,
    forgotPasswordValidator,
}