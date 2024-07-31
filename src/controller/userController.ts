import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import User from "../model/userSchema";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

const registerRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = await req.body;
    // validation
    if (!username || !email || !password) {
      const error = createHttpError(400, "All Fields Required");
      return next(error);
    }
    // user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      const error = createHttpError(401, "User already exists");
      return next(error);
    }
    // hash password
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashPassword,
    });
    const user = await newUser.save();
    if (user) {
      const token = sign({ sub: newUser._id }, config.jwt_secret as string, {
        expiresIn: "1d",
      });
      return res.status(201).json({
        message: "User registered successfully",
        token: token,
        userID: user._id,
      });
    } else {
      const error = createHttpError(400, "Failed to register");
      return next(error);
    }
  } catch (error) {
    return res.status(500).json({
      message: "Failed to register",
    });
  }
};

const loginRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = await req.body;
    // validation
    if (!email || !password) {
      const error = createHttpError(400, "All Fields Required");
      return next(error);
    }
    const user = await User.findOne({ email });
    if (!user) {
      const error = createHttpError(404, "User Not Found");
      return next(error);
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      const err = createHttpError(400, "Invalid Credentials");
      return next(err);
    }
    const token = sign({ sub: user._id }, config.jwt_secret as string, {
      expiresIn: "1d",
    });
    return res.status(200).json({ message: "Login Successfully", token, userID: user._id, });
  } catch (error) {
    const err = createHttpError(500, "Login Failed");
    next(err);
  }
};

export { registerRoute, loginRoute };
