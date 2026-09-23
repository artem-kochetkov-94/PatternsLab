import { motion } from "framer-motion";
import { TRIE_NODES, getNode } from "./trie";

const W = 540;
const H = 290;

export function TrieDiagram({ highlighted }: { highlighted: Set<string> }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Сжатое префиксное дерево">
        {TRIE_NODES.filter((n) => n.parentId).map((n) => {
          const parent = getNode(n.parentId!);
          const active = highlighted.has(n.id) && highlighted.has(parent.id);
          return (
            <line
              key={`edge-${n.id}`}
              x1={parent.pos.x}
              y1={parent.pos.y}
              x2={n.pos.x}
              y2={n.pos.y}
              stroke={active ? "rgb(129 140 248)" : "rgb(51 65 85)"}
              strokeWidth={active ? 2.5 : 2}
            />
          );
        })}

        {TRIE_NODES.map((n) => {
          const active = highlighted.has(n.id);
          const isLeaf = !!n.leaf;
          const isRoot = n.id === "root";
          const r = isRoot ? 6 : 20;
          return (
            <g key={n.id}>
              <motion.circle
                cx={n.pos.x}
                cy={n.pos.y}
                r={r}
                fill={isRoot ? "rgb(71 85 105)" : active ? "rgb(49 46 129)" : isLeaf ? "rgb(30 41 59)" : "rgb(30 41 59)"}
                stroke={active ? "rgb(129 140 248)" : isLeaf ? "rgb(100 116 139)" : "rgb(71 85 105)"}
                strokeWidth={active ? 2.5 : 1.5}
                strokeDasharray={isLeaf && !active ? "3 3" : undefined}
                animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                style={{ transformOrigin: `${n.pos.x}px ${n.pos.y}px` }}
                transition={{ duration: 0.35 }}
              />
              {!isRoot && (
                <text
                  x={n.pos.x}
                  y={n.pos.y - r - 8}
                  textAnchor="middle"
                  fill={active ? "white" : "rgb(148 163 184)"}
                  fontSize={13}
                  fontWeight={600}
                >
                  {n.label}
                </text>
              )}
              {n.leaf && (
                <text
                  x={n.pos.x}
                  y={n.pos.y + r + 16}
                  textAnchor="middle"
                  fill={active ? "rgb(199 210 254)" : "rgb(100 116 139)"}
                  fontSize={11}
                  fontFamily="monospace"
                >
                  ×{n.leaf.count}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
