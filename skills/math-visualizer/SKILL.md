# Math Visualizer

Use `render_math_visualizer` for animated formula explanations, safe function graphs, and pendulum simulations. Output is MP4 with optional bundled sound cues.

## Mode selection

- `formula`: formula plus timed derivation steps.
- `function`: graph one expression of `x`; animate sample point.
- `simulation`: fixed pendulum model only; show motion, velocity vector, and governing equation.

## Contract

```json
{
  "meta": { "title": "Simple Pendulum", "fps": 30, "width": 1920, "height": 1080 },
  "mode": "simulation",
  "durationInFrames": 300,
  "simulation": {
    "preset": "pendulum",
    "length": 2,
    "gravity": 9.81,
    "initialAngle": 0.7,
    "initialVelocity": 0
  },
  "audio": { "enabled": true, "mapping": "velocity" }
}
```

Formula steps use `{ "at": 30, "latex": "...", "sfx": "beep|whoosh|ding" }`. Function expressions allow only `x`, numbers, parentheses, `+ - * / ^`, `sin`, `cos`, `tan`, `abs`. No JavaScript, variables, constants, or full LaTeX renderer.

Keep `fps` 24-60, duration below 3600 frames, graph samples 20-480. Use one sound per formula beat. End a successful derivation with `ding`.
