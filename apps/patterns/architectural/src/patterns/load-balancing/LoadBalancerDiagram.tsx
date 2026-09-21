import { motion } from "framer-motion";
import type { LbInstance, LbStep, LbStrategyId } from "./strategies";

// Диаграмма рисуется на фиксированном "холсте" (как чертёж), а не мерит
// реальные DOM-координаты — так и проще, и предсказуемее: у нас всегда
// ровно 3 инстанса, поэтому точки просто захардкожены.
const W = 640;
const H = 300;

const CLIENT = { x: 70, y: 150 };
const LB = { x: 300, y: 150 };
const INSTANCES_POS = [
  { x: 560, y: 50 },
  { x: 560, y: 150 },
  { x: 560, y: 250 },
];

const BOX_W = 120;
const BOX_H = 56;

function rectAt(center: { x: number; y: number }) {
  return { x: center.x - BOX_W / 2, y: center.y - BOX_H / 2 };
}

export function LoadBalancerDiagram({
  strategyId,
  instances,
  step,
}: {
  strategyId: LbStrategyId;
  instances: LbInstance[];
  step: LbStep;
}) {
  const activeInstancePos = (() => {
    const idx = instances.findIndex((inst) => inst.id === step.instanceId);
    return idx >= 0 ? INSTANCES_POS[idx] : LB;
  })();

  // Ключ, который меняется на каждом новом событии — им мы форсируем
  // повторное монтирование анимированных элементов, чтобы анимация
  // проигрывалась заново (тот же приём, что и scale-пульс в ArrayVisualizer).
  const eventKey = `${step.tick}-${step.kind}-${step.requestId}`;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Схема балансировки нагрузки"
      >
        {/* Статичные линии связи: client—LB и веер LB—инстансы. */}
        <line
          x1={CLIENT.x + BOX_W / 2}
          y1={CLIENT.y}
          x2={LB.x - BOX_W / 2}
          y2={LB.y}
          stroke="rgb(51 65 85)"
          strokeWidth={2}
        />
        {INSTANCES_POS.map((pos, i) => (
          <line
            key={i}
            x1={LB.x + BOX_W / 2}
            y1={LB.y}
            x2={pos.x - BOX_W / 2}
            y2={pos.y}
            stroke="rgb(51 65 85)"
            strokeWidth={2}
          />
        ))}

        {/* Бегущий "пакет" — виден только для события прихода запроса. */}
        {step.kind === "arrive" && (
          <motion.circle
            key={`packet-${eventKey}`}
            r={7}
            fill="rgb(99 102 241)"
            initial={{
              cx: CLIENT.x + BOX_W / 2,
              cy: CLIENT.y,
              opacity: 0,
            }}
            animate={{
              cx: [CLIENT.x + BOX_W / 2, LB.x, LB.x, activeInstancePos.x - BOX_W / 2],
              cy: [CLIENT.y, LB.y, LB.y, activeInstancePos.y],
              opacity: [0, 1, 1, 0],
            }}
            transition={{ duration: 3.5, ease: "easeInOut" }}
          />
        )}

        {/* Client. */}
        <Node rect={rectAt(CLIENT)} title="Client" tone="slate" />

        {/* Load Balancer — подсвечиваем стратегию под названием. */}
        <Node rect={rectAt(LB)} title="LB" tone="indigo" />

        {/* Инстансы. */}
        {instances.map((inst, i) => {
          const pos = INSTANCES_POS[i];
          const isTarget = inst.id === step.instanceId;
          const flash = isTarget
            ? step.kind === "arrive"
              ? "sky"
              : "rose"
            : null;
          return (
            <InstanceNode
              key={inst.id}
              rect={rectAt(pos)}
              instance={inst}
              connections={step.connections[inst.id] ?? 0}
              showWeight={strategyId === "weighted-round-robin"}
              flash={flash}
              flashKey={isTarget ? eventKey : "idle"}
            />
          );
        })}
      </svg>
    </div>
  );
}

const TONE_FILL: Record<string, string> = {
  slate: "rgb(30 41 59)",
  indigo: "rgb(49 46 129)",
};
const TONE_STROKE: Record<string, string> = {
  slate: "rgb(71 85 105)",
  indigo: "rgb(129 140 248)",
};

function Node({
  rect,
  title,
  tone,
}: {
  rect: { x: number; y: number };
  title: string;
  tone: "slate" | "indigo";
}) {
  return (
    <g>
      <rect
        x={rect.x}
        y={rect.y}
        width={BOX_W}
        height={BOX_H}
        rx={10}
        fill={TONE_FILL[tone]}
        stroke={TONE_STROKE[tone]}
        strokeWidth={1.5}
      />
      <text
        x={rect.x + BOX_W / 2}
        y={rect.y + BOX_H / 2 + 5}
        textAnchor="middle"
        fill="white"
        fontSize={15}
        fontWeight={600}
      >
        {title}
      </text>
    </g>
  );
}

function InstanceNode({
  rect,
  instance,
  connections,
  showWeight,
  flash,
  flashKey,
}: {
  rect: { x: number; y: number };
  instance: LbInstance;
  connections: number;
  showWeight: boolean;
  flash: "sky" | "rose" | null;
  flashKey: string;
}) {
  const stroke = flash === "sky" ? "rgb(56 189 248)" : flash === "rose" ? "rgb(251 113 133)" : "rgb(71 85 105)";

  return (
    <g>
      <motion.rect
        key={flashKey}
        x={rect.x}
        y={rect.y}
        width={BOX_W}
        height={BOX_H}
        rx={10}
        fill="rgb(30 41 59)"
        stroke={stroke}
        strokeWidth={flash ? 2.5 : 1.5}
        animate={flash ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        style={{ transformOrigin: `${rect.x + BOX_W / 2}px ${rect.y + BOX_H / 2}px` }}
        transition={{ duration: 0.4 }}
      />
      <text
        x={rect.x + BOX_W / 2}
        y={rect.y + BOX_H / 2 - 6}
        textAnchor="middle"
        fill="white"
        fontSize={13}
        fontWeight={600}
      >
        {instance.label}
      </text>
      <text
        x={rect.x + BOX_W / 2}
        y={rect.y + BOX_H / 2 + 14}
        textAnchor="middle"
        fill="rgb(148 163 184)"
        fontSize={11}
      >
        {showWeight ? `w=${instance.weight} · ` : ""}соединений: {connections}
      </text>
    </g>
  );
}
