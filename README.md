# Motion Diagram

Agent-driven animated diagram renderer. Turn an API/flow/architecture description
into an **animated MP4** (glowing pulses traveling edges, node pops, camera focus,
8-bit sfx) or an **Instagram-style carousel** (silent GIF + WebP slides).

Built for content creators. Designed to be driven by an AI agent over **MCP** —
the agent designs the scene, this tool renders it.

## Stack

- Remotion (React → MP4 via headless Chrome + ffmpeg)
- dagre (auto-layout)
- ffmpeg (sfx synthesis, GIF→WebP)
- MCP SDK (agent interface)

## Install

```bash
npm install
```

First render downloads a headless Chrome (~once).

## CLI

```bash
# video (MP4 + sfx)
npm run render examples/login-flow.json -- --out output/login-flow.mp4

# carousel (GIF + WebP per node group)
npm run render examples/login-flow.json -- --mode carousel --out output/login-carousel

# live preview studio
npm run studio
```

## Scene JSON

Agent emits nodes, edges, and a timeline. See `docs/SCHEMA.md`.

```jsonc
{
  "meta": { "title": "Login Flow", "fps": 30, "width": 1920, "height": 1080 },
  "nodes": [
    { "id": "client", "label": "Client", "shape": "rect", "icon": "user" },
    { "id": "api", "label": "API", "shape": "rect", "icon": "server" },
    { "id": "db", "label": "DB", "shape": "stadium", "icon": "database" },
  ],
  "edges": [
    { "id": "e1", "from": "client", "to": "api", "label": "POST /login" },
    { "id": "e2", "from": "api", "to": "db", "label": "query" },
  ],
  "timeline": [
    { "at": 0, "type": "reveal-node", "target": "client" },
    { "at": 8, "type": "reveal-node", "target": "api" },
    { "at": 16, "type": "reveal-node", "target": "db" },
    { "at": 24, "type": "reveal-edge", "target": "e1" },
    { "at": 42, "type": "reveal-edge", "target": "e2" },
    {
      "at": 60,
      "type": "pulse",
      "edge": "e1",
      "color": "#38bdf8",
      "onArrive": { "flash": true, "sfx": "beep" },
    },
    {
      "at": 95,
      "type": "pulse",
      "edge": "e2",
      "color": "#34d399",
      "onArrive": { "flash": true, "sfx": "ding" },
    },
  ],
}
```

## Motion primitives

| type          | effect                                              |
| ------------- | --------------------------------------------------- |
| `reveal-node` | node pops in (spring scale + fade)                  |
| `reveal-edge` | edge draws like a pen                               |
| `pulse`       | glowing comet travels edge (data flow), multi-color |
| `flash`       | node glow burst                                     |
| `camera`      | pan/zoom focus to a node                            |

## Sound

Bundled 8-bit sfx in `public/sfx/`: `beep`, `whoosh`, `ding`. Chosen **per event**
by the agent (`sfx` / `onArrive.sfx`), or `none`. Swap the WAV files to rebrand.

## Icons

`user client server api database cloud queue cache lock key gear bolt globe
mobile mail file check cross warning`

## MCP (for AI agents)

Run the server:

```bash
npm run mcp
```

Register in an MCP client:

```json
{
  "mcpServers": {
    "motion-diagram": {
      "command": "node",
      "args": ["/home/nst/WebstormProjects/motion-diagram/src/mcp/server.js"],
      "env": { "MOTION_OUT_DIR": "/home/nst/WebstormProjects/motion-diagram/output" }
    }
  }
}
```

Tools:

- `get_scene_schema` — call first, returns authoring contract
- `render_motion_diagram` — scene → MP4
- `render_carousel` — scene → GIF/WebP slides (by node `group`)

Agent guidance: `docs/AGENT_SKILL.md`.

## Project layout

```
src/core/    parser, layout (dagre), timeline normalizer
src/scenes/  Remotion components (node, edge, pulse, composition, root)
src/render/  MP4 + carousel render orchestration
src/cli/     CLI entry
src/mcp/     MCP server
public/sfx/  bundled 8-bit sounds
docs/        SPEC, SCHEMA, AGENT_SKILL
examples/    sample scenes
```

```

```
