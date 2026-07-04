import jwt from "jsonwebtoken";
import type {Request, Response, NextFunction} from "express";
import type {UserJwtPayload} from "../types/jwt.js";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader= req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const token= authHeader.split(" ")[1];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
        message: "Unauthorized",
    });
}

    try {
        const decoded= jwt.verify(token as string, process.env.JWT_SECRET!) as UserJwtPayload;
        req.user= decoded as {userId: string;};
        next();
    } catch {
        return res.status(401).json({
            message: "Invalid token",
        });
    }
};

