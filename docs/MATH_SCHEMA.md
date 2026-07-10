# Math Visualizer Scene Schema

`render_math_visualizer` accepts one math scene and renders an MP4.

## Formula

```json
{
  "mode": "formula",
  "meta": { "title": "Euler Identity", "width": 1920, "height": 1080, "fps": 30 },
  "durationInFrames": 180,
  "formula": {
    "latex": "e^(iπ) + 1 = 0",
    "steps": [{ "at": 60, "latex": "cos(π) + i sin(π) + 1 = 0", "sfx": "ding" }]
  }
}
```

## Function

```json
{
  "mode": "function",
  "function": { "expression": "sin(x)", "domain": [-6.28, 6.28], "samples": 240 }
}
```

Allowed expressions: numbers, `x`, parentheses, `+ - * / ^`, `sin`, `cos`, `tan`, `abs`.

## Pendulum simulation

```json
{
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

Only `pendulum` exists in v1. Parameters are bounded for deterministic rendering.
