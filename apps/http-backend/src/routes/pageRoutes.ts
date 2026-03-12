import { Router } from "express";
import { signup } from "../controllers/auth/signup";
import { signin } from "../controllers/auth/signin";
import { createRoom } from "../controllers/room/createRoom";
import { getRoom } from "../controllers/room/getRoom"
import { getChats } from "../controllers/chat/getChat";
import { authMiddleware } from "../middlewares/authMiddlewares";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);

router.post("/room", authMiddleware, createRoom);
router.get("/room/:slug", getRoom);

router.get("/chat/:roomId", getChats);

export default router;