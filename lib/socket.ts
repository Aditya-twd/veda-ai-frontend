"use client";
import { io, Socket } from "socket.io-client";
import { API_ORIGIN } from "./api";

/** Socket.IO event names — must mirror the backend (src/sockets/events.ts). */
export const SOCKET_EVENTS = {
  SUBSCRIBE: "subscribe",
  UNSUBSCRIBE: "unsubscribe",
  GENERATION_STARTED: "generation:started",
  GENERATION_PROGRESS: "generation:progress",
  GENERATION_COMPLETED: "generation:completed",
  GENERATION_FAILED: "generation:failed",
} as const;

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_ORIGIN, { transports: ["websocket", "polling"], autoConnect: true });
  }
  return socket;
}
