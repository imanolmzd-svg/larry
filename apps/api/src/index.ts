import "dotenv/config";
import express from "express";
import pg from "pg";
import { Redis } from "ioredis";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import cors from "cors";
import crypto from "node:crypto";
import { presignPutObject } from "./infra/s3/presignPut.js";

const app = express();
const PORT = 4000;
const HOST = "0.0.0.0";

// Log env status at startup (never print secrets)
console.log("Env check:", {
  DATABASE_URL: process.env.DATABASE_URL ? "set" : "missing",
  REDIS_URL: process.env.REDIS_URL ? "set" : "missing",
  S3_ENDPOINT: process.env.S3_ENDPOINT ? "set" : "missing",
  S3_KEY: process.env.S3_KEY ? "set" : "missing",
  S3_SECRET: process.env.S3_SECRET ? "set" : "missing",
});

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.get("/health", async (_req, res) => {
  const errors: string[] = [];

  // Check Postgres
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    errors.push("postgres: DATABASE_URL is not set");
  } else {
    try {
      const client = new pg.Client({ connectionString: databaseUrl });
      await client.connect();
      await client.query("SELECT 1");
      await client.end();
    } catch (err) {
      errors.push(`postgres: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  // Check Redis
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    errors.push("redis: REDIS_URL is not set");
  } else {
    try {
      const redis = new Redis(redisUrl);
      await redis.ping();
      redis.disconnect();
    } catch (err) {
      errors.push(`redis: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  // Check S3/MinIO
  const s3Endpoint = process.env.S3_ENDPOINT;
  const s3Key = process.env.S3_KEY;
  const s3Secret = process.env.S3_SECRET;

  if (!s3Endpoint || !s3Key || !s3Secret) {
    const missing = [
      !s3Endpoint && "S3_ENDPOINT",
      !s3Key && "S3_KEY",
      !s3Secret && "S3_SECRET",
    ].filter(Boolean).join(", ");
    errors.push(`s3: missing env vars: ${missing}`);
  } else {
    try {
      const s3 = new S3Client({
        endpoint: s3Endpoint,
        credentials: {
          accessKeyId: s3Key,
          secretAccessKey: s3Secret,
        },
        region: "us-east-1",
        forcePathStyle: true,
      });
      await s3.send(new ListBucketsCommand({}));
      s3.destroy();
    } catch (err) {
      errors.push(`s3: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  if (errors.length > 0) {
    res.status(500).json({ status: "error", errors });
  } else {
    res.json({ status: "ok" });
  }
});

const server = app.listen(PORT, HOST, () => {
  console.log(`API listening on http://${HOST}:${PORT}`);
});

server.on("error", (err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});

app.post("/documents/init", async (req, res) => {
  const { filename, mimeType, sizeBytes } = req.body ?? {};
  if (!filename || !sizeBytes) {
    return res.status(400).json({ error: "missing fields" });
  }

  const documentId = crypto.randomUUID();
  const key = `uploads/${documentId}/${filename}`; // s3Key

  // TODO: aquí crearías Document en DB con prisma si ya lo tienes

  const uploadUrl = await presignPutObject({
    bucket: process.env.S3_BUCKET!,
    key,
    contentType: mimeType,
  });

  console.log("uploadUrl", uploadUrl);
  return res.json({
    documentId,
    uploadUrl,
    key, // útil para debug / headObject luego
  });
});

app.post("/documents/complete", async (req, res) => {
  console.log("documents/complete", req.body);
  const { documentId } = req.body ?? {};
  if (!documentId) {
    return res.status(400).json({ error: "missing documentId" });
  }

  // TODO: complete document
  return res.json({ success: true });
});