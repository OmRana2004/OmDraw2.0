import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prismaClient } from "@repo/db/client";
import { CreateUserSchema } from "@repo/common/types";

export const signup = async (req: Request, res: Response) => {
    const parsed = CreateUserSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid input data"
        });
    }

    try {
        const { email, password, name } = parsed.data;

        const existingUser = await prismaClient.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user  = await prismaClient.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                photo: ""
            },
        });

        return res.status(201).json({
            message: "User created successfully",
            userId: user.id
        });
    } catch {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}