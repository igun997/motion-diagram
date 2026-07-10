import test from "node:test";
import assert from "node:assert/strict";

import { normalizeMathScene } from "../src/math/normalize.js";
import { evaluateExpression } from "../src/math/expression.js";
import { pendulumState } from "../src/math/pendulum.js";

test("normalizeMathScene supplies finite defaults", () => {
  const scene = normalizeMathScene({ mode: "formula", formula: { latex: "x" } });

  assert.equal(scene.meta.fps, 30);
  assert.equal(scene.meta.width, 1920);
  assert.equal(scene.meta.height, 1080);
  assert.equal(scene.durationInFrames, 120);
});

test("normalizeMathScene rejects unsupported modes", () => {
  assert.throws(() => normalizeMathScene({ mode: "arbitrary" }), /Unsupported math mode/);
});

test("normalizeMathScene replaces invalid rendering dimensions", () => {
  const scene = normalizeMathScene({
    mode: "formula",
    meta: { fps: 0, width: -1, height: Infinity },
    durationInFrames: 0,
  });

  assert.deepEqual(scene.meta, { fps: 30, width: 1920, height: 1080 });
  assert.equal(scene.durationInFrames, 120);
});

test("evaluateExpression supports arithmetic and sin", () => {
  assert.equal(evaluateExpression("2 + x * 3", 4), 14);
  assert.ok(Math.abs(evaluateExpression("sin(x)", Math.PI / 2) - 1) < 1e-10);
});

test("evaluateExpression supports unary signs", () => {
  assert.equal(evaluateExpression("2 * -x", 3), -6);
  assert.equal(evaluateExpression("sin(-x)", Math.PI / 2), -1);
});

test("evaluateExpression rejects unsafe tokens", () => {
  assert.throws(() => evaluateExpression("process.exit()", 0), /Invalid expression/);
});

test("pendulumState produces finite values with invalid parameters", () => {
  const state = pendulumState({ length: 0, gravity: "bad", initialAngle: NaN }, 60, 30);

  assert.ok(Number.isFinite(state.angle));
  assert.ok(Number.isFinite(state.velocity));
  assert.ok(Number.isFinite(state.x));
  assert.ok(Number.isFinite(state.y));
});

test("pendulumState bounds excessive frame counts", () => {
  const state = pendulumState({}, 1_000_000_000, 30);

  assert.ok(Number.isFinite(state.angle));
  assert.ok(Number.isFinite(state.velocity));
});

test("pendulumState remains finite for extreme finite physical parameters", () => {
  const state = pendulumState({ gravity: Number.MAX_VALUE, length: Number.MIN_VALUE }, 1, 30);

  assert.ok(Number.isFinite(state.angle));
  assert.ok(Number.isFinite(state.velocity));
  assert.ok(Number.isFinite(state.x));
  assert.ok(Number.isFinite(state.y));
});
