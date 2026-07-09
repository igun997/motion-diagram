// A single diagram node: shape + label with entrance pop animation.
import React from "react";
import { spring, interpolate } from "remotion";
import { resolveIcon } from "./icons.js";

const COLORS = {
  rect: { fill: "#1e293b", stroke: "#38bdf8" },
  diamond: { fill: "#3b1e4a", stroke: "#e879f9" },
  stadium: { fill: "#0f3b2e", stroke: "#34d399" },
};

export function DiagramNode({ node, frame, fps, appearFrame }) {
  const local = frame - appearFrame;
  const s = spring({
    frame: local,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 140 },
    durationInFrames: 20,
  });
  const scale = local < 0 ? 0 : interpolate(s, [0, 1], [0.4, 1]);
  const opacity = local < 0 ? 0 : interpolate(s, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const { x, y, width, height, shape, label } = node;
  const c = COLORS[shape] || COLORS.rect;
  const cx = x;
  const cy = y;
  const icon = resolveIcon(node);
  const labelDx = icon ? 14 : 0; // shift label right to make room for icon

  const commonStyle = {
    fill: c.fill,
    stroke: c.stroke,
    strokeWidth: 2.5,
  };

  let shapeEl;
  if (shape === "diamond") {
    const pts = [
      `${cx},${cy - height / 2}`,
      `${cx + width / 2},${cy}`,
      `${cx},${cy + height / 2}`,
      `${cx - width / 2},${cy}`,
    ].join(" ");
    shapeEl = <polygon points={pts} {...commonStyle} />;
  } else {
    const rx = shape === "stadium" ? height / 2 : 12;
    shapeEl = (
      <rect
        x={cx - width / 2}
        y={cy - height / 2}
        width={width}
        height={height}
        rx={rx}
        ry={rx}
        {...commonStyle}
      />
    );
  }

  return (
    <g
      opacity={opacity}
      transform={`translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`}
    >
      {shapeEl}
      {icon && (
        <g transform={`translate(${cx - width / 2 + 26} ${cy})`}>
          {icon.kind === "path" ? (
            <g transform="translate(-11 -11) scale(0.92)" stroke={c.stroke} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d={icon.d} />
            </g>
          ) : (
            <text x={0} y={0} fontSize={22} textAnchor="middle" dominantBaseline="central">
              {icon.text}
            </text>
          )}
        </g>
      )}
      <text
        x={cx + labelDx}
        y={cy}
        fill="#f1f5f9"
        fontSize={20}
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight={600}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {label}
      </text>
    </g>
  );
}
