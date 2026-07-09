// Parse mermaid-like flowchart text into a scene spec.
// Supported:
//   A[Label] --> B[Label]
//   A --> B
//   C{Decision} -->|edge label| D[Do]
//   shapes: [rect]  (round-rect)  {diamond}  ([stadium])

const NODE_RE = /^([A-Za-z0-9_]+)(\[[^\]]*\]|\{[^}]*\}|\([^)]*\))?$/;

function parseNodeToken(token) {
  const m = token.trim().match(NODE_RE);
  if (!m) return null;
  const id = m[1];
  let label = id;
  let shape = "rect";
  const body = m[2];
  if (body) {
    if (body.startsWith("[")) {
      shape = "rect";
      label = body.slice(1, -1);
    } else if (body.startsWith("{")) {
      shape = "diamond";
      label = body.slice(1, -1);
    } else if (body.startsWith("(")) {
      shape = "stadium";
      label = body.slice(1, -1);
    }
  }
  return { id, label, shape };
}

// Split "A -->|label| B" into { fromTok, edgeLabel, toTok }
function splitEdge(line) {
  const arrowIdx = line.indexOf("-->");
  if (arrowIdx === -1) return null;
  const left = line.slice(0, arrowIdx).trim();
  let right = line.slice(arrowIdx + 3).trim();
  let edgeLabel = "";
  const lm = right.match(/^\|([^|]*)\|\s*(.*)$/);
  if (lm) {
    edgeLabel = lm[1].trim();
    right = lm[2].trim();
  }
  return { fromTok: left, toTok: right, edgeLabel };
}

export function parseDiagram(text) {
  const nodes = new Map();
  const edges = [];

  const ensureNode = (token) => {
    const parsed = parseNodeToken(token);
    if (!parsed) return null;
    const existing = nodes.get(parsed.id);
    if (existing) {
      // upgrade label/shape if this token carried them
      if (parsed.label !== parsed.id) existing.label = parsed.label;
      if (parsed.shape !== "rect") existing.shape = parsed.shape;
      return existing;
    }
    nodes.set(parsed.id, parsed);
    return parsed;
  };

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("%%") && !/^flowchart/i.test(l) && !/^graph/i.test(l));

  for (const line of lines) {
    const edge = splitEdge(line);
    if (edge) {
      const from = ensureNode(edge.fromTok);
      const to = ensureNode(edge.toTok);
      if (from && to) {
        edges.push({ from: from.id, to: to.id, label: edge.edgeLabel });
      }
    } else {
      ensureNode(line);
    }
  }

  return {
    nodes: Array.from(nodes.values()),
    edges,
  };
}
