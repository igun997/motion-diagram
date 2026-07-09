// Canvas size presets for common social platforms. Agent sets meta.preset
// (e.g. "instagram-reels") and dimensions are filled in. Explicit
// meta.width/height always override a preset.

export const SIZE_PRESETS = {
  // Vertical 9:16
  "instagram-reels": { width: 1080, height: 1920, fps: 30 },
  "instagram-story": { width: 1080, height: 1920, fps: 30 },
  "tiktok": { width: 1080, height: 1920, fps: 30 },
  "youtube-shorts": { width: 1080, height: 1920, fps: 30 },
  "threads": { width: 1080, height: 1920, fps: 30 },
  "whatsapp-status": { width: 1080, height: 1920, fps: 30 },

  // Square 1:1
  "instagram-post": { width: 1080, height: 1080, fps: 30 },
  "whatsapp": { width: 1080, height: 1080, fps: 30 },

  // Portrait 4:5 (feed)
  "instagram-portrait": { width: 1080, height: 1350, fps: 30 },

  // Landscape 16:9
  "youtube": { width: 1920, height: 1080, fps: 30 },
  "twitter": { width: 1920, height: 1080, fps: 30 },
  "landscape": { width: 1920, height: 1080, fps: 30 },
};

// Merge a preset into meta. Explicit meta.width/height/fps win over the preset.
export function applyPreset(meta = {}) {
  const p = meta.preset && SIZE_PRESETS[meta.preset];
  if (!p) return meta;
  return {
    ...meta,
    width: meta.width || p.width,
    height: meta.height || p.height,
    fps: meta.fps || p.fps,
  };
}
