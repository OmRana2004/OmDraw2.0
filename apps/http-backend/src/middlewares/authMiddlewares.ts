import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

interface CustomJwtPayload extends JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({
      message: "Unauthorized",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({
      message: "Token missing",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET as string
    ) as unknown as CustomJwtPayload;

    req.userId = decoded.userId;

    next();
  } catch {
    return res.status(403).json({
      message: "Invalid or expired token",
    });
  }
}