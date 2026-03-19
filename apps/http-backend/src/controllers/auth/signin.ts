import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prismaClient } from "@repo/db";
import { JWT_SECRET } from "@repo/backend-common/config";
import { SigninUserSchema } from "@repo/common/types";

export const signin = async (req: Request, res: Response) => {
  const parsed = SigninUserSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid input",
    });
  }

  try {
    const { email, password } = parsed.data;

    const user = await prismaClient.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({ token });
  } catch {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
