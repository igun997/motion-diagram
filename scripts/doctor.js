#!/usr/bin/env node
// Environment checker: verifies prerequisites for Motion Diagram.
// Usage: npm run doctor   (exits non-zero if a required check fails)
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;
let warned = 0;

function ok(msg) {
  console.log(`  \x1b[32m✔\x1b[0m ${msg}`);
}
function fail(msg) {
  console.log(`  \x1b[31m✗\x1b[0m ${msg}`);
  failed++;
}
function warn(msg) {
  console.log(`  \x1b[33m!\x1b[0m ${msg}`);
  warned++;
}

function has(cmd) {
  try {
    execSync(cmd, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function version(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return null;
  }
}

console.log("\nMotion Diagram — environment check\n");

// Node
const nodeMajor = parseInt(process.versions.node.split(".")[0], 10);
if (nodeMajor >= 18) ok(`Node.js ${process.versions.node}`);
else fail(`Node.js ${process.versions.node} — need >= 18`);

// ffmpeg / ffprobe
if (has("ffmpeg -version")) ok(`ffmpeg (${(version("ffmpeg -version") || "").split("\n")[0]})`);
else fail("ffmpeg not found on PATH — required for SFX generation");

if (has("ffprobe -version")) ok("ffprobe");
else warn("ffprobe not found — used to verify rendered output");

// deps installed
if (existsSync(join(root, "node_modules", "remotion"))) ok("dependencies installed (remotion)");
else fail("dependencies missing — run `npm install`");

if (existsSync(join(root, "node_modules", "@modelcontextprotocol", "sdk")))
  ok("MCP SDK installed");
else warn("@modelcontextprotocol/sdk missing — MCP server won't start");

// sfx assets
const sfx = ["beep", "whoosh", "ding"].every((s) =>
  existsSync(join(root, "public", "sfx", `${s}.wav`))
);
if (sfx) ok("SFX assets present (beep, whoosh, ding)");
else warn("SFX assets missing under public/sfx — regenerate before rendering with sound");

console.log("");
if (failed) {
  console.log(`\x1b[31m${failed} required check(s) failed.\x1b[0m ${warned} warning(s).\n`);
  process.exit(1);
} else {
  console.log(`\x1b[32mAll required checks passed.\x1b[0m ${warned} warning(s).\n`);
}
