# Math Visualizer v1 Design

## Goal

Add a separate MCP tool, `render_math_visualizer`, for rendered MP4 math explainers with sound. It must not reuse flow-diagram node/edge schema. Scene input supports three modes: `formula`, `function`, and `simulation`.

## Input contract

```json
{
  "meta": { "title": "Simple Pendulum", "fps": 30, "width": 1920, "height": 1080 },
  "mode": "formula | function | simulation",
  "formula": { "latex": "T = 2\\pi\\sqrt{L/g}", "steps": [] },
  "function": { "expression": "sin(x)", "domain": [-6.28, 6.28], "samples": 240 },
  "simulation": {
    "preset": "pendulum",
    "length": 2,
    "gravity": 9.81,
    "initialAngle": 0.7,
    "initialVelocity": 0
  },
  "audio": { "enabled": true, "mapping": "angle | velocity | none" }
}
```

Only fields for selected mode are required. MCP validates untrusted input before render. Default dimensions and FPS match existing renderer.

## Rendering

Formula mode renders text through SVG/HTML and animates ordered formula steps. Basic TeX escaping supported; no LaTeX rendering dependency. Function mode uses a small safe expression parser/evaluator rather than `eval`, samples fixed domain, draws axes and trace, and animates sample point. Simulation mode has one fixed-step pendulum integrator. It draws pivot, rod, bob, arc trail, velocity vector, parameter readout, and formula overlay.

Audio reuses bundled `beep`, `whoosh`, and `ding`. Formula steps trigger explicit cues. Function/simulation mappings convert bounded values to throttled cues; no audio synthesis or dependency.

## Architecture and tests

Add math core modules for input normalization, safe expression evaluation, and pendulum state. Add Remotion math composition, render orchestration, MCP schema/handler, docs, and examples. Tests cover invalid mode/parameters, expression parsing/evaluation, pendulum finite output, and normalization defaults. Keep all simulation state deterministic from frame and fixed timestep.

## Out of scope

No arbitrary JavaScript callbacks, symbolic algebra, full LaTeX layout, user-loaded audio, sliders, or additional simulation presets. Add presets only after pendulum API and scene contract stabilize.
