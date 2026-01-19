import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import type { Redis } from "ioredis";
import { getRedisSubscriber, safeRedisSubscribe, safeRedisUnsubscribe } from "@larry/infra";
import { verifyToken } from "../../domain/auth/authService.js";
import { getRedisChannel, validateDocumentStatusEvent } from "@larry/shared";
import { CORS_ORIGIN } from "../../config/constants.js";
import { ENV } from "../../config/env.js";

// Track subscriptions per user for reference counting
const userConnections = new Map<string, Set<string>>(); // userId -> Set<socketId>
const socketToUser = new Map<string, string>(); // socketId -> userId

let io: SocketIOServer | null = null;
let redisSubscriber: Redis | null = null;
const subscribedChannels = new Set<string>();

export function initWebSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: CORS_ORIGIN,
      credentials: true,
    },
  });

  // Initialize Redis subscriber lazily (serverless-optimized)
  redisSubscriber = getRedisSubscriber(ENV.REDIS_URL);

  if (redisSubscriber) {
    redisSubscriber.on("message", (channel, message) => {
      handleRedisMessage(channel, message);
    });

    // Error handler already set up in getRedisSubscriber, but add specific one for ws
    redisSubscriber.on("error", (err) => {
      console.error("[ws] Redis subscriber error:", err.message);
    });

    console.log("[ws] Redis subscriber initialized (lazy connect)");
  } else {
    console.log("[ws] No REDIS_URL, WebSocket updates disabled");
  }

  // Handle WebSocket connections
  io.on("connection", (socket: Socket) => {
    handleConnection(socket);
  });

  console.log("[ws] WebSocket server initialized");
  return io;
}

async function handleConnection(socket: Socket) {
  // Authenticate via token in handshake
  const token = socket.handshake.auth?.token as string | undefined;

  if (!token) {
    console.log("[ws] Connection rejected: no token");
    socket.emit("error", { message: "Authentication required" });
    socket.disconnect();
    return;
  }

  let userId: string;
  try {
    const payload = verifyToken(token);
    userId = payload.userId;
  } catch {
    console.log("[ws] Connection rejected: invalid token");
    socket.emit("error", { message: "Invalid token" });
    socket.disconnect();
    return;
  }

  console.log(`[ws] User ${userId} connected (socket ${socket.id})`);

  // Track connection
  socketToUser.set(socket.id, userId);
  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set());
  }
  userConnections.get(userId)!.add(socket.id);

  // Subscribe to user's Redis channel if this is their first connection
  await subscribeToUserChannel(userId);

  // Handle disconnect
  socket.on("disconnect", () => {
    handleDisconnect(socket.id, userId);
  });
}

async function subscribeToUserChannel(userId: string) {
  if (!redisSubscriber) return;

  const channel = getRedisChannel(userId);

  if (!subscribedChannels.has(channel)) {
    const success = await safeRedisSubscribe(redisSubscriber, channel);
    if (success) {
      subscribedChannels.add(channel);
      console.log(`[ws] Subscribed to channel: ${channel}`);
    }
  }
}

async function unsubscribeFromUserChannel(userId: string) {
  if (!redisSubscriber) return;

  const channel = getRedisChannel(userId);

  // Only unsubscribe if no more connections for this user
  if (!userConnections.has(userId) || userConnections.get(userId)!.size === 0) {
    if (subscribedChannels.has(channel)) {
      const success = await safeRedisUnsubscribe(redisSubscriber, channel);
      if (success) {
        subscribedChannels.delete(channel);
        console.log(`[ws] Unsubscribed from channel: ${channel}`);
      }
    }
  }
}

function handleDisconnect(socketId: string, userId: string) {
  console.log(`[ws] User ${userId} disconnected (socket ${socketId})`);

  socketToUser.delete(socketId);

  const userSockets = userConnections.get(userId);
  if (userSockets) {
    userSockets.delete(socketId);
    if (userSockets.size === 0) {
      userConnections.delete(userId);
      // Async unsubscribe (fire and forget) - safe wrapper handles errors
      void unsubscribeFromUserChannel(userId);
    }
  }
}

function handleRedisMessage(_channel: string, message: string) {
  // Parse the message
  let data: unknown;
  try {
    data = JSON.parse(message);
  } catch {
    console.error("[ws] Invalid JSON in Redis message:", message);
    return;
  }

  // Validate the event shape
  const event = validateDocumentStatusEvent(data);
  if (!event) {
    console.error("[ws] Invalid event shape:", data);
    return;
  }

  // Extract userId from event
  const { userId } = event;

  // Find all sockets for this user and emit the event
  const userSockets = userConnections.get(userId);
  if (!userSockets || userSockets.size === 0) {
    console.log(`[ws] No connected sockets for user ${userId}`);
    return;
  }

  // Emit to all user's sockets
  for (const socketId of userSockets) {
    io?.to(socketId).emit("document_status_changed", event);
  }

  console.log(
    `[ws] Emitted document_status_changed to ${userSockets.size} socket(s) for user ${userId}`
  );
}

export function getSocketIOServer(): SocketIOServer | null {
  return io;
}
