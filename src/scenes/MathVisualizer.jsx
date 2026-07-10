import { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { evaluateExpression } from "../math/expression.js";
import { pendulumState } from "../math/pendulum.js";

const SFX = { beep: "sfx/beep.wav", whoosh: "sfx/whoosh.wav", ding: "sfx/ding.wav" };
const pad = 110;

function Formula({ scene, frame, width, height }) {
  const formula = scene.formula?.latex || "f(x)";
  const steps = scene.formula?.steps || [];
  const step = steps.filter((item) => item.at <= frame).at(-1);
  return (
    <>
      <text x={width / 2} y={height / 2 - 40} fill="#f8fafc" fontSize="76" textAnchor="middle">
        {formula}
      </text>
      {step?.latex && (
        <text x={width / 2} y={height / 2 + 80} fill="#38bdf8" fontSize="52" textAnchor="middle">
          {step.latex}
        </text>
      )}
    </>
  );
}

function FunctionGraph({ scene, frame, width, height }) {
  const config = scene.function || {};
  const [min, max] = config.domain || [-6.28, 6.28];
  const samples = Math.min(480, Math.max(20, config.samples || 240));
  const expression = config.expression || "sin(x)";
  const values = useMemo(
    () =>
      Array.from({ length: samples }, (_, i) => {
        const x = min + ((max - min) * i) / (samples - 1);
        return { x, y: evaluateExpression(expression, x) };
      }),
    [expression, min, max, samples]
  );
  const scaleX = (width - pad * 2) / (max - min);
  const scaleY = Math.min(130, (height - pad * 2) / 6);
  const sx = (x) => pad + (x - min) * scaleX;
  const sy = (y) => height / 2 - y * scaleY;
  const path = values.map((p, i) => `${i ? "L" : "M"}${sx(p.x)} ${sy(p.y)}`).join(" ");
  const point = values[Math.min(values.length - 1, frame % values.length)];
  return (
    <>
      <line x1={pad} y1={height / 2} x2={width - pad} y2={height / 2} stroke="#64748b" />
      <line x1={width / 2} y1={pad} x2={width / 2} y2={height - pad} stroke="#64748b" />
      <path d={path} fill="none" stroke="#38bdf8" strokeWidth="6" />
      <circle cx={sx(point.x)} cy={sy(point.y)} r="12" fill="#fbbf24" />
      <text x={pad} y={80} fill="#f8fafc" fontSize="44">
        y = {expression}
      </text>
    </>
  );
}

function Pendulum({ scene, frame, fps, width, height }) {
  const state = pendulumState(scene.simulation, frame, fps);
  const origin = { x: width / 2, y: height / 4 };
  const scale = Math.min(width, height) * 0.17;
  const bob = { x: origin.x + state.x * scale, y: origin.y + state.y * scale };
  return (
    <>
      <text x={pad} y={80} fill="#f8fafc" fontSize="44">
        θ(t) = {state.angle.toFixed(2)} rad
      </text>
      <text x={pad} y={130} fill="#94a3b8" fontSize="30">
        L = {scene.simulation?.length ?? 1} · g = {scene.simulation?.gravity ?? 9.81}
      </text>
      <circle cx={origin.x} cy={origin.y} r="12" fill="#f8fafc" />
      <line x1={origin.x} y1={origin.y} x2={bob.x} y2={bob.y} stroke="#cbd5e1" strokeWidth="8" />
      <circle cx={bob.x} cy={bob.y} r="34" fill="#38bdf8" />
      <line
        x1={bob.x}
        y1={bob.y}
        x2={bob.x + Math.cos(state.angle) * state.velocity * 25}
        y2={bob.y - Math.sin(state.angle) * state.velocity * 25}
        stroke="#fbbf24"
        strokeWidth="6"
      />
      <text x={width / 2} y={height - 90} fill="#f8fafc" fontSize="48" textAnchor="middle">
        θ¨ + (g/L) sin(θ) = 0
      </text>
    </>
  );
}

export function MathVisualizer({ scene }) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const audio =
    scene.audio?.enabled === false
      ? []
      : scene.mode === "formula"
        ? scene.formula?.steps || []
        : [];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 20%, #172554, #020617)" }}>
      <svg width={width} height={height}>
        {scene.mode === "formula" && (
          <Formula scene={scene} frame={frame} width={width} height={height} />
        )}
        {scene.mode === "function" && (
          <FunctionGraph scene={scene} frame={frame} width={width} height={height} />
        )}
        {scene.mode === "simulation" && (
          <Pendulum scene={scene} frame={frame} fps={fps} width={width} height={height} />
        )}
      </svg>
      {audio.map((step, i) =>
        step.sfx && SFX[step.sfx] ? (
          <Sequence key={i} from={step.at || 0}>
            <Audio src={staticFile(SFX[step.sfx])} />
          </Sequence>
        ) : null
      )}
    </AbsoluteFill>
  );
}
