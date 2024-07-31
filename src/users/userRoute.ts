import express from "express";
import { registerRoute, loginRoute } from "../controller/userController";

const userRouter = express.Router();

userRouter.post("/register", registerRoute);
userRouter.post("/login", loginRoute);

export default userRouter;