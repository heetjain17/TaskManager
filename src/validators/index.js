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
            .isLength({max: 3}).withMessage('Username should contain 3-13 characters'),
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
export {userRegistrationValidator, userLoginValidator}