// Render a scene JSON to MP4 using @remotion/renderer.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import { webpackOverride } from "./webpackOverride.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.resolve(__dirname, "../scenes/index.js");

export async function renderVideo(scene, outPath, onProgress) {
  const serveUrl = await bundle({
    entryPoint: ENTRY,
    webpackOverride,
    // pass scene to the bundle via env
    onProgress: () => {},
  });

  const inputProps = {};
  const envVars = { MOTION_SCENE_JSON: JSON.stringify(scene) };

  const composition = await selectComposition({
    serveUrl,
    id: "MotionDiagram",
    inputProps,
    envVariables: envVars,
  });

  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: outPath,
    inputProps,
    envVariables: envVars,
    onProgress: ({ progress }) => onProgress && onProgress(progress),
  });

  return outPath;
}
