#!/usr/bin/env node
/**
 * Script to package the Worker for AWS Lambda deployment.
 * Creates worker.zip containing the bundled lambda.js (all dependencies bundled by esbuild).
 */

import { createWriteStream } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import archiver from "archiver";

const __dirname = dirname(fileURLToPath(import.meta.url));
const workerDir = resolve(__dirname, "..");
const outputPath = resolve(workerDir, "worker.zip");

const output = createWriteStream(outputPath);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`✓ Created worker.zip (${sizeMB} MB)`);
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);

// Add bundled lambda.js (all dependencies are bundled by esbuild)
archive.file(resolve(workerDir, "dist-lambda", "lambda.js"), { name: "lambda.js" });

// Add package.json for Lambda runtime metadata
archive.file(resolve(workerDir, "package.json"), { name: "package.json" });

archive.finalize();
