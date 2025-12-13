import { Server } from "socket.io";
import http from "http";

let io: Server | null = null;

export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Allow admin clients to join the admins room
    socket.on("joinAdmins", () => {
      // Check if already in the room to prevent duplicate joins
      if (!socket.rooms.has("admins")) {
        socket.join("admins");
        console.log("Client joined admins room:", socket.id);
      }
    });

    // Allow drivers to join their personal room for notifications
    socket.on("joinDriver", (driverId: string) => {
      const roomName = `driver:${driverId}`;
      if (!socket.rooms.has(roomName)) {
        socket.join(roomName);
        console.log(`Client joined driver room ${roomName}:`, socket.id);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

// Helper to send notification to a specific driver
export function notifyDriver(driverId: string, event: string, data: Record<string, unknown>) {
  if (io) {
    io.to(`driver:${driverId}`).emit(event, data);
  }
}

// Helper to notify admins
export function notifyAdmins(event: string, data: Record<string, unknown>) {
  if (io) {
    io.to("admins").emit(event, data);
  }
}
