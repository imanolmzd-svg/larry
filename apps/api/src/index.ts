import "dotenv/config";
import { createServer } from "http";
import { createApp } from "./app.js";
import { initWebSocketServer } from "./infra/ws/wsServer.js";
import { SERVER_PORT, SERVER_HOST } from "./config/constants.js";

// Local development entrypoint - only runs when executed directly
const app = createApp();

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
