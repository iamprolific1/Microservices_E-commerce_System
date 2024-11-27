import { body } from 'express-validator';

export const validateUser = [
    body('email').isEmail().withMessage('please provide a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('password must be atleast 6 characters long')
]