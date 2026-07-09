// Auto-layout nodes using dagre. Returns spec with x/y/width/height per node
// and edge point paths, plus overall diagram bounds.
import dagre from "dagre";

const NODE_W = 160;
const NODE_H = 64;
const CHAR_W = 11;   // approx px per label char at fontSize 20
const PAD_X = 44;    // horizontal padding inside node
const ICON_W = 30;   // room reserved when node has an icon

function nodeWidth(n) {
  const labelLen = (n.label || "").length;
  const hasIcon = !!(n.icon || n.iconText || n.iconPath);
  let w = labelLen * CHAR_W + PAD_X + (hasIcon ? ICON_W : 0);
  if (n.shape === "diamond") w += 24;
  return Math.max(NODE_W, w);
}

export function layoutDiagram(spec, opts = {}) {
  const { rankdir = "TB", nodesep = 130, ranksep = 150 } = opts;

  const g = new dagre.graphlib.Graph({ compound: true });
  g.setGraph({ rankdir, nodesep, ranksep, marginx: 40, marginy: 40, clusterrank: "local" });
  g.setDefaultEdgeLabel(() => ({}));

  // Register cluster nodes for each group so dagre reserves separate space.
  const usedGroups = new Set();
  for (const n of spec.nodes) {
    if (n.group) usedGroups.add(n.group);
  }
  for (const gid of usedGroups) {
    g.setNode(`cluster:${gid}`, {});
  }

  for (const n of spec.nodes) {
    const w = nodeWidth(n);
    g.setNode(n.id, { width: w, height: NODE_H });
    if (n.group) g.setParent(n.id, `cluster:${n.group}`);
  }
  for (const e of spec.edges) {
    g.setEdge(e.from, e.to);
  }

  dagre.layout(g);

  const nodes = spec.nodes.map((n) => {
    const gn = g.node(n.id);
    return {
      ...n,
      x: gn.x,
      y: gn.y,
      width: gn.width,
      height: gn.height,
    };
  });

  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  const edges = spec.edges.map((e) => {
    const ge = g.edge(e.from, e.to);
    const points = (ge && ge.points) || [
      { x: nodeById.get(e.from).x, y: nodeById.get(e.from).y },
      { x: nodeById.get(e.to).x, y: nodeById.get(e.to).y },
    ];
    return { ...e, points };
  });

  const graph = g.graph();
  const bounds = {
    width: graph.width || 800,
    height: graph.height || 600,
  };

  return { nodes, edges, bounds };
}
