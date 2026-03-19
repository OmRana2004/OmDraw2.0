import { Request , Response } from "express";
import { prismaClient } from "@repo/db";
import { CreateRoomSchema } from "@repo/common/types";

export const createRoom = async (req: Request, res: Response) => {
    const parsed = CreateRoomSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid room data"
        });
    }

    if (!req.userId) {
        return res.status(403).json({
            message: "User not authenticated"
        });
    }

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsed.data.name,
                adminId: req.userId,
            },
        });

        return res.status(201).json({
            roomId: room.id
        });
    } catch {
        return res.status(409).json({
            message: "Room already exists"
        });
    }
}
