import { motion } from "framer-motion";
import type { CircuitState, CircuitStep } from "./circuitBreaker";

// Один поток запроса Client → Breaker → Backend — тот же визуальный язык,
// что и в остальных диаграммах категории. Раньше состояние автомата
// рисовалось ОТДЕЛЬНОЙ схемой сверху (треугольник с кривыми стрелками) —
// пришлось следить за двумя несвязанными картинками сразу. Теперь состояние —
// это просто постоянный цвет и подпись прямо на узле Breaker.
const W = 640;
const H = 180;
const BOX_W = 150;
const BOX_H = 60;

type NodeId = "client" | "breaker" | "backend";
const POS: Record<NodeId, { x: number; y: number }> = {
  client: { x: 90, y: 90 },
  breaker: { x: 320, y: 90 },
  backend: { x: 550, y: 90 },
};

const STATE_LABEL: Record<CircuitState, string> = {
  closed: "CLOSED",
  open: "OPEN",
  "half-open": "HALF-OPEN",
};

// Светофорная метафора: закрыта — можно ехать, открыта — стоп, половина — осторожно.
const STATE_TONE: Record<CircuitState, "emerald" | "rose" | "amber"> = {
  closed: "emerald",
  open: "rose",
  "half-open": "amber",
};

/** Сколько секунд длится импульс на ОДНОМ перегоне — используется и Demo.tsx. */
export const PACKET_LEG_DURATION = 1.1;

function rect(center: { x: number; y: number }) {
  return { x: center.x - BOX_W / 2, y: center.y - BOX_H / 2 };
}

function LegPulses({ legs, eventKey }: { legs: [NodeId, NodeId][]; eventKey: string }) {
  return (
    <>
      {legs.map(([from, to], i) => {
        const a = POS[from];
        const b = POS[to];
        return (
          <motion.circle
            key={`${eventKey}-leg-${i}`}
            r={7}
            fill="rgb(99 102 241)"
            initial={{ cx: a.x, cy: a.y, opacity: 0 }}
            animate={{ cx: [a.x, b.x], cy: [a.y, b.y], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: PACKET_LEG_DURATION,
              delay: i * PACKET_LEG_DURATION,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </>
  );
}

export function CircuitBreakerDiagram({ step }: { step: CircuitStep }) {
  const legs: [NodeId, NodeId][] = step.attempted
    ? [
        ["client", "breaker"],
        ["breaker", "backend"],
      ]
    : [["client", "breaker"]];

  const eventKey = `${step.id}`;
  const stateTone = STATE_TONE[step.stateAfter];
  const backendTone =
    step.outcome === "success" ? "emerald" : step.outcome === "failure" ? "rose" : "slate";

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Схема прохождения запроса через Circuit Breaker"
      >
        <line
          x1={POS.client.x + BOX_W / 2}
          y1={POS.client.y}
          x2={POS.breaker.x - BOX_W / 2}
          y2={POS.breaker.y}
          stroke="rgb(51 65 85)"
          strokeWidth={2}
        />
        <line
          x1={POS.breaker.x + BOX_W / 2}
          y1={POS.breaker.y}
          x2={POS.backend.x - BOX_W / 2}
          y2={POS.backend.y}
          stroke="rgb(51 65 85)"
          strokeWidth={2}
        />

        <LegPulses legs={legs} eventKey={eventKey} />

        <Node rect={rect(POS.client)} title="Client" tone="indigo" flashKey={eventKey} />
        <BreakerNode rect={rect(POS.breaker)} tone={stateTone} label={STATE_LABEL[step.stateAfter]} flashKey={eventKey} />
        <Node
          rect={rect(POS.backend)}
          title="Backend"
          tone={backendTone}
          flashKey={step.attempted ? eventKey : "idle"}
        />
      </svg>
    </div>
  );
}

const TONE_FILL: Record<string, string> = {
  slate: "rgb(30 41 59)",
  indigo: "rgb(49 46 129)",
  emerald: "rgb(6 78 59)",
  rose: "rgb(80 7 36)",
  amber: "rgb(120 53 15)",
};
const TONE_STROKE: Record<string, string> = {
  slate: "rgb(71 85 105)",
  indigo: "rgb(129 140 248)",
  emerald: "rgb(52 211 153)",
  rose: "rgb(251 113 133)",
  amber: "rgb(251 191 36)",
};

function Node({
  rect: r,
  title,
  tone,
  flashKey,
}: {
  rect: { x: number; y: number };
  title: string;
  tone: keyof typeof TONE_FILL;
  flashKey: string;
}) {
  return (
    <g>
      <motion.rect
        key={flashKey}
        x={r.x}
        y={r.y}
        width={BOX_W}
        height={BOX_H}
        rx={10}
        fill={TONE_FILL[tone]}
        stroke={TONE_STROKE[tone]}
        strokeWidth={tone === "slate" ? 1.5 : 2.5}
        animate={tone !== "slate" ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        style={{ transformOrigin: `${r.x + BOX_W / 2}px ${r.y + BOX_H / 2}px` }}
        transition={{ duration: 0.4 }}
      />
      <text
        x={r.x + BOX_W / 2}
        y={r.y + BOX_H / 2 + 5}
        textAnchor="middle"
        fill="white"
        fontSize={14}
        fontWeight={600}
      >
        {title}
      </text>
    </g>
  );
}

/** Узел Breaker всегда окрашен по ТЕКУЩЕМУ состоянию автомата — не только
 * когда через него прошёл запрос, — и всегда подписан этим состоянием. */
function BreakerNode({
  rect: r,
  tone,
  label,
  flashKey,
}: {
  rect: { x: number; y: number };
  tone: keyof typeof TONE_FILL;
  label: string;
  flashKey: string;
}) {
  return (
    <g>
      <motion.rect
        key={flashKey}
        x={r.x}
        y={r.y}
        width={BOX_W}
        height={BOX_H}
        rx={10}
        fill={TONE_FILL[tone]}
        stroke={TONE_STROKE[tone]}
        strokeWidth={2.5}
        animate={{ scale: [1, 1.04, 1] }}
        style={{ transformOrigin: `${r.x + BOX_W / 2}px ${r.y + BOX_H / 2}px` }}
        transition={{ duration: 0.4 }}
      />
      <text
        x={r.x + BOX_W / 2}
        y={r.y + BOX_H / 2 - 6}
        textAnchor="middle"
        fill="white"
        fontSize={13}
        fontWeight={600}
      >
        Circuit Breaker
      </text>
      <text
        x={r.x + BOX_W / 2}
        y={r.y + BOX_H / 2 + 14}
        textAnchor="middle"
        fill="white"
        fontSize={12}
        fontWeight={700}
      >
        {label}
      </text>
    </g>
  );
}
