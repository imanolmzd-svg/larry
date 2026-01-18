import "dotenv/config";
import express from "express";
import cors from "cors";
import { postDocumentsInit } from "./app/routes/documentsInit.js";
import { postDocumentsComplete } from "./app/routes/documentsComplete.js";
import { postChatAsk } from "./app/routes/chatAsk.js";
import { healthHandler } from "./app/health/health.controller.js";

const app = express();
const PORT = 4000;
const HOST = "0.0.0.0";

// Log env status at startup (never print secrets)
console.log("Env check:", {
  DATABASE_URL: process.env.DATABASE_URL ? "set" : "missing",
  REDIS_URL: process.env.REDIS_URL ? "set" : "missing",
  S3_INTERNAL_ENDPOINT: process.env.S3_INTERNAL_ENDPOINT ? "set" : "missing",
  S3_PUBLIC_ENDPOINT: process.env.S3_PUBLIC_ENDPOINT ? "set" : "missing",
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY ? "set" : "missing",
  S3_SECRET_KEY: process.env.S3_SECRET_KEY ? "set" : "missing",
  SQS_QUEUE_URL: process.env.SQS_QUEUE_URL ? "set" : "missing",
  SQS_REGION: process.env.SQS_REGION ? "set" : "missing",
  SQS_ACCESS_KEY_ID: process.env.SQS_ACCESS_KEY_ID ? "set" : "missing",
  SQS_SECRET_ACCESS_KEY: process.env.SQS_SECRET_ACCESS_KEY ? "set" : "missing",
});

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.get("/health", healthHandler);

const server = app.listen(PORT, HOST, () => {
  console.log(`API listening on http://${HOST}:${PORT}`);
});

server.on("error", (err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});

app.post("/documents/init", postDocumentsInit);
app.post("/documents/complete", postDocumentsComplete);
app.post("/chat/ask", postChatAsk);
