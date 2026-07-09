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
    "mode": "video", // "video" | "carousel"
    "preset": "instagram-reels", // optional; sets w/h/fps (see Size presets)
    "theme": "dark", // dark | light | midnight | blueprint | mono
    "camera": "fit", // "fit" (default) | "follow" (auto zoom-track pulses)
    "cameraZoom": 1.8, // follow-mode zoom factor (default 1.9)
    // optional: "themeOverrides": { "background": "...", "nodeText": "...", "shapes": {...} }
  },
  "groups": [
    /* Group[]  optional, draws process boxes */
  ],
  "legend": [
    /* Legend[] optional, explains line styles */
  ],
  "nodes": [
    /* Node[] */
  ],
  "edges": [
    /* Edge[] */
  ],
  "timeline": [
    /* Event[] */
  ],
}
```

## Group (process box)

Any nodes sharing `group` are wrapped in an animated dashed box.

```jsonc
{
  "id": "backend", // matches node.group
  "label": "Backend Services",
  "color": "#a78bfa", // box border + label tab color
}
```

## Legend

Fixed-position key explaining what each line style/color means.

```jsonc
{ "label": "Async event", "color": "#a78bfa", "style": "dashed" } // style: solid | dashed | dotted
```

## Node

```jsonc
{
  "id": "api",
  "label": "API Gateway",
  "shape": "rect", // rect | diamond | stadium
  "icon": "server", // built-in key (Icon set) OR an emoji like "🛒"
  "iconText": "⚡", // optional: explicit emoji/char glyph
  "iconPath": "M4 4h16...", // optional: raw SVG path 'd' in 24x24 viewBox (agent-drawn)
  "group": "backend", // optional; wraps in process box + carousel grouping
}
```

Node width auto-sizes to label + icon (no text overflow). Agent picks any icon
form freely: built-in key, emoji, or custom `iconPath`.

## Icon set

Built-in icon keys (rendered as SVG glyph left of label):
`user`, `client`, `server`, `api`, `database`, `cloud`, `queue`, `cache`,
`lock`, `key`, `gear`, `bolt`, `globe`, `mobile`, `mail`, `file`, `check`,
`cross`, `warning`. Unknown long key → no icon. Short unknown key (≤3 chars) →
rendered as emoji/text. Agents may invent glyphs via `iconText` or `iconPath`.

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
  "label": "POST /login", // optional
  "color": "#38bdf8", // optional line + arrow color
  "style": "solid", // solid | dashed | dotted (marching-ants when dashed/dotted)
}
```

## Timeline Event

Drives all motion. `at` = frame offset (or seconds if `atSec`).

```jsonc
{
  "at": 0, // frame; or "atSec": 1.5
  "type": "pulse", // pulse | reveal-node | reveal-edge | flash | process | camera
  // --- pulse ---
  "edge": "e1",
  "color": "#38bdf8",
  "speed": 1, // 1 = default travel duration
  "reverse": false, // true = travel to->from (response/return pulse)
  "trail": true, // comet trail
  "onArrive": { "flash": true, "sfx": "beep" },
  // --- reveal-node / reveal-edge / process ---
  "target": "api",
  // --- process (spinning 'working' ring around a node) ---
  // "type":"process", "target":"api", "durationInFrames":50, "color":"#a78bfa"
  // --- camera ---
  "focus": "api", // node id or "fit"
  "zoom": 1.4,
  // --- audio (any event) ---
  "sfx": "whoosh", // beep | whoosh | ding | none
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
    { "id": "db", "label": "DB", "shape": "stadium" },
  ],
  "edges": [
    { "id": "e1", "from": "client", "to": "api", "label": "POST /login" },
    { "id": "e2", "from": "api", "to": "auth" },
    { "id": "e3", "from": "auth", "to": "db", "label": "yes" },
  ],
  "timeline": [
    { "at": 0, "type": "reveal-node", "target": "client" },
    { "at": 10, "type": "reveal-node", "target": "api" },
    { "at": 20, "type": "reveal-edge", "target": "e1" },
    {
      "at": 30,
      "type": "pulse",
      "edge": "e1",
      "color": "#38bdf8",
      "onArrive": { "flash": true, "sfx": "beep" },
    },
    {
      "at": 60,
      "type": "pulse",
      "edge": "e2",
      "color": "#f59e0b",
      "onArrive": { "flash": true, "sfx": "beep" },
    },
  ],
}
```

## Why agent-driven

User speaks English ("show me a login flow with token check"). Agent designs
nodes/edges + choreographs pulses/timing/colors/sfx into this JSON. Renderer just
executes deterministically → MP4 or carousel. No manual drawing.
