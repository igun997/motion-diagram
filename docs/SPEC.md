# Motion Diagram — Spec

Turn flowchart text into animated video (MP4) or carousel (GIF/WebP) for content creators.

## Engine

Remotion (React → MP4 via headless Chrome + ffmpeg). Native audio/sfx sync, MP4/GIF/WebP export.

## Input

Mermaid-like text syntax:

```
A[Start] --> B[Load data]
B --> C{Valid?}
C -->|yes| D[Save]
C -->|no| E[Error]
```

Parsed into scene spec: nodes (id, label, shape, x, y), edges (from, to, label).

## Modes

### video

- Single diagram, step-by-step animated reveal.
- Output: MP4 with sfx audio track.
- Motion combo per step:
  - node appear (fade + pop scale)
  - edge draw (pen stroke, stroke-dashoffset)
  - particle flow on active edge (data-flow feel)
  - camera focus zoom to active node/step

### carousel

- Diagram split into slides (Instagram-style).
- Output: animated WebP + GIF per slide. Silent loop.
- Each slide = short looping reveal of one step-group.

## Sound (video mode only)

Bundled 8-bit retro blips in assets/sfx. Creator can swap files.

| Event           | SFX    |
| --------------- | ------ |
| node appear     | beep   |
| edge draw       | whoosh |
| step transition | ding   |

## Timing model

- Each step = N frames (configurable, default 30 = 1s @ 30fps).
- SFX triggered at step start frame via Remotion `<Audio>` with `startFrom`.

## Structure

```
src/
  core/     parser (text -> spec), layout (auto-position nodes)
  scenes/   Remotion compositions (VideoDiagram, CarouselSlide)
  render/   render orchestration, gif/webp export
  cli/      CLI entry (parse args, kick render)
  audio/    sfx event mapping
assets/sfx/ bundled 8-bit sounds
assets/fonts/
output/     rendered files
examples/   sample .mmd diagrams
```

## CLI (planned)

```
motion-diagram render diagram.mmd --mode video --out output/demo.mp4
motion-diagram render diagram.mmd --mode carousel --out output/slides/
```

## Layout

Auto-layout via dagre (directed graph positioning) → clean flowchart placement.
