import test from "node:test";
import assert from "node:assert/strict";

import { mathDuration } from "../src/render/renderMath.js";

test("mathDuration uses normalized duration", () => {
  assert.equal(mathDuration({ durationInFrames: 180 }), 180);
  assert.equal(mathDuration({}), 120);
});
