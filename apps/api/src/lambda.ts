import "dotenv/config";
import serverless from "serverless-http";
import { createApp } from "./app.js";

// Create Express app for Lambda
const app = createApp();

// Export Lambda handler
// Note: WebSocket is not supported in this Lambda handler.
// For WebSocket in Lambda, use API Gateway WebSocket API separately.
export const handler = serverless(app);
