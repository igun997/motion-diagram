import test from "node:test";
import assert from "node:assert/strict";

import { parseDiagram } from "../src/core/parser.js";
import { normalizeTimeline, timelineDuration } from "../src/core/timeline.js";
import { buildSlides } from "../src/render/renderCarousel.js";

test("parseDiagram assigns stable IDs to edges used by carousel timelines", () => {
  const parsed = parseDiagram("A[Source] --> B[Target]");
  parsed.nodes[0].group = "left";
  parsed.nodes[1].group = "left";
  parsed.nodes.push({ id: "C", label: "Other", shape: "rect", group: "right" });
  parsed.timeline = [{ type: "reveal-edge", target: parsed.edges[0].id }];
  parsed.meta = {};

  const [slide] = buildSlides(parsed);

  assert.equal(parsed.edges[0].id, "edge-0");
  assert.deepEqual(slide.scene.timeline, parsed.timeline);
});

test("normalizeTimeline defaults invalid atSec to frame zero", () => {
  const events = normalizeTimeline([{ type: "flash", atSec: "not-a-number" }], 30);

  assert.equal(events[0].at, 0);
});

test("timelineDuration remains finite with invalid durationSec", () => {
  const events = normalizeTimeline([{ type: "flash", durationSec: "not-a-number" }], 30);

  assert.equal(timelineDuration(events), 48);
});
