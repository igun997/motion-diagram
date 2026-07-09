# Install & Use

Motion Diagram ships as an npm package with two binaries:

- `motion-diagram` — CLI renderer
- `motion-diagram-mcp` — MCP server for AI agents

## Requirements

- Node.js >= 18
- ffmpeg / ffprobe on `PATH`
- Chrome/Chromium (Remotion auto-downloads a headless build on first render)

Check everything at once:

```bash
npx motion-diagram doctor   # or: npm run doctor (from a clone)
```

## Quick start (no install)

```bash
npx motion-diagram render examples/login-flow.json -- --out login.mp4
```

## Global install

```bash
npm install -g motion-diagram
motion-diagram render scene.json -- --out out.mp4
```

## Use as an MCP server

The MCP server exposes tools an AI agent calls to design and render diagrams:

- `get_scene_schema` — returns the authoring contract + agent skill
- `render_motion_diagram` — render a scene to MP4
- `render_carousel` — render a scene to silent GIF + WebP slides

Start it directly:

```bash
npx motion-diagram-mcp
```

### Auto-install the skill into your agent

On install, Motion Diagram registers its MCP server + skill with common agents.
You can also run it manually:

```bash
npx motion-diagram install-skill            # auto-detect installed agents
npx motion-diagram install-skill --client cursor
npx motion-diagram install-skill --client claude
npx motion-diagram install-skill --client pi
```

This writes the MCP server entry to each agent's config:

| Agent  | Config file |
|--------|-------------|
| Cursor | `~/.cursor/mcp.json` |
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS), `%APPDATA%/Claude/claude_desktop_config.json` (Windows), `~/.config/Claude/claude_desktop_config.json` (Linux) |
| Pi | `~/.pi/agent/mcp.json` |

The entry looks like:

```jsonc
{
  "mcpServers": {
    "motion-diagram": {
      "command": "npx",
      "args": ["-y", "motion-diagram-mcp"]
    }
  }
}
```

Restart the agent after installing so it picks up the new server.

### Manual config

If you prefer, add the block above to your agent's MCP config yourself. Any
MCP-compatible client (Cursor, Claude Desktop, Pi, Continue, etc.) works — point
it at the `motion-diagram-mcp` command.

## Verify

```bash
npx motion-diagram render examples/k8s-infra.json -- --out k8s.mp4
ffprobe k8s.mp4     # expect video + audio streams
```
