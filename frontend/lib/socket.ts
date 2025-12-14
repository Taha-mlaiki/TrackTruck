import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let hasJoinedAdmins = false;
let currentDriverId: string | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001", {
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const joinAdminsRoom = () => {
  if (socket?.connected && !hasJoinedAdmins) {
    socket.emit("joinAdmins");
    hasJoinedAdmins = true;
  }
};

export const joinDriverRoom = (driverId: string) => {
  if (socket?.connected && currentDriverId !== driverId) {
    socket.emit("joinDriver", driverId);
    currentDriverId = driverId;
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    hasJoinedAdmins = false;
    currentDriverId = null;
  }
};

export const isSocketConnected = () => socket?.connected ?? false;
