import express from "express";
import { registerUser, loginUser, refreshToken, getAllUsers, getUser, updateUserData } from "../controllers/user.controller";
import { authenticate, adminOnly } from "../middlewares/authMiddleware";
import { validateUser } from "../validators/userValidator";

const router = express.Router();

router.post('/registerUser', validateUser, registerUser);
router.post('/loginUser', validateUser, loginUser);
router.post('/refresh-token', authenticate, refreshToken);
router.get('/getAllUsers', authenticate, adminOnly, getAllUsers);
router.get('/getUser/:id', authenticate, adminOnly, getUser);
router.post('/updatedata/:id', authenticate, adminOnly, updateUserData);

export default router;