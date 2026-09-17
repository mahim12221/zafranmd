import express from 'express'
import { loginUser, registerUser, adminLogin, getAdminProfile, updateAdminProfile, getUserProfile, updateUserProfile, getAllUsers } from '../controllers/userController.js'
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.get('/admin/profile', adminAuth, getAdminProfile)
userRouter.post('/admin/update-profile', upload.single('profilePic'), adminAuth, updateAdminProfile)
userRouter.get('/profile', authUser, getUserProfile)
userRouter.post('/profile', authUser, getUserProfile)
userRouter.post('/update-profile', upload.single('profilePic'), authUser, updateUserProfile)
userRouter.get('/admin/all-users', adminAuth, getAllUsers)
userRouter.post('/admin/all-users', adminAuth, getAllUsers)

export default userRouter;