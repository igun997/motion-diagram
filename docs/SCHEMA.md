# Agent Scene Schema

AI Agent emits this JSON. Renderer executes it. Agent = brain, renderer = executor.

## Top-level

```jsonc
{
  "meta": {
    "title": "Login API Flow",
    "fps": 30,
    "width": 1920,
    "height": 1080,
    "mode": "video"          // "video" | "carousel"
  },
  "nodes": [ /* Node[] */ ],
  "edges": [ /* Edge[] */ ],
  "timeline": [ /* Event[] */ ]
}
```

## Node
```jsonc
{
  "id": "api",
  "label": "API Gateway",
  "shape": "rect",           // rect | diamond | stadium
  "icon": "server",          // optional icon key (see Icon set below)
  "group": "backend"         // optional, for carousel slide grouping / color theme
}
```

## Icon set
Built-in icon keys (rendered as SVG glyph left of label):
`user`, `client`, `server`, `api`, `database`, `cloud`, `queue`, `cache`,
`lock`, `key`, `gear`, `bolt`, `globe`, `mobile`, `mail`, `file`, `check`,
`cross`, `warning`. Unknown key → no icon.
```jsonc
{ "//": "placeholder to keep block" }
```
Position auto-computed by dagre layout. Agent does NOT set x/y.

## Edge
```jsonc
{
  "id": "e1",
  "from": "client",
  "to": "api",
  "label": "POST /login"     // optional
}
```

## Timeline Event
Drives all motion. `at` = frame offset (or seconds if `atSec`).

```jsonc
{
  "at": 0,                    // frame; or "atSec": 1.5
  "type": "pulse",            // pulse | reveal-node | reveal-edge | flash | camera
  // --- pulse ---
  "edge": "e1",
  "color": "#38bdf8",
  "speed": 1,                 // 1 = default travel duration
  "trail": true,              // comet trail
  "onArrive": { "flash": true, "sfx": "beep" },
  // --- reveal-node / reveal-edge ---
  "target": "api",
  // --- camera ---
  "focus": "api",             // node id or "fit"
  "zoom": 1.4,
  // --- audio (any event) ---
  "sfx": "whoosh"             // beep | whoosh | ding | none
}
```

## Motion primitives
- **reveal-node**: node pops in (spring scale+fade).
- **reveal-edge**: edge draws like pen (stroke-dashoffset).
- **pulse**: glowing dot/comet travels along edge from→to; multi-color, concurrent allowed.
- **flash**: node glow burst on pulse arrival.
- **camera**: pan/zoom focus to node or fit-all.

## Example (Login flow)
```jsonc
{
  "meta": { "title": "Login Flow", "fps": 30, "mode": "video" },
  "nodes": [
    { "id": "client", "label": "Client", "shape": "rect" },
    { "id": "api", "label": "API", "shape": "rect" },
    { "id": "auth", "label": "Auth?", "shape": "diamond" },
    { "id": "db", "label": "DB", "shape": "stadium" }
  ],
  "edges": [
    { "id": "e1", "from": "client", "to": "api", "label": "POST /login" },
    { "id": "e2", "from": "api", "to": "auth" },
    { "id": "e3", "from": "auth", "to": "db", "label": "yes" }
  ],
  "timeline": [
    { "at": 0,  "type": "reveal-node", "target": "client" },
    { "at": 10, "type": "reveal-node", "target": "api" },
    { "at": 20, "type": "reveal-edge", "target": "e1" },
    { "at": 30, "type": "pulse", "edge": "e1", "color": "#38bdf8",
      "onArrive": { "flash": true, "sfx": "beep" } },
    { "at": 60, "type": "pulse", "edge": "e2", "color": "#f59e0b",
      "onArrive": { "flash": true, "sfx": "beep" } }
  ]
}
```

## Why agent-driven
User speaks English ("show me a login flow with token check"). Agent designs
nodes/edges + choreographs pulses/timing/colors/sfx into this JSON. Renderer just
executes deterministically → MP4 or carousel. No manual drawing.
