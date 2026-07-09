#!/usr/bin/env node
// MCP server exposing motion-diagram rendering to AI agents.
// Tools:
//   render_motion_diagram  -> scene JSON in, MP4 path out
//   render_carousel        -> scene JSON in, GIF/WebP slide paths out
//   get_scene_schema       -> returns the JSON schema doc for authoring scenes
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { renderVideo } from "../render/renderVideo.js";
import { renderCarousel } from "../render/renderCarousel.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const OUT_DIR = process.env.MOTION_OUT_DIR || path.join(ROOT, "output");

const SCHEMA_DOC = path.join(ROOT, "docs", "SCHEMA.md");

const sceneSchema = {
  type: "object",
  required: ["nodes", "edges", "timeline"],
  properties: {
    meta: {
      type: "object",
      properties: {
        title: { type: "string" },
        fps: { type: "number", default: 30 },
        width: { type: "number", default: 1920 },
        height: { type: "number", default: 1080 },
      },
    },
    nodes: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "label"],
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          shape: { type: "string", enum: ["rect", "diamond", "stadium"] },
          icon: { type: "string" },
          group: { type: "string" },
        },
      },
    },
    edges: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "from", "to"],
        properties: {
          id: { type: "string" },
          from: { type: "string" },
          to: { type: "string" },
          label: { type: "string" },
        },
      },
    },
    timeline: {
      type: "array",
      items: {
        type: "object",
        properties: {
          at: { type: "number" },
          atSec: { type: "number" },
          type: { type: "string", enum: ["pulse", "reveal-node", "reveal-edge", "flash", "camera"] },
          target: { type: "string" },
          edge: { type: "string" },
          color: { type: "string" },
          speed: { type: "number" },
          trail: { type: "boolean" },
          focus: { type: "string" },
          zoom: { type: "number" },
          sfx: { type: "string", enum: ["beep", "whoosh", "ding", "none"] },
          onArrive: {
            type: "object",
            properties: { flash: { type: "boolean" }, sfx: { type: "string" } },
          },
        },
      },
    },
  },
};

const server = new Server(
  { name: "motion-diagram", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_scene_schema",
      description:
        "Return the Motion Diagram scene JSON schema and authoring guide. Call this FIRST to learn how to build a scene (nodes, edges, timeline of pulses/reveals/camera, icons, sfx).",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "render_motion_diagram",
      description:
        "Render an animated API/flow diagram video (MP4, 1080p, h264+aac). Provide a scene: nodes (with icon+shape), edges, and a timeline choreographing reveal-node/reveal-edge/pulse/flash/camera events with colors and sfx (beep/whoosh/ding). Pulses are glowing comets that travel edges to simulate data flow. Returns the output file path.",
      inputSchema: {
        type: "object",
        required: ["scene"],
        properties: {
          scene: sceneSchema,
          filename: { type: "string", description: "Output filename (e.g. login-flow.mp4). Optional." },
        },
      },
    },
    {
      name: "render_carousel",
      description:
        "Render a scene as an Instagram-style carousel: one animated slide per node 'group' (silent GIF + WebP each). Use node.group to define slides. Returns list of generated file paths.",
      inputSchema: {
        type: "object",
        required: ["scene"],
        properties: {
          scene: sceneSchema,
          name: { type: "string", description: "Output subfolder name. Optional." },
        },
      },
    },
  ],
}));

function ok(text) {
  return { content: [{ type: "text", text }] };
}
function fail(text) {
  return { content: [{ type: "text", text }], isError: true };
}

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name === "get_scene_schema") {
      const doc = fs.existsSync(SCHEMA_DOC) ? fs.readFileSync(SCHEMA_DOC, "utf8") : "schema doc missing";
      return ok(doc);
    }

    if (name === "render_motion_diagram") {
      const scene = args.scene;
      if (!scene || !scene.nodes) return fail("Missing scene.nodes");
      fs.mkdirSync(OUT_DIR, { recursive: true });
      const file = args.filename || `${(scene.meta?.title || "diagram").replace(/\W+/g, "-").toLowerCase()}.mp4`;
      const outPath = path.join(OUT_DIR, file.endsWith(".mp4") ? file : file + ".mp4");
      await renderVideo(scene, outPath);
      return ok(`Rendered MP4: ${outPath}`);
    }

    if (name === "render_carousel") {
      const scene = args.scene;
      if (!scene || !scene.nodes) return fail("Missing scene.nodes");
      const sub = args.name || (scene.meta?.title || "carousel").replace(/\W+/g, "-").toLowerCase();
      const outDir = path.join(OUT_DIR, sub);
      const results = await renderCarousel(scene, outDir);
      const lines = results.map((r) => `- ${r.gif}${r.webp ? " + " + r.webp : ""}`).join("\n");
      return ok(`Rendered ${results.length} slide(s) in ${outDir}:\n${lines}`);
    }

    return fail(`Unknown tool: ${name}`);
  } catch (e) {
    return fail(`Error: ${e.message}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("motion-diagram MCP server running on stdio\n");
}

main().catch((e) => {
  process.stderr.write(`Fatal: ${e.stack}\n`);
  process.exit(1);
});
