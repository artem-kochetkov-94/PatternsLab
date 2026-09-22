import { motion } from "framer-motion";
import type { SyncLeg, SyncStep } from "./consistency";

const W = 640;
const H = 220;
const BOX_W = 130;
const BOX_H = 56;

const POS = {
  client: { x: 90, y: 110 },
  master: { x: 330, y: 110 },
  replica: { x: 560, y: 110 },
};

/** Сколько секунд длится импульс на ОДНОМ перегоне — используется и Demo.tsx. */
export const PACKET_LEG_DURATION = 1.1;

function rectAt(center: { x: number; y: number }) {
  return { x: center.x - BOX_W / 2, y: center.y - BOX_H / 2 };
}

/**
 * write — клиент шлёт запрос (индиго, вперёд). replicate — данные едут с
 * мастера на реплику (фиолетовый, вперёд). ack — подтверждение едет НАЗАД,
 * от того, кто ответил, к тому, кто спрашивал (голубой, вперёд по своему
 * направлению — from/to уже указывают направление ack).
 */
function LegPulses({ legs, eventKey }: { legs: SyncLeg[]; eventKey: string }) {
  return (
    <>
      {legs.map((leg, i) => {
        const a = POS[leg.from as keyof typeof POS];
        const b = POS[leg.to as keyof typeof POS];
        const legStart = i * PACKET_LEG_DURATION;
        const fill =
          leg.kind === "ack"
            ? "rgb(56 189 248)"
            : leg.kind === "replicate"
              ? "rgb(168 85 247)"
              : "rgb(99 102 241)";
        return (
          <motion.circle
            key={`${eventKey}-leg-${i}`}
            r={7}
            fill={fill}
            initial={{ cx: a.x, cy: a.y, opacity: 0 }}
            animate={{ cx: [a.x, b.x], cy: [a.y, b.y], opacity: [0, 1, 1, 0] }}
            transition={{ duration: PACKET_LEG_DURATION, delay: legStart, ease: "easeInOut" }}
          />
        );
      })}
    </>
  );
}

const NODES: { id: keyof typeof POS; label: string }[] = [
  { id: "client", label: "Client" },
  { id: "master", label: "Master" },
  { id: "replica", label: "Replica" },
];

export function SyncDiagram({ step }: { step: SyncStep }) {
  const touched = new Set(step.legs.flatMap((leg) => [leg.from, leg.to]));
  const eventKey = `${step.id}`;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Порядок ACK при репликации">
        <line x1={POS.client.x} y1={POS.client.y} x2={POS.master.x} y2={POS.master.y} stroke="rgb(51 65 85)" strokeWidth={2} />
        <line x1={POS.master.x} y1={POS.master.y} x2={POS.replica.x} y2={POS.replica.y} stroke="rgb(51 65 85)" strokeWidth={2} />

        <LegPulses legs={step.legs} eventKey={eventKey} />

        {NODES.map((node) => {
          const rect = rectAt(POS[node.id]);
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
                style={{ transformOrigin: `${rect.x + BOX_W / 2}px ${rect.y + BOX_H / 2}px` }}
                transition={{ duration: 0.4 }}
              />
              <text x={rect.x + BOX_W / 2} y={rect.y + BOX_H / 2 + 5} textAnchor="middle" fill="white" fontSize={15} fontWeight={600}>
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
