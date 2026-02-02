import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      // Minimal env vars required for tests
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
      S3_BUCKET: "test-bucket",
      SQS_QUEUE_URL: "http://localhost:9324/queue/test",
      OPENAI_API_KEY: "test-key",
      JWT_SECRET: "test-secret-for-testing",
    },
  },
});
