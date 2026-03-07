import { z } from "zod";

export const CreateUserSchema = z.object({
    email: z.string().min(3).max(500),
    password: z.string().min(6).max(100),
    name: z.string()
})

export const SigninUserSchema = z.object({
    email: z.string().min(3).max(100),
    password: z.string(),
})

export const CreateRoomSchema = z.object({
    name: z.string().min(3).max(100)
})