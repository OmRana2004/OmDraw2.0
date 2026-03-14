import { z } from "zod";

/* ---------------- HTTP API SCHEMAS ---------------- */

/* User signup */

export const CreateUserSchema = z.object({
  email: z.string().email().min(3).max(500),
  password: z.string().min(6).max(100),
  name: z.string().min(1)
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;


/* User signin */

export const SigninUserSchema = z.object({
  email: z.string().email().min(3).max(100),
  password: z.string().min(6)
});

export type SigninUserInput = z.infer<typeof SigninUserSchema>;


/* Join room */

export const JoinRoomSchema = z.object({
  roomName: z
    .string()
    .trim()
    .min(3, "Room name must be at least 3 characters")
});

export type JoinRoomInput = z.infer<typeof JoinRoomSchema>;


/* Create room */

export const CreateRoomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Room name must be at least 3 characters")
});

export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;



/* ---------------- WEBSOCKET TYPES ---------------- */

export enum WsDataType {
  CONNECTION_READY = "CONNECTION_READY",

  /* Room events */
  JOIN = "JOIN",
  LEAVE = "LEAVE",

  USER_JOINED = "USER_JOINED",
  USER_LEFT = "USER_LEFT",

  /* Drawing events */
  DRAW = "DRAW",
  UPDATE = "UPDATE",
  ERASER = "ERASER",

  /* Cursor */
  CURSOR_MOVE = "CURSOR_MOVE"
}


/* WebSocket message structure */

export type WebSocketMessage = {
  type: WsDataType;

  roomId: string;

  userId?: string;
  userName?: string;

  connectionId?: string;

  /* shape id */
  id?: string;

  /* shape data */
  message?: any;

  /* participants list */
  participants?: {
    userId: string;
    userName: string;
  }[];

  timestamp?: string;
};