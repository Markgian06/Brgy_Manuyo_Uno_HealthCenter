import express from "express";
import userToken from "../Middleware/userToken";
import { getUserData } from "../Controllers/userData";


const userRouter = express.Router();

userRouter.get('/data', userToken, getUserData);
userRouter.get('/profile', userToken, getUserData);

export default userRouter;