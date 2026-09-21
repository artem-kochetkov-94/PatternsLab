import { motion } from "framer-motion";
import type { CircuitState, CircuitStep } from "./circuitBreaker";

// Тот же приём, что в остальных диаграммах категории: фиксированный
// "холст" вместо измерения реальных DOM-координат.
const STATE_W = 640;
const STATE_H = 170;
const STATE_BOX = { w: 130, h: 50 };

const STATE_POS: Record<CircuitState, { x: number; y: number }> = {
  closed: { x: 110, y: 55 },
  open: { x: 530, y: 55 },
  "half-open": { x: 320, y: 140 },
};

const STATE_LABEL: Record<CircuitState, string> = {
  closed: "CLOSED",
  open: "OPEN",
  "half-open": "HALF-OPEN",
};

// Светофорная метафора: закрыта — можно ехать, открыта — стоп, половина — осторожно.
const STATE_FILL: Record<CircuitState, string> = {
  closed: "rgb(6 78 59)",
  open: "rgb(80 7 36)",
  "half-open": "rgb(120 53 15)",
};
const STATE_STROKE: Record<CircuitState, string> = {
  closed: "rgb(52 211 153)",
  open: "rgb(251 113 133)",
  "half-open": "rgb(251 191 36)",
};

function rect(center: { x: number; y: number }, box = STATE_BOX) {
  return { x: center.x - box.w / 2, y: center.y - box.h / 2 };
}

