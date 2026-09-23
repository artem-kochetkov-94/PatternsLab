import { motion } from "framer-motion";
import type { TxLeg, TxNode, TxStep } from "./transactions";

const W = 640;
const H = 260;
const BOX_W = 120;
const BOX_H = 52;

/** Сколько секунд длится импульс на ОДНОМ перегоне — используется и Demo.tsx. */
export const PACKET_LEG_DURATION = 1;

const LEG_COLOR: Record<TxLeg["kind"], string> = {
  write: "rgb(99 102 241)",
  request: "rgb(99 102 241)",
  response: "rgb(56 189 248)",
  read: "rgb(99 102 241)",
  error: "rgb(244 63 94)",
};

function LegPulses({
  legs,
  pos,
  eventKey,
}: {
  legs: TxLeg[];
  pos: Record<string, { x: number; y: number }>;
  eventKey: string;
}) {
  const half = PACKET_LEG_DURATION / 2;
  return (
    <>
      {legs.map((leg, i) => {
        const a = pos[leg.from];
        const b = pos[leg.to];
        const legStart = leg.delayUnits * PACKET_LEG_DURATION;

        if (leg.kind === "read") {
          return (
            <g key={`${eventKey}-leg-${i}`}>
              <motion.circle
                r={7}
                fill="rgb(99 102 241)"
                initial={{ cx: a.x, cy: a.y, opacity: 0 }}
                animate={{ cx: [a.x, b.x], cy: [a.y, b.y], opacity: [0, 1, 1, 0] }}
                transition={{ duration: half, delay: legStart, ease: "easeInOut" }}
              />
              <motion.circle
                r={6}
                fill="rgb(56 189 248)"
                initial={{ cx: b.x, cy: b.y, opacity: 0 }}
                animate={{ cx: [b.x, a.x], cy: [b.y, a.y], opacity: [0, 1, 1, 0] }}
                transition={{ duration: half, delay: legStart + half, ease: "easeInOut" }}
              />
            </g>
          );
        }

        return (
          <motion.circle
            key={`${eventKey}-leg-${i}`}
            r={7}
            fill={LEG_COLOR[leg.kind]}
            initial={{ cx: a.x, cy: a.y, opacity: 0 }}
            animate={{ cx: [a.x, b.x], cy: [a.y, b.y], opacity: [0, 1, 1, 0] }}
            transition={{ duration: PACKET_LEG_DURATION, delay: legStart, ease: "easeInOut" }}
          />
        );
      })}
    </>
  );
}

export function TxDiagram({
  nodes,
  pos,
  edges,
  step,
  eventKey,
}: {
  nodes: TxNode[];
  pos: Record<string, { x: number; y: number }>;
  edges: [string, string][];
  step: TxStep;
  eventKey: string;
}) {
  const touched = new Set(step.legs.flatMap((leg) => [leg.from, leg.to]));

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Схема транзакции">
        {edges.map(([from, to]) => (
          <line
            key={`edge-${from}-${to}`}
            x1={pos[from].x}
            y1={pos[from].y}
            x2={pos[to].x}
            y2={pos[to].y}
            stroke="rgb(51 65 85)"
            strokeWidth={2}
          />
        ))}

        <LegPulses legs={step.legs} pos={pos} eventKey={eventKey} />

        {nodes.map((node) => {
          const rect = { x: pos[node.id].x - BOX_W / 2, y: pos[node.id].y - BOX_H / 2 };
          const isTouched = touched.has(node.id);
          return (
            <g key={node.id}>
              <motion.rect
                key={`${eventKey}-${node.id}`}
                x={rect.x}
                y={rect.y}
                width={BOX_W}
                height={BOX_H}
                rx={10}
                fill={isTouched ? "rgb(49 46 129)" : "rgb(30 41 59)"}
                stroke={isTouched ? "rgb(129 140 248)" : "rgb(71 85 105)"}
                strokeWidth={isTouched ? 2.5 : 1.5}
                animate={isTouched ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                style={{ transformOrigin: `${pos[node.id].x}px ${pos[node.id].y}px` }}
                transition={{ duration: 0.4 }}
              />
              <text
                x={pos[node.id].x}
                y={pos[node.id].y + 5}
                textAnchor="middle"
                fill="white"
                fontSize={13}
                fontWeight={600}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
