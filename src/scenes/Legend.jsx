// Legend explaining line styles / colors. Fades in near start, fixed screen
// position (drawn outside the camera transform). scene.legend = [{ label,
// color, style }].
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

const STYLE_DASH = { solid: null, dashed: "12 8", dotted: "2 8" };

export function Legend({ items = [], theme, appearFrame = 0, x = 40, y = 40 }) {
  const frame = useCurrentFrame();
  const local = frame - appearFrame;
  if (!items.length) return null;
  const opacity = local < 0 ? 0 : interpolate(local, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  const rowH = 30;
  const boxW = 240;
  const boxH = items.length * rowH + 20;
  const bg = theme?.edgeLabelBg || "#0f172a";
  const stroke = theme?.edgeLabelStroke || "#334155";
  const txt = theme?.edgeLabelText || "#cbd5e1";

  return (
    <g opacity={opacity} transform={`translate(${x} ${y})`}>
      <rect x={0} y={0} width={boxW} height={boxH} rx={12} fill={bg} fillOpacity={0.92} stroke={stroke} />
      {items.map((it, i) => {
        const cy = 20 + i * rowH;
        const color = it.color || theme?.edge || "#64748b";
        const dashArr = STYLE_DASH[it.style || "solid"];
        return (
          <g key={i}>
            <line
              x1={16}
              y1={cy}
              x2={56}
              y2={cy}
              stroke={color}
              strokeWidth={3}
              strokeDasharray={dashArr || undefined}
              strokeLinecap={it.style === "dotted" ? "round" : "butt"}
            />
            <text x={68} y={cy} fill={txt} fontSize={15} fontFamily="Inter, system-ui, sans-serif" dominantBaseline="central">
              {it.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}
