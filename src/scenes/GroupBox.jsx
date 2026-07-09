// Process container box drawn behind nodes. Animated dashed border (marching
// ants) + a label tab. Fades in at appearFrame.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export function GroupBox({ box, appearFrame = 0 }) {
  const frame = useCurrentFrame();
  const local = frame - appearFrame;
  const opacity =
    local < 0 ? 0 : interpolate(local, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // marching-ants: shift dashoffset over time
  const dashOffset = -(local * 0.8);

  const { x, y, width, height, label, color } = box;

  return (
    <g opacity={opacity}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={16}
        fill={color}
        fillOpacity={0.06}
        stroke={color}
        strokeWidth={2}
        strokeDasharray="10 8"
        strokeDashoffset={dashOffset}
      />
      {/* label tab */}
      <rect
        x={x + 14}
        y={y - 2}
        width={label.length * 9 + 20}
        height={26}
        rx={8}
        fill={color}
        fillOpacity={0.9}
      />
      <text
        x={x + 24}
        y={y + 11}
        fill="#0b1220"
        fontSize={15}
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight={700}
        dominantBaseline="central"
      >
        {label}
      </text>
    </g>
  );
}
