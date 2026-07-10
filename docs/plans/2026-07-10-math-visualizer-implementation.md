# Math Visualizer Implementation Plan

> **REQUIRED SUB-SKILL:** Use executing-plans skill to implement this plan task-by-task.

**Goal:** Add `render_math_visualizer` MCP rendering for formula, function, and pendulum simulation MP4s with bundled sound cues.

**Architecture:** Reuse existing Remotion bundle/render pipeline with separate `MathVisualizer` composition selected by a math scene wrapper. Core modules normalize untrusted input, safely compile small mathematical expressions, and compute deterministic pendulum state from frame. MCP exposes separate schema and tool. New bundled agent skill documents mode selection and authoring.

**Tech Stack:** Node.js ESM, Remotion/React/SVG, existing ffmpeg SFX, Node built-in test runner, MCP SDK.

---

### Task 1: Math core normalization and deterministic math helpers

**Files:**

- Create: `src/math/normalize.js`
- Create: `src/math/expression.js`
- Create: `src/math/pendulum.js`
- Create: `test/math-core.test.js`

**Step 1: Write failing tests**

Cover default metadata/mode duration, valid arithmetic and `sin(x)`, rejected tokens, and finite pendulum state with zero/invalid parameters.

**Step 2: Run test to verify failure**

Run: `node --test test/math-core.test.js`
Expected: FAIL because modules do not exist.

**Step 3: Write minimal implementation**

Normalize only `formula`, `function`, `simulation`. Expression tokenizer/parser permits numbers, `x`, `+ - * / ^`, parentheses, and `sin`, `cos`, `tan`, `abs`. Pendulum uses fixed timestep Euler integration and finite defaults.

**Step 4: Run test to verify pass**

Run: `node --test test/math-core.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/math test/math-core.test.js
git commit -m "feat: add math visualization core"
```

### Task 2: Math Remotion composition and renderer

**Files:**

- Create: `src/scenes/MathVisualizer.jsx`
- Modify: `src/scenes/Root.jsx`
- Create: `src/render/renderMath.js`
- Create: `test/math-render.test.js`

**Step 1: Write failing tests**

Test selected composition input has finite duration and renderer accepts normalized scenes.

**Step 2: Run test to verify failure**

Run: `node --test test/math-render.test.js`
Expected: FAIL because math renderer is missing.

**Step 3: Write minimal implementation**

Formula: centered SVG text and timed steps. Function: SVG axes/path/sample marker. Pendulum: pivot, rod, bob, trail, velocity vector, overlay. Reuse `beep`, `whoosh`, `ding` via bounded, throttled events. Root registers `MathVisualizer` composition without changing `MotionDiagram` behavior. Renderer bundles same entry and selects math composition.

**Step 4: Run test to verify pass**

Run: `node --test test/math-render.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/scenes src/render/renderMath.js test/math-render.test.js
git commit -m "feat: render math visualizations"
```

### Task 3: MCP tool, authoring skill, docs, and example

**Files:**

- Modify: `src/mcp/server.js`
- Create: `skills/math-visualizer/SKILL.md`
- Create: `docs/MATH_SCHEMA.md`
- Create: `examples/pendulum-math.json`
- Modify: `README.md`
- Modify: `docs/AGENT_SKILL.md`
- Modify: `test/math-core.test.js`

**Step 1: Write failing MCP schema assertion**

Assert tool list defines `render_math_visualizer` and its three modes/required input.

**Step 2: Run test to verify failure**

Run: `node --test test/math-core.test.js`
Expected: FAIL until tool/schema exists.

**Step 3: Write minimal implementation**

Add MCP tool with validated input, output directory semantics matching existing video tool, and `renderMath`. Create agent skill with call-first schema workflow, mode-specific authoring guidance, safety limits, sound mapping, and pendulum example. Document contract and runnable example.

**Step 4: Run verification**

Run: `node --test test/*.test.js && npm run lint && npm run format:check`
Expected: tests pass; lint may retain documented existing warnings; format passes.

**Step 5: Commit**

```bash
git add src/mcp/server.js skills/math-visualizer docs examples README.md test
git commit -m "feat: expose math visualizer MCP tool"
```
