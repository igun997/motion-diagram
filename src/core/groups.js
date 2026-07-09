// Compute bounding boxes for node groups (process containers / boxes).
// A group is any set of nodes sharing node.group. Optional group metadata can
// come from scene.groups: [{ id, label, color }].

const PAD = 34;

export function computeGroups(layoutNodes, groupMeta = []) {
  const metaById = new Map((groupMeta || []).map((g) => [g.id, g]));
  const byGroup = new Map();

  for (const n of layoutNodes) {
    if (!n.group) continue;
    if (!byGroup.has(n.group)) byGroup.set(n.group, []);
    byGroup.get(n.group).push(n);
  }

  const boxes = [];
  for (const [id, nodes] of byGroup) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of nodes) {
      minX = Math.min(minX, n.x - n.width / 2);
      minY = Math.min(minY, n.y - n.height / 2);
      maxX = Math.max(maxX, n.x + n.width / 2);
      maxY = Math.max(maxY, n.y + n.height / 2);
    }
    const meta = metaById.get(id) || {};
    boxes.push({
      id,
      label: meta.label || id,
      color: meta.color || "#475569",
      x: minX - PAD,
      y: minY - PAD - 22, // extra top room for label
      width: maxX - minX + PAD * 2,
      height: maxY - minY + PAD * 2 + 22,
    });
  }
  return boxes;
}
