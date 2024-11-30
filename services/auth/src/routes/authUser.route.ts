import express from 'express';
import { loginUser, refreshToken, Verify_Token_To_Authenticate_User } from '../controller/authController';

const router = express.Router();

router.post('/login', loginUser);
router.post('/refresh_token', refreshToken)
router.post('/verify_token', Verify_Token_To_Authenticate_User);

export default router;