// Spinning "working" indicator drawn around a node while it processes.
// Timeline: { type: "process", target: "nodeId", at, durationInFrames, color }
import React from "react";
import { interpolate } from "remotion";

export function ProcessRing({ node, frame, startFrame, durationInFrames = 40, color = "#38bdf8" }) {
  const local = frame - startFrame;
  if (local < 0 || local > durationInFrames) return null;

  const r = Math.max(node.width, node.height) / 2 + 14;
  const rot = (local / durationInFrames) * 720; // 2 full turns
  // fade in first 6 frames, out last 6
  const opacity = interpolate(
    local,
    [0, 6, durationInFrames - 6, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const circ = 2 * Math.PI * r;

  return (
    <g opacity={opacity} transform={`rotate(${rot} ${node.x} ${node.y})`}>
      {/* faint track */}
      <circle cx={node.x} cy={node.y} r={r} fill="none" stroke={color} strokeOpacity={0.18} strokeWidth={3} />
      {/* moving arc (~30% of circle) */}
      <circle
        cx={node.x}
        cy={node.y}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeDasharray={`${circ * 0.3} ${circ}`}
      />
    </g>
  );
}
