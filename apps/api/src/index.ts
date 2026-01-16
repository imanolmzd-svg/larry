import express from "express";

const app = express();
const PORT = 4000;
const HOST = "0.0.0.0";

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`API listening on http://${HOST}:${PORT}`);
});

server.on("error", (err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});
