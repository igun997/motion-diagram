// Theme presets. Agent picks via scene.meta.theme ("dark" | "light" | "midnight"
// | "blueprint" | "mono") or supplies scene.meta.themeOverrides to tweak any key.

export const THEMES = {
  dark: {
    background: "radial-gradient(circle at 50% 30%, #0b1220, #060912)",
    nodeText: "#f1f5f9",
    edge: "#64748b",
    edgeLabelBg: "#0f172a",
    edgeLabelStroke: "#334155",
    edgeLabelText: "#cbd5e1",
    flash: "#fbbf24",
    shapes: {
      rect: { fill: "#1e293b", stroke: "#38bdf8" },
      diamond: { fill: "#3b1e4a", stroke: "#e879f9" },
      stadium: { fill: "#0f3b2e", stroke: "#34d399" },
    },
  },
  light: {
    background: "radial-gradient(circle at 50% 20%, #ffffff, #eef2f7)",
    nodeText: "#0f172a",
    edge: "#94a3b8",
    edgeLabelBg: "#ffffff",
    edgeLabelStroke: "#cbd5e1",
    edgeLabelText: "#334155",
    flash: "#f59e0b",
    shapes: {
      rect: { fill: "#e0f2fe", stroke: "#0284c7" },
      diamond: { fill: "#fae8ff", stroke: "#c026d3" },
      stadium: { fill: "#dcfce7", stroke: "#16a34a" },
    },
  },
  midnight: {
    background: "linear-gradient(160deg, #020617, #0b1220 60%, #111827)",
    nodeText: "#e2e8f0",
    edge: "#475569",
    edgeLabelBg: "#020617",
    edgeLabelStroke: "#1e293b",
    edgeLabelText: "#94a3b8",
    flash: "#22d3ee",
    shapes: {
      rect: { fill: "#0f172a", stroke: "#818cf8" },
      diamond: { fill: "#1e1b4b", stroke: "#a78bfa" },
      stadium: { fill: "#082f49", stroke: "#38bdf8" },
    },
  },
  blueprint: {
    background: "linear-gradient(0deg, #0a2540, #0a2540)",
    nodeText: "#e0f2fe",
    edge: "#7dd3fc",
    edgeLabelBg: "#0a2540",
    edgeLabelStroke: "#1e6091",
    edgeLabelText: "#bae6fd",
    flash: "#fef08a",
    shapes: {
      rect: { fill: "#0e3a5f", stroke: "#7dd3fc" },
      diamond: { fill: "#0e3a5f", stroke: "#7dd3fc" },
      stadium: { fill: "#0e3a5f", stroke: "#7dd3fc" },
    },
  },
  mono: {
    background: "linear-gradient(180deg, #111111, #1a1a1a)",
    nodeText: "#fafafa",
    edge: "#737373",
    edgeLabelBg: "#111111",
    edgeLabelStroke: "#404040",
    edgeLabelText: "#d4d4d4",
    flash: "#ffffff",
    shapes: {
      rect: { fill: "#262626", stroke: "#a3a3a3" },
      diamond: { fill: "#262626", stroke: "#a3a3a3" },
      stadium: { fill: "#262626", stroke: "#a3a3a3" },
    },
  },
};

export function resolveTheme(meta = {}) {
  const base = THEMES[meta.theme] || THEMES.dark;
  if (!meta.themeOverrides) return base;
  const o = meta.themeOverrides;
  return {
    ...base,
    ...o,
    shapes: { ...base.shapes, ...(o.shapes || {}) },
  };
}
