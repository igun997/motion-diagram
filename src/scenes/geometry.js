// Geometry helpers for edge paths and node anchoring.

// Build an SVG polyline path string from dagre points.
export function pointsToPath(points) {
  if (!points || points.length === 0) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
}

// Total polyline length (for stroke-dash draw animation).
export function pathLength(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    len += Math.hypot(dx, dy);
  }
  return len;
}

// Point at fraction t (0..1) along polyline — used for particle flow.
export function pointAt(points, t) {
  if (points.length === 1) return points[0];
  const total = pathLength(points);
  const target = total * Math.max(0, Math.min(1, t));
  let acc = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const seg = Math.hypot(dx, dy);
    if (acc + seg >= target) {
      const f = seg === 0 ? 0 : (target - acc) / seg;
      return {
        x: points[i - 1].x + dx * f,
        y: points[i - 1].y + dy * f,
      };
    }
    acc += seg;
  }
  return points[points.length - 1];
}

// Angle (deg) of final segment — arrowhead orientation.
export function endAngle(points) {
  if (points.length < 2) return 0;
  const a = points[points.length - 2];
  const b = points[points.length - 1];
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}
