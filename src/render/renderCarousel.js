// Render carousel: split timeline into slide-groups, render each as GIF, then
// convert to animated WebP via ffmpeg. Silent loops.
import path from "node:path";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.resolve(__dirname, "../scenes/index.js");

// Split scene into slides. A slide is defined by nodes.group, else 1 slide.
export function buildSlides(scene) {
  const groups = new Map();
  for (const n of scene.nodes) {
    const g = n.group || "_all";
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(n.id);
  }
  if (groups.size <= 1) {
    return [{ name: "slide-1", scene }];
  }
  const slides = [];
  let i = 1;
  for (const [g, ids] of groups) {
    const idSet = new Set(ids);
    const nodes = scene.nodes.filter((n) => idSet.has(n.id));
    const edges = scene.edges.filter((e) => idSet.has(e.from) && idSet.has(e.to));
    const edgeIds = new Set(edges.map((e) => e.id));
    const timeline = (scene.timeline || []).filter((ev) => {
      if (ev.target) return idSet.has(ev.target) || edgeIds.has(ev.target);
      if (ev.edge) return edgeIds.has(ev.edge);
      return true;
    });
    slides.push({
      name: `slide-${i}-${g}`,
      scene: { ...scene, nodes, edges, timeline, meta: { ...scene.meta, mode: "carousel" } },
    });
    i++;
  }
  return slides;
}

async function renderOneGif(serveUrl, scene, outGif, onProgress) {
  const envVariables = { MOTION_SCENE_JSON: JSON.stringify(scene) };
  const composition = await selectComposition({ serveUrl, id: "MotionDiagram", inputProps: {}, envVariables });
  await renderMedia({
    composition,
    serveUrl,
    codec: "gif",
    outputLocation: outGif,
    inputProps: {},
    envVariables,
    muted: true,
    everyNthFrame: 2,
    onProgress: ({ progress }) => onProgress && onProgress(progress),
  });
}

function gifToWebp(gifPath, webpPath) {
  const r = spawnSync("ffmpeg", ["-y", "-i", gifPath, "-loop", "0", "-q:v", "70", webpPath], { encoding: "utf8" });
  return r.status === 0;
}

export async function renderCarousel(scene, outDir, onSlide) {
  fs.mkdirSync(outDir, { recursive: true });
  const serveUrl = await bundle({ entryPoint: ENTRY, onProgress: () => {} });
  const slides = buildSlides(scene);
  const results = [];
  for (let i = 0; i < slides.length; i++) {
    const { name, scene: s } = slides[i];
    const gif = path.join(outDir, `${name}.gif`);
    const webp = path.join(outDir, `${name}.webp`);
    onSlide && onSlide(i + 1, slides.length, name, 0);
    await renderOneGif(serveUrl, s, gif, (p) => onSlide && onSlide(i + 1, slides.length, name, p));
    const okWebp = gifToWebp(gif, webp);
    results.push({ name, gif, webp: okWebp ? webp : null });
  }
  return results;
}
