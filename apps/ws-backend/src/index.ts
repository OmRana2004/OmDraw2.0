import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from '@repo/db/client';

// Use the port from Render or default to 8080
const PORT = parseInt(process.env.PORT || "8080", 10);

const wss = new WebSocketServer({ port: PORT });
console.log(`WebSocket server running on port ${PORT}`);

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // decoded can be string or object
    if (typeof decoded === 'string' || !decoded || !(decoded as any).userId) return null;
    return (decoded as any).userId as string;
  } catch {
    return null;
  }
}

wss.on('connection', function connection(ws, request) {
  try {
    const url = request.url;
    if (!url) {
      ws.close();
      return;
    }

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || '';
    const userId = checkUser(token);

    if (!userId) {
      ws.close();
      return;
    }

    users.push({ userId, rooms: [], ws });

    ws.on('message', async function message(data) {
      try {
        const parsedData =
          typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString());

        //  JOIN ROOM
        if (parsedData.type === 'join_room') {
          const user = users.find((x) => x.ws === ws);
          if (user && parsedData.roomId) {
            user.rooms.push(parsedData.roomId);

            const existingUser = await prismaClient.user.findUnique({
              where: { id: userId },
            });

            if (!existingUser) {
              await prismaClient.user.create({
                data: {
                  id: userId,
                  email: `temp_${userId}@example.com`, // placeholder
                  password: "hashed-temp-password",
                  name: "Temporary User",
                },
              });
            }

            await prismaClient.room.upsert({
              where: { slug: parsedData.roomId },
              update: {},
              create: {
                slug: parsedData.roomId,
                adminId: userId,
              },
            });
          }
        }

        //  LEAVE ROOM
        if (parsedData.type === 'leave_room') {
          const user = users.find((x) => x.ws === ws);
          if (!user) return;
          user.rooms = user.rooms.filter((x) => x !== parsedData.roomId);
        }

        // CHAT MESSAGE
        if (parsedData.type === 'chat') {
          const slug = parsedData.roomId; // frontend sends slug
          const message = parsedData.message;

          // Find the room by slug
          const room = await prismaClient.room.findUnique({
            where: { slug },
          });

          if (!room) {
            console.error('Room not found for slug:', slug);
            return;
          }

          // Save chat to DB
          await prismaClient.chat.create({
            data: {
              roomId: room.id,
              message,
              userId,
            },
          });

          // Broadcast to all users in the same room
          users.forEach((user) => {
            if (user.rooms.includes(parsedData.roomId)) {
              user.ws.send(
                JSON.stringify({
                  type: 'chat',
                  message,
                  roomId: slug,
                })
              );
            }
          });
        }
      } catch (err) {
        console.error('Message handling error:', err);
      }
    });
  } catch (err) {
    console.error('Connection error:', err);
    ws.close();
  }
});