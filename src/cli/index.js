#!/usr/bin/env node
// CLI: motion-diagram render <scene.json> --mode video --out output/x.mp4
import fs from "node:fs";
import path from "node:path";
import { renderVideo } from "../render/renderVideo.js";
import { renderCarousel } from "../render/renderCarousel.js";

function parseArgs(argv) {
  const [cmd, file, ...rest] = argv;
  const opts = { mode: "video", out: null };
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--mode") opts.mode = rest[++i];
    else if (a === "--out") opts.out = rest[++i];
  }
  return { cmd, file, opts };
}

async function main() {
  const { cmd, file, opts } = parseArgs(process.argv.slice(2));

  if (cmd !== "render" || !file) {
    console.log("Usage: motion-diagram render <scene.json> [--mode video] [--out output/x.mp4]");
    process.exit(1);
  }

  const scenePath = path.resolve(file);
  if (!fs.existsSync(scenePath)) {
    console.error("Scene file not found:", scenePath);
    process.exit(1);
  }
  const scene = JSON.parse(fs.readFileSync(scenePath, "utf8"));

  const mode = scene.meta?.mode || opts.mode;
  const out = opts.out || `output/${path.basename(file, path.extname(file))}.mp4`;
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });

  if (mode === "carousel") {
    const outDir = opts.out || `output/${path.basename(file, path.extname(file))}-carousel`;
    fs.mkdirSync(path.resolve(outDir), { recursive: true });
    console.log(`Rendering carousel "${scene.meta?.title || file}" -> ${outDir}/`);
    const results = await renderCarousel(scene, path.resolve(outDir), (i, total, name, p) => {
      process.stdout.write(`\r  slide ${i}/${total} ${name} ${Math.round(p * 100)}%   `);
    });
    process.stdout.write("\n");
    for (const r of results) console.log(`  ${r.gif}${r.webp ? " + " + r.webp : ""}`);
    console.log("Done:", outDir);
    return;
  }

  console.log(`Rendering "${scene.meta?.title || file}" -> ${out}`);
  let last = -1;
  await renderVideo(scene, path.resolve(out), (p) => {
    const pct = Math.round(p * 100);
    if (pct !== last && pct % 5 === 0) {
      last = pct;
      process.stdout.write(`\r  ${pct}%`);
    }
  });
  process.stdout.write("\r  100%\n");
  console.log("Done:", out);
}

main().catch((e) => {
  console.error("\nError:", e.message);
  process.exit(1);
});
