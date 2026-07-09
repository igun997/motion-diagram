// Main Remotion composition. Executes normalized timeline over a laid-out spec.
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { interpolate, Easing } from "remotion";
import { DiagramNode } from "./DiagramNode.jsx";
import { DiagramEdge } from "./DiagramEdge.jsx";
import { Pulse } from "./Pulse.jsx";
import { GroupBox } from "./GroupBox.jsx";
import { Legend } from "./Legend.jsx";
import { ProcessRing } from "./ProcessRing.jsx";
import { pointAt } from "./geometry.js";

const SFX_FILES = { beep: "sfx/beep.wav", whoosh: "sfx/whoosh.wav", ding: "sfx/ding.wav" };

// Camera: explicit `camera` focus events, OR auto zoom-follow that tracks each
// active pulse so complex flows stay readable on small (portrait) screens.
// Enable follow with meta.camera === "follow" (passed as followMode prop).
function useCamera(events, edgeById, frame, bounds, width, height, followMode, followZoom) {
  return useMemo(() => {
    const baseScale = Math.min(width / bounds.width, height / bounds.height, 1) * 0.9;
    const fit = {
      tx: width / 2 - (bounds.width / 2) * baseScale,
      ty: height / 2 - (bounds.height / 2) * baseScale,
      scale: baseScale,
    };

    // explicit camera events win
    let focus = null;
    for (const e of events) {
      if (e.type === "camera" && e.at <= frame) focus = e;
    }
    if (focus) {
      const zoom = (focus.zoom || 1.4) * baseScale;
      const cx = bounds.width / 2;
      const cy = bounds.height / 2;
      return { tx: width / 2 - cx * zoom, ty: height / 2 - cy * zoom, scale: zoom };
    }

    if (followMode !== "follow") return fit;

    // Auto-follow: gather pulse windows [start, end] with their midpoint.
    const pulses = events
      .filter((e) => e.type === "pulse" && edgeById.get(e.edge))
      .map((e) => {
        const dur = e.durationInFrames || 30;
        const edge = edgeById.get(e.edge);
        const mid = pointAt(edge.points, 0.5);
        return { start: e.at, end: e.at + dur, mid };
      })
      .sort((a, b) => a.start - b.start);

    if (!pulses.length) return fit;

    const zoom = (followZoom || 1.9) * baseScale;
    const HOLD = 12; // frames eased between targets
    const targetFor = (m) => ({
      tx: width / 2 - m.x * zoom,
      ty: height / 2 - m.y * zoom,
      scale: zoom,
    });

    // before first pulse -> fit (whole diagram during reveals)
    if (frame < pulses[0].start - HOLD) return fit;

    // find current or upcoming pulse
    let curIdx = 0;
    for (let i = 0; i < pulses.length; i++) {
      if (frame >= pulses[i].start - HOLD) curIdx = i;
    }
    const cur = pulses[curIdx];
    const prevMid = curIdx > 0 ? pulses[curIdx - 1].mid : null;
    const isLast = curIdx === pulses.length - 1;

    // after the final pulse ends -> ease back out to fit (show whole diagram)
    if (isLast && frame >= cur.end) {
      const from = targetFor(cur.mid);
      const t = interpolate(frame, [cur.end, cur.end + HOLD], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.ease),
      });
      return {
        tx: from.tx + (fit.tx - from.tx) * t,
        ty: from.ty + (fit.ty - from.ty) * t,
        scale: from.scale + (fit.scale - from.scale) * t,
      };
    }

    const to = targetFor(cur.mid);
    // ease-in from previous target (or fit) into current focus
    const t = interpolate(frame, [cur.start - HOLD, cur.start], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.ease),
    });
    const from = prevMid ? targetFor(prevMid) : fit;
    return {
      tx: from.tx + (to.tx - from.tx) * t,
      ty: from.ty + (to.ty - from.ty) * t,
      scale: from.scale + (to.scale - from.scale) * t,
    };
  }, [events, edgeById, frame, bounds, width, height, followMode, followZoom]);
}

