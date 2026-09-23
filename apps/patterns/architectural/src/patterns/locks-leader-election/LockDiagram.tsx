import { motion } from "framer-motion";
import type { LockLeg } from "./consensus";

const W = 420;
const H = 200;
const CLIENT_A = { x: 80, y: 60 };
const CLIENT_B = { x: 80, y: 160 };
const REDIS = { x: 330, y: 110 };
const BOX_W = 110;
const BOX_H = 46;

export function LockDiagram({ leg, eventKey }: { leg: LockLeg | null; eventKey: string }) {
  const from = leg?.from === "clientA" ? CLIENT_A : CLIENT_B;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-sm" role="img" aria-label="Клиенты и Redis">
        <line x1={CLIENT_A.x} y1={CLIENT_A.y} x2={REDIS.x} y2={REDIS.y} stroke="rgb(51 65 85)" strokeWidth={2} />
        <line x1={CLIENT_B.x} y1={CLIENT_B.y} x2={REDIS.x} y2={REDIS.y} stroke="rgb(51 65 85)" strokeWidth={2} />

        {leg && (
          <motion.circle
            key={eventKey}
            r={7}
            fill={leg.kind === "error" ? "rgb(244 63 94)" : "rgb(99 102 241)"}
            initial={{ cx: from.x, cy: from.y, opacity: 0 }}
            animate={{ cx: [from.x, REDIS.x], cy: [from.y, REDIS.y], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        )}

        {[
          { pos: CLIENT_A, label: "Client A" },
          { pos: CLIENT_B, label: "Client B" },
          { pos: REDIS, label: "Redis" },
        ].map(({ pos, label }) => (
          <g key={label}>
            <rect x={pos.x - BOX_W / 2} y={pos.y - BOX_H / 2} width={BOX_W} height={BOX_H} rx={10} fill="rgb(30 41 59)" stroke="rgb(71 85 105)" strokeWidth={1.5} />
            <text x={pos.x} y={pos.y + 5} textAnchor="middle" fill="white" fontSize={13} fontWeight={600}>
              {label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
