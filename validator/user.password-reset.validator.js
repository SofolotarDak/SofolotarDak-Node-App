// External Inputs
const { body } = require('express-validator');

// Internal Inputs
const userVerificationCodeInfo = require('../models/user.verification-code.model');

// Login validation array
exports.passwordResetValidator = [
    body('verificationCode')
        .not()
        .isEmpty()
        .withMessage('Fill the verification code!')
        .trim()
        .custom(async (verificationCode, { req }) => {
            const { email } = req.body;
            const userEmail = await userVerificationCodeInfo.findOne({
                user_email: email,
            });

            if (userEmail.verificationCode != verificationCode) {
                throw new Error('Verification code incorrect!');
            }

            // Indicates the success of this synchronous custom validator
            return true;
        }),

    body('email')
        .not()
        .isEmpty()
        .withMessage(
            'To reset your password first input your registered email.'
        )
        .isEmail()
        .withMessage('A registered valid email address is mandatory!')
        .toLowerCase()
        .trim()
        .custom(async (email) => {
            const userVerificationEmail =
                await userVerificationCodeInfo.findOne({ user_email: email });

            if (
                !userVerificationEmail ||
                userVerificationEmail.user_email !== email
            ) {
                return Promise.reject("Your account couldn't be found!");
            }
        }),

    body('new_password')
        .not()
        .isEmpty()
        .withMessage('Password must be given!')
        .isLength({ min: 6 })
        .withMessage('Passwords must be longer than 5 characters!'),

    body('confirm_new_password')
        .not()
        .isEmpty()
        .withMessage('Confirm your password!')
        .custom(async (confirm_new_password, { req }) => {
            const { new_password } = req.body;

            if (confirm_new_password != new_password) {
                throw new Error("Password doesn't match!");
            }

            // Indicates the success of this synchronous custom validator
            return true;
        }),
];
