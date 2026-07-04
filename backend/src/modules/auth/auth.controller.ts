import type {Request, Response} from "express";
import {registerUser, loginUser, getCurrentUser} from "./auth.service.js";

export const register = async (req: Request, res: Response) => {
    const { name, email, password}= req.body;

    try {
        const user= await registerUser(name, email, password);

        return res.status(201).json({
            message: "Registration successful",
            user,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message==="Email already exists") {
                return res.status(409).json({
                    message: error.message,
                });
            }
        }

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const login= async (req: Request, res: Response) => {
    const {email, password}= req.body;
    try {
        const data = await loginUser(email, password);

        return res.status(200).json({
            message: "Login successful",
            ...data,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message==="Invalid email or password") {
                return res.status(401).json({
                    message: error.message,
                });
            }
        }

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}

export const me= async (req: Request, res: Response) => {
    try {
        const user= await getCurrentUser(req.user!.userId);

        return res.status(200).json({
            user,
        });
    }
    catch (error) {

        if (error instanceof Error && error.message==="User not found") {
            return res.status(404).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};