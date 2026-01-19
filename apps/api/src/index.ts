import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import { postDocumentsInit } from "./app/routes/documentsInit.js";
import { postDocumentsComplete } from "./app/routes/documentsComplete.js";
import { getDocuments } from "./app/routes/documentsGet.js";
import { deleteDocument } from "./app/routes/documentsDelete.js";
import { getUserLimits } from "./app/routes/userLimits.js";
import { postChatAsk } from "./app/routes/chatAsk.js";
import { postAuthLogin } from "./app/routes/authLogin.js";
import { authMiddleware } from "./infra/middleware/auth.js";
import { healthHandler } from "./app/health/health.controller.js";
import { initWebSocketServer } from "./infra/ws/wsServer.js";
import { SERVER_PORT, SERVER_HOST, CORS_ORIGIN } from "./config/constants.js";
import { getEnvStatus } from "./config/env.js";

const app = express();

// Log env status at startup (never print secrets)
console.log("Env check:", getEnvStatus());

app.use(express.json());

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

app.get("/health", healthHandler);

// Public routes
app.post("/auth/login", postAuthLogin);

// Protected routes (require authentication)
app.get("/documents", authMiddleware, getDocuments);
app.post("/documents/init", authMiddleware, postDocumentsInit);
app.post("/documents/complete", authMiddleware, postDocumentsComplete);
app.delete("/documents", authMiddleware, deleteDocument);
app.get("/user/limits", authMiddleware, getUserLimits);
app.post("/chat/ask", authMiddleware, postChatAsk);

// Create HTTP server and attach WebSocket
const httpServer = createServer(app);
initWebSocketServer(httpServer);

httpServer.listen(SERVER_PORT, SERVER_HOST, () => {
  console.log(`API listening on http://${SERVER_HOST}:${SERVER_PORT}`);
});

httpServer.on("error", (err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});
