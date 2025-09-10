import express from "express";
import userToken from "../Middleware/userToken.js";
import { getUserData, getPatientProfile, checkAuth } from "../Controllers/userData.js";


const userRouter = express.Router();

userRouter.get('/data', userToken, getUserData);
userRouter.get('/profile', userToken, getPatientProfile);
userRouter.get('/check-auth', checkAuth);

export default userRouter;