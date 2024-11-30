import express from "express";
import { registerUser, loginUser, refreshToken, getAllUsers, getUser, updateUserData } from "../controllers/user.controller";
import { authenticate, adminOnly } from "../middlewares/authMiddleware";
import { User } from "../models/User";
import { validateUser } from "../validators/userValidator";

const router = express.Router();

router.post('/registerUser', registerUser);
router.post('/loginUser', loginUser);
router.post('/refresh-token', authenticate, refreshToken);
router.get('/getAllUsers', authenticate, adminOnly, getAllUsers);
router.get('/getUser/:id', authenticate, adminOnly, getUser);
router.post('/updatedata/:id', authenticate, adminOnly, updateUserData);

router.post('/users/email', async(req, res)=> {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if(!user){
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
        return;
    } catch (error) {
        console.error("Error fetching user: ", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});

router.post('/users/userId', async(req, res)=> {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if(!user){
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
        return;
    } catch (error) {
        console.error("Error fetching user: ", error);
        res.status(500).json({ message: "Internal server error" });
        return
    }
})

export default router;