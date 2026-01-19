#!/usr/bin/env node
/**
 * Script to package the API for AWS Lambda deployment.
 * Creates api.zip containing the bundled lambda.js (all dependencies bundled by esbuild).
 */

import { createWriteStream } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import archiver from "archiver";

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiDir = resolve(__dirname, "..");
const outputPath = resolve(apiDir, "api.zip");

const output = createWriteStream(outputPath);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`✓ Created api.zip (${sizeMB} MB)`);
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);

// Add bundled lambda.js (all dependencies are bundled by esbuild)
archive.file(resolve(apiDir, "dist-lambda", "lambda.js"), { name: "lambda.js" });

// Add package.json for Lambda runtime metadata
archive.file(resolve(apiDir, "package.json"), { name: "package.json" });

archive.finalize();
