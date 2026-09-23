import { motion } from "framer-motion";
import type { BullyStep, NodeRole } from "./consensus";

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = 110;
const NODE_IDS = [0, 1, 2, 3, 4, 5];

function pointFor(id: number) {
  const rad = ((-90 + id * 60) * Math.PI) / 180;
  return { x: CENTER + RADIUS * Math.cos(rad), y: CENTER + RADIUS * Math.sin(rad) };
}

const ROLE_FILL: Record<NodeRole, string> = {
  alive: "rgb(30 41 59)",
  dead: "rgb(76 5 25)",
  leader: "rgb(6 78 59)",
};
const ROLE_STROKE: Record<NodeRole, string> = {
  alive: "rgb(100 116 139)",
  dead: "rgb(244 63 94)",
  leader: "rgb(52 211 153)",
};

export function BullyDiagram({ step, eventKey }: { step: BullyStep; eventKey: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto h-auto w-full max-w-xs" role="img" aria-label="Bully algorithm — выбор лидера">
        {step.legs.map((leg, i) => {
          const a = pointFor(leg.from);
          const b = pointFor(leg.to);
          return (
            <motion.circle
              key={`${eventKey}-leg-${i}`}
              r={6}
              fill="rgb(99 102 241)"
              initial={{ cx: a.x, cy: a.y, opacity: 0 }}
              animate={{ cx: [a.x, b.x], cy: [a.y, b.y], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1, delay: leg.delayUnits, ease: "easeInOut" }}
            />
          );
        })}

        {NODE_IDS.map((id) => {
          const pos = pointFor(id);
          const role = step.nodeRoles[id];
          return (
            <g key={id}>
              <motion.circle
                key={`${eventKey}-${id}-${role}`}
                cx={pos.x}
                cy={pos.y}
                r={22}
                fill={ROLE_FILL[role]}
                stroke={ROLE_STROKE[role]}
                strokeWidth={2.5}
                animate={{ scale: [1, 1.1, 1] }}
                style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                transition={{ duration: 0.35 }}
              />
              <text x={pos.x} y={pos.y + 5} textAnchor="middle" fill="white" fontSize={14} fontWeight={700}>
                {id}
              </text>
              {role === "leader" && (
                <text x={pos.x} y={pos.y - 32} textAnchor="middle" fill="rgb(52 211 153)" fontSize={11} fontWeight={600}>
                  LEADER
                </text>
              )}
              {role === "dead" && (
                <text x={pos.x} y={pos.y - 32} textAnchor="middle" fill="rgb(244 63 94)" fontSize={16} fontWeight={700}>
                  ✕
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
