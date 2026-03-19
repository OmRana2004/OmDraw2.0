import { Request, Response } from "express";
import { prismaClient } from "@repo/db";

export const getRoom = async (
  req: Request<{ slug: string }>,
  res: Response
) => {
  try {
    const room = await prismaClient.room.findUnique({
      where: { slug: req.params.slug }
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    return res.json({ room });
  } catch {
    return res.status(500).json({
      message: "Failed to fetch room"
    });
  }
};