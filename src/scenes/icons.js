// Minimal inline SVG icon paths (24x24 viewBox), stroke-based.
// Rendered left of node label. Unknown key -> null.

export const ICONS = {
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0",
  client: "M4 5h16v10H4z M8 19h8 M12 15v4",
  server: "M4 5h16v5H4z M4 14h16v5H4z M8 7.5h.01 M8 16.5h.01",
  api: "M8 4l-4 8 4 8 M16 4l4 8-4 8 M13 4l-2 16",
  database: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6",
  cloud: "M6 17a4 4 0 010-8 5 5 0 019.6-1.5A3.5 3.5 0 0117 17z",
  queue: "M4 7h16 M4 12h16 M4 17h16",
  cache: "M4 6h16v12H4z M4 10h16 M9 6v4",
  lock: "M6 11h12v9H6z M8 11V8a4 4 0 018 0v3",
  key: "M14 7a3 3 0 100 6 3 3 0 000-6z M11.5 11.5L4 19v2h3l1-1h2v-2h2l1.5-1.5",
  gear: "M12 9a3 3 0 100 6 3 3 0 000-6z M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2",
  bolt: "M13 2L4 14h7l-2 8 9-12h-7z",
  globe: "M12 3a9 9 0 100 18 9 9 0 000-18z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18",
  mobile: "M7 3h10v18H7z M11 18h2",
  mail: "M3 6h18v12H3z M3 7l9 6 9-6",
  file: "M6 3h8l4 4v14H6z M14 3v4h4",
  check: "M5 13l4 4 10-11",
  cross: "M6 6l12 12 M18 6L6 18",
  warning: "M12 3l9 16H3z M12 10v4 M12 17h.01",
};

export function iconPath(key) {
  if (!key) return null;
  return ICONS[key] || null;
}
