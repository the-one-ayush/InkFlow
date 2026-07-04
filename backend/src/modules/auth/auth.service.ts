import prisma from "../../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (name: string, email: string, password: string) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword= await bcrypt.hash(password, 10);

    const user= await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });

    return user;
};


export const loginUser= async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
        select: {
            id: true,
            name: true,
            email: true,
            password: true,
        },
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isMatch= await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    const token= jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET!, {expiresIn: "7d",});

    return {token, user: {id: user.id, name: user.name, email: user.email,},};
};

export const getCurrentUser = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};