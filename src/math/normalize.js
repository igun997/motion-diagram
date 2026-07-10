const MODES = new Set(["formula", "function", "simulation"]);

function bounded(value, fallback, max) {
  return Number.isFinite(value) && value > 0 && value <= max ? Math.floor(value) : fallback;
}

export function normalizeMathScene(scene = {}) {
  if (!MODES.has(scene.mode)) throw new Error(`Unsupported math mode: ${scene.mode}`);

  const meta = scene.meta || {};
  return {
    ...scene,
    meta: {
      ...meta,
      fps: bounded(meta.fps, 30, 120),
      width: bounded(meta.width, 1920, 7680),
      height: bounded(meta.height, 1080, 7680),
    },
    durationInFrames: bounded(scene.durationInFrames, 120, 3600),
  };
}
