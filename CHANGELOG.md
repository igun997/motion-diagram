# Changelog

All notable changes to this project are documented here. Format based on
[Keep a Changelog](https://keepachangelog.com/), versioning follows
[SemVer](https://semver.org/).

## [1.0.4] - 2026-07-09

### Fixed

- **`motion-diagram install-skill` and `doctor` were not wired into the CLI** —
  the bin only handled `render`, so the documented `install-skill` command just
  printed usage and exited. Both subcommands now dispatch correctly, and the
  usage text lists all three commands.

## [1.0.3] - 2026-07-09

### Fixed

- **MCP wrote output into the package install dir** (e.g.
  `.../node_modules/motion-diagram/output/`), where users couldn't find it.
  Default output now goes to `MOTION_OUT_DIR` or `<cwd>/motion-diagram-output`,
  never the package location.

### Added

- **Installable `SKILL.md`** (`skills/motion-diagram/`) with agent frontmatter.
  `install-skill` now also copies it into file-based skill dirs
  (`~/.pi/agent/skills/`, `~/.claude/skills/`) so agents load the when/how
  guidance at startup, not only via `get_scene_schema`.
- **`outDir` parameter** on `render_motion_diagram` and `render_carousel` so the
  agent can write straight into the user's project/output folder.
- **`get_scene_schema` now returns the full agent skill** (workflow, sfx,
  colors, themes, presets, camera) followed by the scene JSON contract —
  previously it returned only the schema, leaving the agent without the
  authoring playbook.

## [1.0.2] - 2026-07-09

### Fixed

- **Render failed when the package was installed as a dependency** (e.g. the MCP
  server run via `npx motion-diagram-mcp`): `Module parse failed: Unexpected
token` at `<Composition>`. Remotion's bundler excludes `node_modules` from its
  JSX loader, so the package's own `.jsx` scenes were left untransformed. Added a
  `webpackOverride` (esbuild-loader) that transpiles this package's source
  wherever it lives. CLI, MCP, and carousel renders now work from an installed
  copy.

## [1.0.1] - 2026-07-09

### Fixed

- **Follow camera never zoomed out after the final pulse.** In `camera:"follow"`
  mode the view locked onto the last pulse's midpoint until the end of the video,
  leaving reels/portrait endings cropped on the final edge. The camera now eases
  back to a full-diagram fit once the final pulse's window ends. Affects every
  follow-mode scene (gRPC, LLM, Android, etc.).

### Added

- **gRPC how-it-works example** (`examples/grpc-how-it-works.json`) — Instagram
  reels, midnight theme, follow camera. Shows Client (App → Stub → Protobuf
  encode) → HTTP/2 channel → Server (dispatch → handler → store), with process
  rings, a reverse pulse for the store read-back, and double streaming response
  pulses.

## [1.0.0] - 2026-07-09

### Added

- Initial public release.
- Animated **MP4** renderer: glowing pulses along edges, node reveals, process
  rings, `camera:"follow"` zoom-tracking, and 8-bit sound effects.
- Silent **carousel** renderer (GIF + WebP), one slide per node `group`.
- **MCP server** with `get_scene_schema`, `render_motion_diagram`, and
  `render_carousel` tools.
- Scene features: icons (built-in / emoji / custom SVG path), group boxes,
  5 themes + overrides, edge line styles (solid/dashed/dotted) + legend,
  reverse pulses, size presets (reels, tiktok, youtube, threads, whatsapp, ...).
- Tooling: ESLint + Prettier, `npm run doctor` environment check, and
  `install-skill` to register the MCP server with Cursor, Claude Desktop, and Pi.
- CI (lint + prettier) and npm publish-on-release workflows.

[1.0.4]: https://github.com/igun997/motion-diagram/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/igun997/motion-diagram/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/igun997/motion-diagram/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/igun997/motion-diagram/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/igun997/motion-diagram/releases/tag/v1.0.0
