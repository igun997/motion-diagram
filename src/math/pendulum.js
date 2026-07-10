const MAX_STEPS = 10_800;
const MIN_LENGTH = 0.01;
const MAX_LENGTH = 100;
const MAX_GRAVITY = 100;

function finitePositive(value, fallback, min = 0, max = Infinity) {
  return Number.isFinite(value) && value >= min && value <= max ? value : fallback;
}

function finite(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

export function pendulumState(params = {}, frame = 0, fps = 30) {
  const length = finitePositive(params.length, 1, MIN_LENGTH, MAX_LENGTH);
  const gravity = finitePositive(params.gravity, 9.81, 0, MAX_GRAVITY);
  const dt = 1 / finitePositive(fps, 30);
  let angle = finite(params.initialAngle, 0.7);
  let velocity = finite(params.initialVelocity, 0);
  const steps = Math.min(MAX_STEPS, Math.max(0, Math.floor(finite(frame, 0))));

  for (let i = 0; i < steps; i++) {
    velocity += -(gravity / length) * Math.sin(angle) * dt;
    angle += velocity * dt;
  }

  return { angle, velocity, x: length * Math.sin(angle), y: length * Math.cos(angle) };
}
