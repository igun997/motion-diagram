// Main Remotion composition. Executes normalized timeline over a laid-out spec.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Audio, staticFile } from "remotion";
import { interpolate } from "remotion";
import { DiagramNode } from "./DiagramNode.jsx";
import { DiagramEdge } from "./DiagramEdge.jsx";
import { Pulse } from "./Pulse.jsx";
import { pointAt } from "./geometry.js";

const SFX_FILES = { beep: "sfx/beep.wav", whoosh: "sfx/whoosh.wav", ding: "sfx/ding.wav" };

// Camera: find active focus event at/before current frame.
function useCamera(events, frame, bounds, width, height) {
  return useMemo(() => {
    let focus = null;
    for (const e of events) {
      if (e.type === "camera" && e.at <= frame) focus = e;
    }
    const baseScale = Math.min(width / bounds.width, height / bounds.height, 1) * 0.9;
    if (!focus) {
      return { tx: width / 2 - (bounds.width / 2) * baseScale, ty: height / 2 - (bounds.height / 2) * baseScale, scale: baseScale };
    }
    const zoom = (focus.zoom || 1.4) * baseScale;
    const cx = bounds.width / 2;
    const cy = bounds.height / 2;
    return { tx: width / 2 - cx * zoom, ty: height / 2 - cy * zoom, scale: zoom };
  }, [events, frame, bounds, width, height]);
}

export function VideoDiagram({ layout, events, nodeAppear, edgeDraw }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { nodes, edges, bounds } = layout;

  const edgeById = useMemo(() => new Map(edges.map((e) => [e.id, e])), [edges]);
  const cam = useCamera(events, frame, bounds, width, height);

  // node flash map: node id -> latest flash start frame
  const flashes = [];
  for (const e of events) {
    if (e.type === "pulse" && e.onArrive && e.onArrive.flash) {
      const edge = edgeById.get(e.edge);
      if (edge) flashes.push({ nodeId: edge.to, at: e.at + (e.durationInFrames || 0) });
    }
    if (e.type === "flash") flashes.push({ nodeId: e.target, at: e.at });
  }

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, #0b1220, #060912)" }}>
      <svg width={width} height={height}>
        <g transform={`translate(${cam.tx} ${cam.ty}) scale(${cam.scale})`}>
          {/* edges */}
          {edges.map((edge) => {
            const drawEv = events.find((e) => e.type === "reveal-edge" && e.target === edge.id);
            const drawFrame = drawEv ? drawEv.at : 0;
            return <DiagramEdge key={edge.id} edge={edge} frame={frame} drawFrame={drawFrame} drawDuration={edgeDraw} />;
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
                />
              );
            })}
          {/* node flash halos */}
          {flashes.map((f, i) => {
            const node = nodes.find((n) => n.id === f.nodeId);
            if (!node) return null;
            const local = frame - f.at;
            if (local < 0 || local > 20) return null;
            const r = interpolate(local, [0, 20], [node.width / 2, node.width], { extrapolateRight: "clamp" });
            const op = interpolate(local, [0, 20], [0.6, 0], { extrapolateRight: "clamp" });
            return <circle key={`f${i}`} cx={node.x} cy={node.y} r={r} fill="none" stroke="#fbbf24" strokeWidth={3} opacity={op} />;
          })}
          {/* nodes */}
          {nodes.map((node) => {
            const appearEv = events.find((e) => e.type === "reveal-node" && e.target === node.id);
            const appearFrame = appearEv ? appearEv.at : 0;
            return <DiagramNode key={node.id} node={node} frame={frame} fps={fps} appearFrame={appearFrame} />;
          })}
        </g>
      </svg>
      {/* sfx */}
      {events.flatMap((e, i) => {
        const cues = [];
        if (e.sfx && SFX_FILES[e.sfx]) cues.push({ frame: e.at, file: SFX_FILES[e.sfx], k: `s${i}` });
        if (e.onArrive && e.onArrive.sfx && SFX_FILES[e.onArrive.sfx])
          cues.push({ frame: e.at + (e.durationInFrames || 0), file: SFX_FILES[e.onArrive.sfx], k: `a${i}` });
        return cues.map((c) => <SfxAt key={c.k} frame={frame} cueFrame={c.frame} file={c.file} fps={fps} />);
      })}
    </AbsoluteFill>
  );
}

function SfxAt({ frame, cueFrame, file, fps }) {
  if (frame < cueFrame || frame > cueFrame + fps) return null;
  return <Audio src={staticFile(file)} />;
}
