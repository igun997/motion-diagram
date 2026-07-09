// Glowing comet that travels along an edge from->to over a duration.
// Multi-color, optional trail. Emits nothing itself; sfx handled at spec level.
import React from "react";
import { interpolate } from "remotion";
import { pointAt } from "./geometry.js";

export function Pulse({
  points,
  frame,
  startFrame,
  durationInFrames,
  color = "#38bdf8",
  trail = true,
  reverse = false,
}) {
  const local = frame - startFrame;
  if (local < 0 || local > durationInFrames) return null;

  const raw = interpolate(local, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const t = reverse ? 1 - raw : raw;
  const head = pointAt(points, t);

  const trailDots = [];
  if (trail) {
    const N = 6;
    for (let i = 1; i <= N; i++) {
      const tt = Math.max(0, t - i * 0.03);
      const p = pointAt(points, tt);
      trailDots.push(
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={7 - i * 0.8}
          fill={color}
          opacity={(1 - i / N) * 0.4}
        />
      );
    }
  }

  return (
    <g style={{ filter: `drop-shadow(0 0 8px ${color})` }}>
      {trailDots}
      <circle cx={head.x} cy={head.y} r={9} fill={color} />
      <circle cx={head.x} cy={head.y} r={4} fill="#ffffff" opacity={0.9} />
    </g>
  );
}
