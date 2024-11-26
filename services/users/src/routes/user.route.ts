import express from "express";
import { registerUser, loginUser, refreshToken, getAllUsers, getUser, updateUserData } from "../controllers/user.controller";
import { authenticate, adminOnly } from "../middlewares/authMiddleware";

const router = express.Router();

router.post('/registerUser', registerUser);
router.post('/loginUser', loginUser);
router.post('/refresh-token', authenticate, refreshToken);
router.get('/getAllUsers', authenticate, adminOnly, getAllUsers);
router.get('/getUser/:id', authenticate, adminOnly, getUser);
router.post('/updatedata/:id', authenticate, adminOnly, updateUserData);

export default router;