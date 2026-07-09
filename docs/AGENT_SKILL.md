# Agent Skill: Motion Diagram

How an AI agent should drive the Motion Diagram MCP.

## When to use
User asks to visualize/explain a system, API flow, pipeline, architecture, or
process as an animated video or carousel. Examples: "show login flow", "animate
our checkout pipeline", "make a diagram video of the payment API".

## Workflow
1. Call `get_scene_schema` once to load the authoring contract.
2. Design the scene from the user's description:
   - **nodes**: each service/step. Pick `shape` (rect=service, diamond=decision,
     stadium=datastore/endpoint) and `icon` (user, server, database, cloud, lock,
     queue, cache, api, globe, key, bolt, mail, gear...).
   - **edges**: connections, with short `label` (e.g. "POST /login").
   - **timeline**: choreograph the story:
     a. `reveal-node` each node (stagger ~8 frames apart).
     b. `reveal-edge` each edge after its nodes exist.
     c. `pulse` comets along edges to simulate traffic — set `color` per hop,
        `onArrive.flash: true`, and sfx.
3. Choose sfx **per event** (agent's call): `beep` on arrival, `whoosh` on send,
   `ding` on success/final, or `none`. Do not overuse — silence is fine.

## SFX by purpose (agent decides intent)
Map sound to the *meaning* of the moment, not mechanically:
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
4. Call `render_motion_diagram` (MP4) or `render_carousel` (grouped slides).

## Timing rules (30fps default)
- Node reveals: 8 frames apart.
- Edge draw: ~18 frames.
- Pulse travel: ~30 frames (tune with `speed`; 2 = twice as fast).
- Start pulses only after all reveals finish, so the build reads clearly.

## Color guidance
- Use one hue per logical flow (request vs response vs error).
- Errors: red `#f43f5e`. Success: green `#34d399`. Request: blue `#38bdf8`.

## Carousel
- Set `group` on nodes to split into slides (one slide per group).
- Carousel is silent (looping GIF+WebP). Keep each group small (2-4 nodes).

## Good scene traits
- 3-7 nodes for a clean read.
- Every edge that carries data gets a pulse.
- Final successful hop ends with a `ding`.
- Add a `camera` focus event to zoom into a decision if the graph is large.
