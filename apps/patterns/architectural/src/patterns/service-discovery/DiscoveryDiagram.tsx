import { motion } from "framer-motion";
import type { BackendState, DiscoveryStep } from "./discovery";

const W = 500;
const H = 260;
const LB = { x: 140, y: 60 };
const DISCOVERY = { x: 140, y: 220 };
const BACKENDS: Record<string, { x: number; y: number }> = {
  b1: { x: 400, y: 50 },
  b2: { x: 400, y: 130 },
  b3: { x: 400, y: 210 },
};
const BOX_W = 130;
const BOX_H = 46;

const STATE_FILL: Record<BackendState, string> = {
  starting: "rgb(30 41 59)",
  up: "rgb(6 78 59)",
  warning: "rgb(69 26 3)",
  down: "rgb(76 5 25)",
};
const STATE_STROKE: Record<BackendState, string> = {
  starting: "rgb(100 116 139)",
  up: "rgb(52 211 153)",
  warning: "rgb(245 158 11)",
  down: "rgb(244 63 94)",
};
const STATE_LABEL: Record<BackendState, string> = {
  starting: "запускается",
  up: "в ротации",
  warning: "нет heartbeat",
  down: "исключён",
};

function box(pos: { x: number; y: number }) {
  return { x: pos.x - BOX_W / 2, y: pos.y - BOX_H / 2 };
}

export function DiscoveryDiagram({ step }: { step: DiscoveryStep }) {
  const eventKey = `${step.id}`;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Service Discovery и Heartbeat">
        <line x1={LB.x} y1={LB.y} x2={DISCOVERY.x} y2={DISCOVERY.y} stroke="rgb(51 65 85)" strokeWidth={2} strokeDasharray="4 4" />
        {Object.values(BACKENDS).map((pos, i) => (
          <line key={`lb-${i}`} x1={LB.x} y1={LB.y} x2={pos.x} y2={pos.y} stroke="rgb(51 65 85)" strokeWidth={2} />
        ))}
        {Object.values(BACKENDS).map((pos, i) => (
          <line key={`disc-${i}`} x1={DISCOVERY.x} y1={DISCOVERY.y} x2={pos.x} y2={pos.y} stroke="rgb(51 65 85)" strokeWidth={1.5} strokeDasharray="3 3" />
        ))}

        {step.activeLeg &&
          (() => {
            const from = step.activeLeg.from === "lb" ? LB : step.activeLeg.from === "discovery" ? DISCOVERY : BACKENDS[step.activeLeg.from];
            const to = step.activeLeg.to === "lb" ? LB : step.activeLeg.to === "discovery" ? DISCOVERY : BACKENDS[step.activeLeg.to];
            return (
              <motion.circle
                key={eventKey}
                r={7}
                fill="rgb(99 102 241)"
                initial={{ cx: from.x, cy: from.y, opacity: 0 }}
                animate={{ cx: [from.x, to.x], cy: [from.y, to.y], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            );
          })()}

        {/* LB и Discovery — фиксированные узлы */}
        <g>
          <rect x={box(LB).x} y={box(LB).y} width={BOX_W} height={BOX_H} rx={10} fill="rgb(49 46 129)" stroke="rgb(129 140 248)" strokeWidth={2} />
          <text x={LB.x} y={LB.y + 5} textAnchor="middle" fill="white" fontSize={13} fontWeight={600}>
            Load Balancer
          </text>
        </g>
        <g>
          <rect x={box(DISCOVERY).x} y={box(DISCOVERY).y} width={BOX_W} height={BOX_H} rx={10} fill="rgb(49 46 129)" stroke="rgb(129 140 248)" strokeWidth={2} />
          <text x={DISCOVERY.x} y={DISCOVERY.y + 5} textAnchor="middle" fill="white" fontSize={13} fontWeight={600}>
            Service Discovery
          </text>
        </g>

        {Object.entries(BACKENDS).map(([id, pos]) => {
          const state = step.backendStates[id];
          const rect = box(pos);
          return (
            <g key={id}>
              <motion.rect
                key={`${eventKey}-${id}-${state}`}
                x={rect.x}
                y={rect.y}
                width={BOX_W}
                height={BOX_H}
                rx={10}
                fill={STATE_FILL[state]}
                stroke={STATE_STROKE[state]}
                strokeWidth={2}
                animate={{ scale: [1, 1.05, 1] }}
                style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                transition={{ duration: 0.4 }}
              />
              <text x={pos.x} y={pos.y - 2} textAnchor="middle" fill="white" fontSize={12} fontWeight={600}>
                {id === "b1" ? "Backend #1" : id === "b2" ? "Backend #2" : "Backend #3"}
              </text>
              <text x={pos.x} y={pos.y + 14} textAnchor="middle" fill={STATE_STROKE[state]} fontSize={10}>
                {STATE_LABEL[state]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
