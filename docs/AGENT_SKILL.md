# Agent Skill: Motion Diagram

How an AI agent should drive the Motion Diagram MCP.

## When to use

User asks to visualize/explain a system, API flow, pipeline, architecture, or
process as an animated video or carousel. Examples: "show login flow", "animate
our checkout pipeline", "make a diagram video of the payment API".

## Workflow (do these in order)

1. Call `get_scene_schema` once to load the authoring contract.
2. Pick the **canvas**: set `meta.preset` (e.g. `instagram-reels`, `youtube`) and
   `meta.theme`. Vertical presets → lay the flow top→bottom.
3. Design **nodes** — one per service/step. Choose `shape` (rect=service,
   diamond=decision, stadium=datastore/endpoint) and an `icon` (built-in key,
   emoji, or custom `iconPath`). Group related nodes with `group` + a `groups`
   entry to draw process boxes / tiers.
4. Design **edges** — connections with a short `label` ("POST /login"). Set
   `style` (solid=sync, dashed=async/event, dotted=cache/optional) and `color`
   by meaning. Add a `legend` so viewers can read the line language.
5. Choreograph the **timeline** (see Timing rules):
   a. `reveal-node` each node, ~8 frames apart.
   b. `reveal-edge` each edge after both its nodes exist.
   c. `pulse` comets along edges once all reveals finish. Set `color` per hop,
   `onArrive.flash: true`, and an sfx (see SFX by purpose).
   d. Optional: `process` ring while a node works; `reverse` pulse for a
   response; `camera:"follow"` for long/complex flows.
6. Render: `render_motion_diagram` (MP4 with sound) or `render_carousel`
   (silent grouped slides). Tell the user the output path returned by the tool.

## Choosing output mode

- **MP4** (`render_motion_diagram`): default. Has motion + sound. Use for reels,
  shorts, explainer clips — anything with a temporal story.
- **Carousel** (`render_carousel`): silent GIF+WebP, one slide per `group`. Use
  when the user wants swipeable Instagram-style stills, not a video.

## SFX by purpose (agent decides intent)

Map sound to the _meaning_ of the moment, not mechanically:

- **whoosh** — a request is SENT / leaves a node / fire-and-forget (outbound).
- **beep** — a hop is RECEIVED / acknowledged / internal step done (transit).
- **ding** — SUCCESS / final response delivered / commit / positive terminal.
- **beep (low) + red pulse** — error/deny arrival (pair `#f43f5e` with `beep`).
- **none** — reveals, background/return pulses, anything that would add noise.
  Rule: one dominant sound per beat. If two pulses arrive together, sfx the
  primary one only. End the whole flow on a single `ding`.

## Request/response round-trips

Simulate a full cycle on ONE edge:

1. outbound pulse `from->to` (e.g. blue `#38bdf8`, sfx `whoosh`/`beep`).
2. later, response pulse on the SAME edge with `"reverse": true` and a
   different color (e.g. green `#34d399`) traveling `to->from`.
   Return pulses usually get `sfx: none` except the final one to the client (`ding`).

## Timing rules (30fps default)

- Node reveals: 8 frames apart.
- Edge draw: ~18 frames.
- Pulse travel: ~30 frames (tune with `speed`; 2 = twice as fast).
- Start pulses only after all reveals finish, so the build reads clearly.

## Color guidance

- Use one hue per logical flow (request vs response vs error).
- Errors: red `#f43f5e`. Success: green `#34d399`. Request: blue `#38bdf8`.

## Themes (agent picks the vibe)

Set `meta.theme`: `dark` (default), `light`, `midnight`, `blueprint`, `mono`.
Use `light` for clean/corporate, `blueprint` for infra/architecture, `mono` for
minimal. Tweak any color via `meta.themeOverrides`.

## Line styles + legend (say what each line means)

- Give each edge a `style`: `solid` (sync call), `dashed` (async/event),
  `dotted` (cache/optional). Dashed/dotted animate as marching-ants.
- Give edges a `color` to group flows by meaning.
- Add a `legend` array so viewers know what each line represents.

## Group boxes (process containers)

- Add `groups: [{id,label,color}]` and set matching `node.group`.
- Boxes auto-size with gap; use to show tiers (frontend/backend/data,
  master/slave, service mesh). Great for infra diagrams.

## Icons (use freely)

- Built-in key (`server`, `database`, `cache`, ...), OR an emoji in `icon`,
  OR explicit `iconText: "⚡"`, OR custom `iconPath` (SVG path in 24x24).
- Nodes auto-widen so labels never overflow the border.

## Canvas size / mobile

- Landscape default `1920x1080`. For mobile/reels set portrait
  `width:1080, height:1920`. Keep flows vertical (top→bottom) so they fit.
- Prefer a `meta.preset` over raw dims: `instagram-reels`, `instagram-story`,
  `instagram-post`, `instagram-portrait`, `tiktok`, `youtube`, `youtube-shorts`,
  `threads`, `whatsapp`, `whatsapp-status`, `twitter`, `landscape`.

## Zoom-follow camera (complex flows on small screens)

- Set `meta.camera:"follow"` (+ optional `meta.cameraZoom`, default 1.9). Camera
  shows the whole diagram during reveals, then auto zooms into each pulse as it
  fires, with eased transitions. Ideal for tall reels with many nodes.
- Leave as `"fit"` (default) for small diagrams that fit on screen.

## Process animation (a node is "working")

- Emit `{ "type":"process", "target":"nodeId", "at":N, "durationInFrames":50,
"color":"#a78bfa" }` to spin a ring around a node while it does work
  (DB query, camera open, computation). Overlap it with the pulses it triggers.

## Carousel

- Set `group` on nodes to split into slides (one slide per group).
- Carousel is silent (looping GIF+WebP). Keep each group small (2-4 nodes).

## Good scene traits

- 3-7 nodes for a clean read.
- Every edge that carries data gets a pulse.
- Final successful hop ends with a `ding`.
- Add a `camera` focus event to zoom into a decision if the graph is large.
