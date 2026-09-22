import { motion } from "framer-motion";
import type { CapState } from "./cap";

const W = 480;
const H = 200;
const BOX_W = 150;
const BOX_H = 64;
const POS_A = { x: 120, y: 100 };
const POS_B = { x: 360, y: 100 };

function rectAt(center: { x: number; y: number }) {
  return { x: center.x - BOX_W / 2, y: center.y - BOX_H / 2 };
}

export function CapDiagram({
  state,
  flashA,
  flashB,
  bTone,
}: {
  state: CapState;
  flashA: string;
  flashB: string;
  /** "up" (обычный ответ), "stale" (устарел), "down" (недоступен) — только для Node B. */
  bTone: "up" | "stale" | "down";
}) {
  const rectA = rectAt(POS_A);
  const rectB = rectAt(POS_B);
  const bFill = bTone === "down" ? "rgb(76 5 25)" : bTone === "stale" ? "rgb(69 26 3)" : "rgb(30 41 59)";
  const bStroke = bTone === "down" ? "rgb(244 63 94)" : bTone === "stale" ? "rgb(245 158 11)" : "rgb(71 85 105)";

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Узлы A и B, связь между ними">
        {state.partitioned ? (
          <>
            <line x1={POS_A.x} y1={POS_A.y} x2={POS_B.x} y2={POS_B.y} stroke="rgb(244 63 94)" strokeWidth={2.5} strokeDasharray="6 5" />
            <text x={(POS_A.x + POS_B.x) / 2} y={POS_A.y - 16} textAnchor="middle" fill="rgb(244 63 94)" fontSize={20} fontWeight={700}>
              ✕
            </text>
          </>
        ) : (
          <line x1={POS_A.x} y1={POS_A.y} x2={POS_B.x} y2={POS_B.y} stroke="rgb(71 85 105)" strokeWidth={2} />
        )}

        <g>
          <motion.rect
            key={flashA}
            x={rectA.x}
            y={rectA.y}
            width={BOX_W}
            height={BOX_H}
            rx={10}
            fill="rgb(49 46 129)"
            stroke="rgb(129 140 248)"
            strokeWidth={2.5}
            animate={{ scale: [1, 1.05, 1] }}
            style={{ transformOrigin: `${POS_A.x}px ${POS_A.y}px` }}
            transition={{ duration: 0.4 }}
          />
          <text x={POS_A.x} y={POS_A.y - 6} textAnchor="middle" fill="white" fontSize={15} fontWeight={600}>
            Node A
          </text>
          <text x={POS_A.x} y={POS_A.y + 16} textAnchor="middle" fill="rgb(199 210 254)" fontSize={13} fontFamily="monospace">
            {state.nodeAValue}
          </text>
        </g>

        <g>
          <motion.rect
            key={flashB}
            x={rectB.x}
            y={rectB.y}
            width={BOX_W}
            height={BOX_H}
            rx={10}
            fill={bFill}
            stroke={bStroke}
            strokeWidth={2.5}
            animate={{ scale: [1, 1.05, 1] }}
            style={{ transformOrigin: `${POS_B.x}px ${POS_B.y}px` }}
            transition={{ duration: 0.4 }}
          />
          <text x={POS_B.x} y={POS_B.y - 6} textAnchor="middle" fill="white" fontSize={15} fontWeight={600}>
            Node B
          </text>
          <text x={POS_B.x} y={POS_B.y + 16} textAnchor="middle" fill={bTone === "down" ? "rgb(253 164 175)" : "rgb(226 232 240)"} fontSize={13} fontFamily="monospace">
            {bTone === "down" ? "недоступна" : state.nodeBValue}
          </text>
        </g>
      </svg>
    </div>
  );
}
