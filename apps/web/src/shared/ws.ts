"use client";

import { io, Socket } from "socket.io-client";
import {
  WS_RECONNECTION_ATTEMPTS,
  WS_RECONNECTION_DELAY_MS,
  WS_RECONNECTION_DELAY_MAX_MS,
} from "@/config/constants";
import { ENV } from "@/config/env";

export type DocumentStatusEvent = {
  type: "document.status.changed";
  documentId: string;
  userId: string;
  status: "CREATED" | "UPLOADED" | "PROCESSING" | "READY" | "FAILED";
  attemptId?: string;
  ts: string;
};

type StatusChangeCallback = (event: DocumentStatusEvent) => void;

let socket: Socket | null = null;
const subscribers = new Set<StatusChangeCallback>();

export function connectWebSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
  }

  socket = io(ENV.API_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: WS_RECONNECTION_ATTEMPTS,
    reconnectionDelay: WS_RECONNECTION_DELAY_MS,
    reconnectionDelayMax: WS_RECONNECTION_DELAY_MAX_MS,
  });

  socket.on("connect", () => {
    console.log("[ws] Connected to server");
  });

  socket.on("disconnect", (reason) => {
    console.log("[ws] Disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("[ws] Connection error:", error.message);
  });

  socket.on("document_status_changed", (event: DocumentStatusEvent) => {
    console.log("[ws] Received document_status_changed:", event);
    // Notify all subscribers
    for (const callback of subscribers) {
      try {
        callback(event);
      } catch (err) {
        console.error("[ws] Subscriber error:", err);
      }
    }
  });

  socket.on("error", (error: { message: string }) => {
    console.error("[ws] Server error:", error.message);
  });

  return socket;
}

export function disconnectWebSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function subscribeToStatusChanges(callback: StatusChangeCallback): () => void {
  subscribers.add(callback);

  // Return unsubscribe function
  return () => {
    subscribers.delete(callback);
  };
}

export function getSocket(): Socket | null {
  return socket;
}

export function isConnected(): boolean {
  return socket?.connected ?? false;
}
