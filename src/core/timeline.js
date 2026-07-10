// Normalize agent timeline: resolve atSec->frames, defaults, sort, derive duration.

const PULSE_DEFAULT_FRAMES = 30;

export function normalizeTimeline(events, fps) {
  const norm = (events || []).map((e, i) => {
    const at = Number.isFinite(e.at)
      ? e.at
      : Number.isFinite(e.atSec)
        ? Math.round(e.atSec * fps)
        : 0;
    const dur = Number.isFinite(e.durationInFrames)
      ? e.durationInFrames
      : Number.isFinite(e.durationSec)
        ? Math.round(e.durationSec * fps)
        : e.type === "pulse"
          ? Math.round(
              PULSE_DEFAULT_FRAMES / (Number.isFinite(e.speed) && e.speed > 0 ? e.speed : 1)
            )
          : 18;
    return { ...e, at, durationInFrames: dur, _i: i };
  });

  norm.sort((a, b) => a.at - b.at || a._i - b._i);
  return norm;
}

// Total composition length in frames (last event end + tail padding).
export function timelineDuration(normEvents, tailFrames = 30) {
  let end = 0;
  for (const e of normEvents) {
    end = Math.max(end, e.at + (e.durationInFrames || 0));
  }
  return end + tailFrames;
}

// Collect sfx cues: [{ frame, sfx }] from event.sfx and event.onArrive.sfx.
export function collectSfxCues(normEvents) {
  const cues = [];
  for (const e of normEvents) {
    if (e.sfx && e.sfx !== "none") cues.push({ frame: e.at, sfx: e.sfx });
    if (e.onArrive && e.onArrive.sfx && e.onArrive.sfx !== "none") {
      cues.push({ frame: e.at + (e.durationInFrames || 0), sfx: e.onArrive.sfx });
    }
  }
  return cues;
}