/** Схема автомата: три состояния и подписанные переходы между ними. */
function StateMachine({ state, eventKey }: { state: CircuitState; eventKey: string }) {
  return (
    <svg
      viewBox={`0 0 ${STATE_W} ${STATE_H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Автомат состояний Circuit Breaker"
    >
      {/* closed → open. */}
      <path
        d={`M ${STATE_POS.closed.x + 40} ${STATE_POS.closed.y - STATE_BOX.h / 2} Q ${STATE_W / 2} 0 ${STATE_POS.open.x - 40} ${STATE_POS.open.y - STATE_BOX.h / 2}`}
        fill="none"
        stroke="rgb(71 85 105)"
        strokeWidth={1.5}
      />
      <text x={STATE_W / 2} y={16} textAnchor="middle" fill="rgb(148 163 184)" fontSize={10}>
        N отказов подряд
      </text>

      {/* open → half-open. */}
      <line
        x1={STATE_POS.open.x - 15}
        y1={STATE_POS.open.y + STATE_BOX.h / 2}
        x2={STATE_POS["half-open"].x + STATE_BOX.w / 2 + 10}
        y2={STATE_POS["half-open"].y - 8}
        stroke="rgb(71 85 105)"
        strokeWidth={1.5}
      />
      <text x={430} y={110} textAnchor="middle" fill="rgb(148 163 184)" fontSize={10}>
        таймаут
      </text>

      {/* half-open → closed. */}
      <line
        x1={STATE_POS["half-open"].x - STATE_BOX.w / 2 - 10}
        y1={STATE_POS["half-open"].y - 8}
        x2={STATE_POS.closed.x + 15}
        y2={STATE_POS.closed.y + STATE_BOX.h / 2}
        stroke="rgb(71 85 105)"
        strokeWidth={1.5}
      />
      <text x={210} y={110} textAnchor="middle" fill="rgb(148 163 184)" fontSize={10}>
        успех
      </text>

      {/* half-open → open (снова отказ). */}
      <path
        d={`M ${STATE_POS["half-open"].x + 30} ${STATE_POS["half-open"].y - STATE_BOX.h / 2 + 6} Q ${(STATE_POS["half-open"].x + STATE_POS.open.x) / 2 + 30} 70 ${STATE_POS.open.x - 10} ${STATE_POS.open.y + STATE_BOX.h / 2 - 4}`}
        fill="none"
        stroke="rgb(71 85 105)"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <text x={470} y={95} textAnchor="middle" fill="rgb(148 163 184)" fontSize={10}>
        снова отказ
      </text>

      {(["closed", "half-open", "open"] as CircuitState[]).map((s) => {
        const active = s === state;
        const r = rect(STATE_POS[s]);
        return (
          <g key={s}>
            <motion.rect
              key={active ? `${s}-${eventKey}` : s}
              x={r.x}
              y={r.y}
              width={STATE_BOX.w}
              height={STATE_BOX.h}
              rx={10}
              fill={active ? STATE_FILL[s] : "rgb(30 41 59)"}
              stroke={active ? STATE_STROKE[s] : "rgb(71 85 105)"}
              strokeWidth={active ? 2.5 : 1.5}
              animate={active ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              style={{
                transformOrigin: `${STATE_POS[s].x}px ${STATE_POS[s].y}px`,
              }}
              transition={{ duration: 0.4 }}
            />
            <text
              x={STATE_POS[s].x}
              y={STATE_POS[s].y + 4}
              textAnchor="middle"
              fill={active ? "white" : "rgb(148 163 184)"}
              fontSize={13}
              fontWeight={700}
            >
              {STATE_LABEL[s]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Нижняя часть — поток запроса: Client → Breaker → Backend (или отказ на Breaker).
const FLOW_W = 640;
const FLOW_H = 130;
const FLOW_BOX = { w: 130, h: 56 };

type FlowNodeId = "client" | "breaker" | "backend";
const FLOW_POS: Record<FlowNodeId, { x: number; y: number }> = {
  client: { x: 80, y: 65 },
  breaker: { x: 320, y: 65 },
  backend: { x: 560, y: 65 },
};

const PACKET_LEG_DURATION_S = 1.6;

function RequestFlow({ step }: { step: CircuitStep }) {
  const legs: [FlowNodeId, FlowNodeId][] = step.attempted
    ? [
        ["client", "breaker"],
        ["breaker", "backend"],
      ]
    : [["client", "breaker"]];

  const cx: number[] = [];
  const cy: number[] = [];
  for (const [from, to] of legs) {
    cx.push(FLOW_POS[from].x, FLOW_POS[to].x);
    cy.push(FLOW_POS[from].y, FLOW_POS[to].y);
  }
  const opacity = cx.map((_, i) => (i === 0 || i === cx.length - 1 ? 0 : 1));

  const breakerTone =
    step.outcome === "short-circuited" ? "amber" : "indigo";
  const backendTone =
    step.outcome === "success" ? "emerald" : step.outcome === "failure" ? "rose" : "slate";

  const eventKey = `${step.id}`;

  return (
    <svg
      viewBox={`0 0 ${FLOW_W} ${FLOW_H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Маршрут запроса через Circuit Breaker"
    >
      <line
        x1={FLOW_POS.client.x + FLOW_BOX.w / 2}
        y1={FLOW_POS.client.y}
        x2={FLOW_POS.breaker.x - FLOW_BOX.w / 2}
        y2={FLOW_POS.breaker.y}
        stroke="rgb(51 65 85)"
        strokeWidth={2}
      />
      <line
        x1={FLOW_POS.breaker.x + FLOW_BOX.w / 2}
        y1={FLOW_POS.breaker.y}
        x2={FLOW_POS.backend.x - FLOW_BOX.w / 2}
        y2={FLOW_POS.backend.y}
        stroke="rgb(51 65 85)"
        strokeWidth={2}
      />

      <motion.circle
        key={`packet-${eventKey}`}
        r={7}
        fill="rgb(99 102 241)"
        initial={{ cx: cx[0], cy: cy[0], opacity: 0 }}
        animate={{ cx, cy, opacity }}
        transition={{
          duration: PACKET_LEG_DURATION_S * legs.length,
          ease: "easeInOut",
        }}
      />

      <FlowNode
        pos={FLOW_POS.client}
        title="Client"
        tone="indigo"
        flashKey={eventKey}
      />
      <FlowNode
        pos={FLOW_POS.breaker}
        title="Circuit Breaker"
        tone={breakerTone}
        flashKey={eventKey}
      />
      <FlowNode
        pos={FLOW_POS.backend}
        title="Backend"
        tone={backendTone}
        flashKey={step.attempted ? eventKey : "idle"}
      />
    </svg>
  );
}

const FLOW_FILL: Record<string, string> = {
  slate: "rgb(30 41 59)",
  indigo: "rgb(49 46 129)",
  amber: "rgb(120 53 15)",
  emerald: "rgb(6 78 59)",
  rose: "rgb(80 7 36)",
};
const FLOW_STROKE: Record<string, string> = {
  slate: "rgb(71 85 105)",
  indigo: "rgb(129 140 248)",
  amber: "rgb(251 191 36)",
  emerald: "rgb(52 211 153)",
  rose: "rgb(251 113 133)",
};

function FlowNode({
  pos,
  title,
  tone,
  flashKey,
}: {
  pos: { x: number; y: number };
  title: string;
  tone: keyof typeof FLOW_FILL;
  flashKey: string;
}) {
  const r = rect(pos, FLOW_BOX);
  return (
    <g>
      <motion.rect
        key={flashKey}
        x={r.x}
        y={r.y}
        width={FLOW_BOX.w}
        height={FLOW_BOX.h}
        rx={10}
        fill={FLOW_FILL[tone]}
        stroke={FLOW_STROKE[tone]}
        strokeWidth={tone === "slate" ? 1.5 : 2.5}
        animate={tone !== "slate" ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
        transition={{ duration: 0.4 }}
      />
      <text
        x={pos.x}
        y={pos.y + 5}
        textAnchor="middle"
        fill="white"
        fontSize={13}
        fontWeight={600}
      >
        {title}
      </text>
    </g>
  );
}

/** Столько секунд занимает анимация пакета для одного шага — нужно Demo.tsx. */
export const PACKET_LEG_DURATION = PACKET_LEG_DURATION_S;

export function CircuitBreakerDiagram({ step }: { step: CircuitStep }) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <StateMachine state={step.stateAfter} eventKey={`${step.id}`} />
      <div className="h-px bg-slate-800" />
      <RequestFlow step={step} />
    </div>
  );
}
