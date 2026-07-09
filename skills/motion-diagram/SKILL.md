---
name: motion-diagram
description: Create animated API/flow/architecture diagram videos (MP4 with sound) or silent Instagram-style carousels, driven over MCP. Use when the user wants to visualize or explain a system, API flow, pipeline, sequence, or architecture as an animated video, reel, or carousel — e.g. "animate our login flow", "make a diagram video of how gRPC works", "show the checkout pipeline as an Instagram reel". Nodes are services/steps, edges are connections, and glowing pulses travel the edges to simulate data flow.
---

# Motion Diagram

Render animated diagrams where colored pulses travel along edges to show data
flow. Output is an **MP4** (motion + 8-bit sfx) or a silent **carousel**
(GIF + WebP, one slide per node group). You design the scene as JSON; the
Motion Diagram MCP renders it deterministically.

## Prerequisite

The `motion-diagram` MCP server must be registered with this agent. If the
tools below are missing, tell the user to run:

```bash
npx motion-diagram install-skill
```

## Tools (MCP)

- `get_scene_schema` — **call this FIRST.** Returns the full authoring guide
  (workflow, sfx, colors, themes, presets, camera) + the scene JSON contract.
- `render_motion_diagram` — scene → MP4. Pass `outDir` = the user's
  project/output folder so the file lands where they can find it.
- `render_carousel` — scene → GIF/WebP slides (one per node `group`).

## Workflow

1. Call `get_scene_schema` once to load the authoring contract + guidance.
2. Pick the canvas: `meta.preset` (`instagram-reels`, `youtube`, ...) + `theme`.
3. Design **nodes** (service/step; `shape` + `icon`, group into tiers).
4. Design **edges** (short `label`, `style` solid/dashed/dotted, `color`).
5. Choreograph the **timeline**: `reveal-node` → `reveal-edge` → `pulse`
   comets (with `onArrive.flash` + sfx), plus optional `process` rings,
   `reverse` response pulses, and `camera:"follow"` for long flows.
6. Render with `render_motion_diagram` (or `render_carousel`), passing `outDir`.
   Report the returned output path to the user.

## Key ideas

- **SFX by meaning**: `whoosh` = sent, `beep` = received/transit, `ding` =
  success/final. One dominant sound per beat; end the flow on a single `ding`.
- **Color by flow**: blue `#38bdf8` request, green `#34d399` response/success,
  red `#f43f5e` error.
- **Mobile**: use a vertical `preset` (reels/story/tiktok) + `camera:"follow"`
  for complex flows on small screens.
- Keep it to 3–7 nodes for a clean read. Every data-carrying edge gets a pulse.

The scene JSON contract and every field are returned by `get_scene_schema` —
always read it before authoring.
