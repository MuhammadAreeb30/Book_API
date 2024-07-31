import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
  userId: string;
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization");
    console.log(token);
    if (!token) {
      const errr = createHttpError(401, "Authentication required");
      return next(errr);
    }
    const parsedToken = token.split(" ")[1];
    const decodedToken = jwt.verify(parsedToken, config.jwt_secret as string);
    const _req = req as AuthRequest;
    _req.userId = decodedToken.sub as string;
    next();
  } catch (error) {
    const err = createHttpError(401, "Token expired");
    next(err);
  }
};

export default authenticate;
