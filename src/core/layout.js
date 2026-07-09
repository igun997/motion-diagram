// Auto-layout nodes using dagre. Returns spec with x/y/width/height per node
// and edge point paths, plus overall diagram bounds.
import dagre from "dagre";

const NODE_W = 160;
const NODE_H = 64;

export function layoutDiagram(spec, opts = {}) {
  const { rankdir = "TB", nodesep = 60, ranksep = 90 } = opts;

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir, nodesep, ranksep, marginx: 40, marginy: 40 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const n of spec.nodes) {
    const w = n.shape === "diamond" ? NODE_W + 20 : NODE_W;
    g.setNode(n.id, { width: w, height: NODE_H });
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
