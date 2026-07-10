import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import { normalizeMathScene } from "../math/normalize.js";
import { webpackOverride } from "./webpackOverride.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.resolve(__dirname, "../scenes/index.js");

export function mathDuration(scene) {
  return Number.isFinite(scene.durationInFrames) ? scene.durationInFrames : 120;
}

export async function renderMath(scene, outPath, onProgress) {
  const normalized = normalizeMathScene(scene);
  const serveUrl = await bundle({ entryPoint: ENTRY, webpackOverride, onProgress: () => {} });
  const envVariables = { MOTION_MATH_JSON: JSON.stringify(normalized) };
  const composition = await selectComposition({
    serveUrl,
    id: "MathVisualizer",
    inputProps: {},
    envVariables,
  });
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: outPath,
    inputProps: {},
    envVariables,
    onProgress: ({ progress }) => onProgress?.(progress),
  });
  return outPath;
}
