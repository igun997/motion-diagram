// Remotion Root. Reads scene JSON from an env var (set by CLI), lays it out,
// normalizes timeline, registers a single dynamic composition.
import React from "react";
import { Composition } from "remotion";
import { VideoDiagram } from "./VideoDiagram.jsx";
import { layoutDiagram } from "../core/layout.js";
import { normalizeTimeline, timelineDuration } from "../core/timeline.js";

function loadScene() {
  const raw = process.env.MOTION_SCENE_JSON;
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      // fall through to default
    }
  }
  // default demo scene
  return {
    meta: { title: "Demo", fps: 30, width: 1920, height: 1080, mode: "video" },
    nodes: [
      { id: "client", label: "Client", shape: "rect", icon: "user" },
      { id: "api", label: "API", shape: "rect", icon: "server" },
      { id: "db", label: "DB", shape: "stadium", icon: "database" },
    ],
    edges: [
      { id: "e1", from: "client", to: "api", label: "request" },
      { id: "e2", from: "api", to: "db", label: "query" },
    ],
    timeline: [
      { at: 0, type: "reveal-node", target: "client" },
      { at: 10, type: "reveal-node", target: "api" },
      { at: 20, type: "reveal-node", target: "db" },
      { at: 26, type: "reveal-edge", target: "e1" },
      { at: 44, type: "reveal-edge", target: "e2" },
      { at: 50, type: "pulse", edge: "e1", color: "#38bdf8", onArrive: { flash: true, sfx: "beep" } },
      { at: 82, type: "pulse", edge: "e2", color: "#f59e0b", onArrive: { flash: true, sfx: "beep" } },
    ],
  };
}

export function RemotionRoot() {
  const scene = loadScene();
  const fps = scene.meta?.fps || 30;
  const width = scene.meta?.width || 1920;
  const height = scene.meta?.height || 1080;

  const layout = layoutDiagram({ nodes: scene.nodes, edges: scene.edges });
  const events = normalizeTimeline(scene.timeline, fps);
  const duration = timelineDuration(events);

  return (
    <Composition
      id="MotionDiagram"
      component={VideoDiagram}
      durationInFrames={duration}
      fps={fps}
      width={width}
      height={height}
      defaultProps={{ layout, events, nodeAppear: 20, edgeDraw: 18 }}
    />
  );
}
