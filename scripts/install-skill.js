#!/usr/bin/env node
// Registers the motion-diagram MCP server with common AI agents.
// Usage:
//   node scripts/install-skill.js                 # interactive-ish auto-detect
//   node scripts/install-skill.js --auto           # only write for detected agents (postinstall)
//   node scripts/install-skill.js --client cursor  # force a specific client
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join } from "node:path";

const SERVER_NAME = "motion-diagram";
const SERVER_ENTRY = {
  command: "npx",
  args: ["-y", "motion-diagram-mcp"],
};

function log(msg) {
  console.log(`[motion-diagram] ${msg}`);
}

// Resolve config file path per client + OS.
function configPathFor(client) {
  const home = homedir();
  const os = platform();
  switch (client) {
    case "cursor":
      return join(home, ".cursor", "mcp.json");
    case "pi":
      return join(home, ".pi", "agent", "mcp.json");
    case "claude":
      if (os === "darwin")
        return join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json");
      if (os === "win32")
        return join(
          process.env.APPDATA || join(home, "AppData", "Roaming"),
          "Claude",
          "claude_desktop_config.json"
        );
      return join(home, ".config", "Claude", "claude_desktop_config.json");
    default:
      return null;
  }
}

// A client is "detected" if its parent config dir already exists.
function isDetected(client) {
  const p = configPathFor(client);
  if (!p) return false;
  return existsSync(dirname(p));
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return {};
  }
}

function upsertServer(path) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const cfg = existsSync(path) ? readJson(path) : {};
  if (!cfg.mcpServers || typeof cfg.mcpServers !== "object") cfg.mcpServers = {};

  const existing = cfg.mcpServers[SERVER_NAME];
  if (existing && JSON.stringify(existing) === JSON.stringify(SERVER_ENTRY)) {
    return "unchanged";
  }
  cfg.mcpServers[SERVER_NAME] = SERVER_ENTRY;
  writeFileSync(path, JSON.stringify(cfg, null, 2) + "\n");
  return existing ? "updated" : "added";
}

function install(client) {
  const path = configPathFor(client);
  if (!path) {
    log(`unknown client: ${client}`);
    return false;
  }
  try {
    const result = upsertServer(path);
    log(`${client}: ${result} (${path})`);
    return true;
  } catch (err) {
    log(`${client}: failed — ${err.message}`);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const auto = args.includes("--auto");
  const clientIdx = args.indexOf("--client");
  const forced = clientIdx >= 0 ? args[clientIdx + 1] : null;

  const ALL = ["cursor", "claude", "pi"];

  if (forced) {
    install(forced);
    return;
  }

  const targets = auto ? ALL.filter(isDetected) : ALL;

  if (!targets.length) {
    if (auto) {
      // postinstall in CI or a machine with no agents — stay quiet, succeed.
      log("no known AI agents detected; skipping skill registration.");
      return;
    }
    log("no known AI agents detected. Use --client <cursor|claude|pi> to force.");
    return;
  }

  log(`registering MCP server for: ${targets.join(", ")}`);
  for (const c of targets) install(c);
  log("done. Restart your agent to load the motion-diagram tools.");
}

main();
