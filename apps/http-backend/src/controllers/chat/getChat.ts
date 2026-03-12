import { Request, Response } from "express";
import { prismaClient } from "@repo/db/client";

export const getChats = async (
  req: Request<{ roomId: string }>,
  res: Response
) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res.status(400).json({
      message: "Room ID is required"
    });
  }

  try {
    const messages = await prismaClient.chat.findMany({
      where: {
        roomId: roomId
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 50
    });

    return res.status(200).json({
      messages
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to load chats"
    });
  }
};