export function VideoDiagram({
  layout,
  events,
  groups = [],
  theme,
  legend = [],
  camera,
  cameraZoom,
  nodeAppear,
  edgeDraw,
}) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { nodes, edges, bounds } = layout;

  const edgeById = useMemo(() => new Map(edges.map((e) => [e.id, e])), [edges]);
  const cam = useCamera(events, edgeById, frame, bounds, width, height, camera, cameraZoom);

  // node flash map: node id -> latest flash start frame
  const flashes = [];
  for (const e of events) {
    if (e.type === "pulse" && e.onArrive && e.onArrive.flash) {
      const edge = edgeById.get(e.edge);
      // reverse pulse travels to->from, so it ARRIVES at edge.from
      if (edge)
        flashes.push({
          nodeId: e.reverse ? edge.from : edge.to,
          at: e.at + (e.durationInFrames || 0),
        });
    }
    if (e.type === "flash") flashes.push({ nodeId: e.target, at: e.at });
  }

  return (
    <AbsoluteFill
      style={{
        background: theme?.background || "radial-gradient(circle at 50% 30%, #0b1220, #060912)",
      }}
    >
      <svg width={width} height={height}>
        <g transform={`translate(${cam.tx} ${cam.ty}) scale(${cam.scale})`}>
          {/* group boxes (behind everything) */}
          {groups.map((box) => {
            const first = events.find(
              (e) =>
                e.type === "reveal-node" &&
                layout.nodes.find((n) => n.id === e.target && n.group === box.id)
            );
            return <GroupBox key={box.id} box={box} appearFrame={first ? first.at : 0} />;
          })}
          {/* edges */}
          {edges.map((edge) => {
            const drawEv = events.find((e) => e.type === "reveal-edge" && e.target === edge.id);
            const drawFrame = drawEv ? drawEv.at : 0;
            return (
              <DiagramEdge
                key={edge.id}
                edge={edge}
                frame={frame}
                drawFrame={drawFrame}
                drawDuration={edgeDraw}
                theme={theme}
              />
            );
          })}
          {/* pulses */}
          {events
            .filter((e) => e.type === "pulse")
            .map((e, i) => {
              const edge = edgeById.get(e.edge);
              if (!edge) return null;
              return (
                <Pulse
                  key={`p${i}`}
                  points={edge.points}
                  frame={frame}
                  startFrame={e.at}
                  durationInFrames={e.durationInFrames}
                  color={e.color || "#38bdf8"}
                  trail={e.trail !== false}
                  reverse={e.reverse === true}
                />
              );
            })}
          {/* node flash halos */}
          {flashes.map((f, i) => {
            const node = nodes.find((n) => n.id === f.nodeId);
            if (!node) return null;
            const local = frame - f.at;
            if (local < 0 || local > 20) return null;
            const r = interpolate(local, [0, 20], [node.width / 2, node.width], {
              extrapolateRight: "clamp",
            });
            const op = interpolate(local, [0, 20], [0.6, 0], { extrapolateRight: "clamp" });
            return (
              <circle
                key={`f${i}`}
                cx={node.x}
                cy={node.y}
                r={r}
                fill="none"
                stroke={theme?.flash || "#fbbf24"}
                strokeWidth={3}
                opacity={op}
              />
            );
          })}
          {/* process rings (working spinner around node) */}
          {events
            .filter((e) => e.type === "process")
            .map((e, i) => {
              const node = nodes.find((n) => n.id === e.target);
              if (!node) return null;
              return (
                <ProcessRing
                  key={`pr${i}`}
                  node={node}
                  frame={frame}
                  startFrame={e.at}
                  durationInFrames={e.durationInFrames || 40}
                  color={e.color || theme?.flash || "#38bdf8"}
                />
              );
            })}
          {/* nodes */}
          {nodes.map((node) => {
            const appearEv = events.find((e) => e.type === "reveal-node" && e.target === node.id);
            const appearFrame = appearEv ? appearEv.at : 0;
            return (
              <DiagramNode
                key={node.id}
                node={node}
                frame={frame}
                fps={fps}
                appearFrame={appearFrame}
                theme={theme}
              />
            );
          })}
        </g>
        {/* legend: fixed screen position, outside camera transform */}
        <Legend items={legend} theme={theme} appearFrame={0} />
      </svg>
      {/* sfx: declared unconditionally via Sequence so Remotion extracts audio */}
      {events.flatMap((e, i) => {
        const cues = [];
        if (e.sfx && SFX_FILES[e.sfx]) cues.push({ at: e.at, file: SFX_FILES[e.sfx], k: `s${i}` });
        if (e.onArrive && e.onArrive.sfx && SFX_FILES[e.onArrive.sfx])
          cues.push({
            at: e.at + (e.durationInFrames || 0),
            file: SFX_FILES[e.onArrive.sfx],
            k: `a${i}`,
          });
        return cues.map((c) => (
          <Sequence key={c.k} from={c.at} durationInFrames={Math.round(fps)}>
            <Audio src={staticFile(c.file)} />
          </Sequence>
        ));
      })}
    </AbsoluteFill>
  );
}
