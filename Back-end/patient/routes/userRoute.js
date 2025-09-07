import express from "express";
import userToken from "../Middleware/userToken.js";
import { getUserData, getPatientProfile } from "../Controllers/userData.js";


const userRouter = express.Router();

userRouter.get('/data', userToken, getUserData);
userRouter.get('/profile', userToken, getPatientProfile);

export default userRouter;