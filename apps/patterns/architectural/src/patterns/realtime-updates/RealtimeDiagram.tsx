import { motion } from "framer-motion";
import type { RealtimeLegKind } from "./realtime";

const W = 400;
const H = 160;
const CLIENT = { x: 90, y: 80 };
const SERVER = { x: 310, y: 80 };
const BOX_W = 110;
const BOX_H = 48;

export function RealtimeDiagram({
  leg,
  waiting,
  eventKey,
}: {
  leg: { kind: RealtimeLegKind } | null;
  waiting: boolean;
  eventKey: string;
}) {
  const forward = leg?.kind === "request";
  const a = forward ? CLIENT : SERVER;
  const b = forward ? SERVER : CLIENT;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-sm" role="img" aria-label="Клиент и сервер">
        <line
          x1={CLIENT.x}
          y1={CLIENT.y}
          x2={SERVER.x}
          y2={SERVER.y}
          stroke={waiting ? "rgb(245 158 11)" : "rgb(51 65 85)"}
          strokeWidth={waiting ? 2.5 : 2}
          strokeDasharray={waiting ? "5 4" : undefined}
        />

        {leg && (
          <motion.circle
            key={eventKey}
            r={7}
            fill={leg.kind === "request" ? "rgb(99 102 241)" : "rgb(56 189 248)"}
            initial={{ cx: a.x, cy: a.y, opacity: 0 }}
            animate={{ cx: [a.x, b.x], cy: [a.y, b.y], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        )}

        {[
          { pos: CLIENT, label: "Client" },
          { pos: SERVER, label: "Server" },
        ].map(({ pos, label }) => (
          <g key={label}>
            <rect
              x={pos.x - BOX_W / 2}
              y={pos.y - BOX_H / 2}
              width={BOX_W}
              height={BOX_H}
              rx={10}
              fill="rgb(30 41 59)"
              stroke="rgb(71 85 105)"
              strokeWidth={1.5}
            />
            <text x={pos.x} y={pos.y + 5} textAnchor="middle" fill="white" fontSize={14} fontWeight={600}>
              {label}
            </text>
          </g>
        ))}
      </svg>
      {waiting && <p className="mt-1 text-center text-xs text-amber-400">⏱ соединение открыто, ожидание…</p>}
    </div>
  );
}
