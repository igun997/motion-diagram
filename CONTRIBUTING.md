# Contributing to Motion Diagram

Thanks for helping improve Motion Diagram — an agent-driven renderer that turns a
JSON scene into an animated API/flow **video** (MP4 with sound) or a silent
**carousel** (GIF + WebP). This guide covers local setup, coding standards, and
the PR flow.

## Prerequisites

- **Node.js >= 18** (tested on 22.x)
- **ffmpeg / ffprobe** on `PATH` (used to generate SFX and verify output)
- A working Chrome/Chromium (Remotion downloads a headless build on first render)

Run the built-in checker to confirm your environment is ready:

```bash
npm run doctor
```

## Local setup

```bash
git clone https://github.com/igun997/motion-diagram.git
cd motion-diagram
npm install
npm run doctor          # verify prerequisites
npm run render examples/login-flow.json -- --out output/login-flow.mp4
```

Useful scripts:

| Script | What it does |
|--------|--------------|
| `npm run render <scene.json> -- --out <file>` | Render a scene to MP4 or carousel |
| `npm run studio` | Open Remotion Studio for live preview |
| `npm run mcp` | Start the MCP server (stdio) |
| `npm run lint` | ESLint over the codebase |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check (CI uses this) |
| `npm run doctor` | Verify Node, ffmpeg, deps |

## Project layout

```
src/
  core/      parser, layout (dagre), timeline, groups, presets
  scenes/    Remotion composition + components (nodes, edges, pulses, ...)
  render/    MP4 + carousel renderers
  cli/       command-line entry
  mcp/       MCP server (tools the agent calls)
docs/        SCHEMA.md (contract) + AGENT_SKILL.md (how an agent authors scenes)
examples/    ready-to-render scene JSON
scripts/     doctor + skill installer
```

## Coding standards

- **Formatting**: Prettier (`.prettierrc.json`). Run `npm run format` before
  committing. CI runs `npm run format:check` and fails on drift.
- **Linting**: ESLint flat config (`eslint.config.js`). Keep `npm run lint` at
  zero errors (warnings for unused `React` imports are tolerated).
- **Modules**: ES modules only (`"type": "module"`). Use `import`, not `require`.
- **Style**: 2-space indent, double quotes, semicolons, 100-col print width.
- **No secrets** in commits. `.env`, credentials, keys stay out of the repo.

## Making changes

1. Fork and branch from `main` (`feat/...`, `fix/...`, `docs/...`).
2. Keep PRs focused — one logical change per PR.
3. If you add a scene feature (new event type, node/edge field), you **must**:
   - implement it in `src/scenes` / `src/core`,
   - document it in `docs/SCHEMA.md` (the contract) **and**
     `docs/AGENT_SKILL.md` (how an agent should use it),
   - add or update an example in `examples/` and render it to confirm it works.
4. Run `npm run format` + `npm run lint` locally.
5. Verify at least one render still succeeds:
   ```bash
   npm run render examples/login-flow.json -- --out output/_check.mp4
   ffprobe output/_check.mp4        # should show video + audio streams
   ```

## Commit messages

Conventional commits are preferred:

```
feat: add dotted edge style
fix: reverse pulse flash targeted wrong node
docs: document process event in SCHEMA
chore: bump remotion
```

## Pull requests

- Every PR runs the **CI** workflow: ESLint + Prettier check. Both must pass.
- Describe *what* changed, *why*, and *how you verified* (which example you
  rendered, ffprobe output).
- Screenshots or a short clip of the rendered result are very welcome.

## Releasing (maintainers)

Publishing to npm is automated. Create a GitHub Release with a `v*` tag
(e.g. `v1.1.0`) and the **publish** workflow builds and pushes `motion-diagram`
to npm. See `.github/workflows/publish.yml`. The `NPM_TOKEN` secret must be set
in the repository.

## Code of conduct

Be kind, assume good intent, keep feedback technical. Harassment or
discrimination is not tolerated.
