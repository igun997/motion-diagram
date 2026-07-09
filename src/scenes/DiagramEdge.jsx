// Edge: draws like a pen (stroke-dashoffset) then shows arrowhead + label.
import React from "react";
import { interpolate } from "remotion";
import { pointsToPath, pathLength, pointAt, endAngle } from "./geometry.js";

export function DiagramEdge({ edge, frame, drawFrame, drawDuration = 18 }) {
  const points = edge.points;
  const len = pathLength(points);
  const local = frame - drawFrame;
  const progress =
    local < 0
      ? 0
      : interpolate(local, [0, drawDuration], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const d = pointsToPath(points);
  const dash = len;
  const offset = dash * (1 - progress);

  const showArrow = progress > 0.95;
  const ang = endAngle(points);
  const tip = points[points.length - 1];

  // label at midpoint
  const mid = pointAt(points, 0.5);

  return (
    <g opacity={local < 0 ? 0 : 1}>
      <path
        d={d}
        fill="none"
        stroke="#64748b"
        strokeWidth={2.5}
        strokeDasharray={dash}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      {showArrow && (
        <polygon
          points="0,-6 12,0 0,6"
          fill="#64748b"
          transform={`translate(${tip.x} ${tip.y}) rotate(${ang})`}
        />
      )}
      {edge.label && progress > 0.5 && (
        <g opacity={interpolate(progress, [0.5, 1], [0, 1], { extrapolateRight: "clamp" })}>
          <rect
            x={mid.x - edge.label.length * 4.5 - 6}
            y={mid.y - 12}
            width={edge.label.length * 9 + 12}
            height={22}
            rx={6}
            fill="#0f172a"
            stroke="#334155"
          />
          <text
            x={mid.x}
            y={mid.y}
            fill="#cbd5e1"
            fontSize={14}
            fontFamily="Inter, system-ui, sans-serif"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {edge.label}
          </text>
        </g>
      )}
    </g>
  );
}
