import { AnimatePresence, motion } from "framer-motion";
import type { BrokerLeg, BrokerNode, BrokerStep } from "./brokers";

// Тот же приём, что и в остальных диаграммах категории, но раскладка не
// фиксированная: у Kafka 3 узла (Producer/Topic/Consumer), у RabbitMQ — 4
// (Producer/Exchange/Queue/Consumer), поэтому позиции считаются по числу
// узлов, а не жёстко прописаны.
const W = 720;
const H = 180;
const BOX_W = 130;
const BOX_H = 56;
const MARGIN = 100;
const Y = 90;

/** Сколько секунд длится импульс на ОДНОМ перегоне — используется и Demo.tsx. */
export const PACKET_LEG_DURATION = 1.1;

function nodePositions(nodes: BrokerNode[]): Map<string, { x: number; y: number }> {
  const n = nodes.length;
  const spacing = n > 1 ? (W - 2 * MARGIN) / (n - 1) : 0;
  const map = new Map<string, { x: number; y: number }>();
  nodes.forEach((node, i) => {
    map.set(node.id, { x: MARGIN + spacing * i, y: Y });
  });
  return map;
}

function rectAt(center: { x: number; y: number }) {
  return { x: center.x - BOX_W / 2, y: center.y - BOX_H / 2 };
}

/**
 * read — полноценный круговой обмен (consumer сам спросил и сам получил
 * данные, индиго+голубой). write — данные едут только вперёд (индиго),
 * отвечать нечем. response — данные едут вперёд САМИ ПО СЕБЕ (голубой),
 * без запроса в этом же перегоне, — то есть push: брокер доставляет не
 * дожидаясь, пока его попросят.
 */
function LegPulses({
  legs,
  pos,
  eventKey,
}: {
  legs: BrokerLeg[];
  pos: Map<string, { x: number; y: number }>;
  eventKey: string;
}) {
  const half = PACKET_LEG_DURATION / 2;
  return (
    <>
      {legs.map((leg, i) => {
        const a = pos.get(leg.from)!;
        const b = pos.get(leg.to)!;
        const legStart = i * PACKET_LEG_DURATION;

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
                transition={{
                  duration: half,
                  delay: legStart + half,
                  ease: "easeInOut",
                }}
              />
            </g>
          );
        }

        const fill = leg.kind === "response" ? "rgb(56 189 248)" : "rgb(99 102 241)";
        return (
          <motion.circle
            key={`${eventKey}-leg-${i}`}
            r={7}
            fill={fill}
            initial={{ cx: a.x, cy: a.y, opacity: 0 }}
            animate={{ cx: [a.x, b.x], cy: [a.y, b.y], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: PACKET_LEG_DURATION,
              delay: legStart,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </>
  );
}

export function BrokerDiagram({
  nodes,
  step,
}: {
  nodes: BrokerNode[];
  step: BrokerStep;
}) {
  const pos = nodePositions(nodes);
  const touched = new Set(step.legs.flatMap((leg) => [leg.from, leg.to]));
  const eventKey = `${step.id}`;

  return (
    <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Схема прохождения сообщения через брокер"
      >
        {nodes.slice(0, -1).map((node, i) => {
          const a = pos.get(node.id)!;
          const b = pos.get(nodes[i + 1].id)!;
          return (
            <line
              key={`edge-${node.id}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgb(51 65 85)"
              strokeWidth={2}
            />
          );
        })}

        <LegPulses legs={step.legs} pos={pos} eventKey={eventKey} />

        {nodes.map((node) => (
          <DiagramNode
            key={node.id}
            rect={rectAt(pos.get(node.id)!)}
            title={node.label}
            tone={touched.has(node.id) ? "indigo" : "slate"}
            flashKey={touched.has(node.id) ? eventKey : "idle"}
          />
        ))}
      </svg>

      {/* Что физически лежит у брокера прямо сейчас. */}
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
          У брокера сейчас
        </p>
        <div className="flex min-h-[2.75rem] flex-wrap items-center gap-2">
          <AnimatePresence initial={false}>
            {step.brokerState.map((msg) => (
              <motion.span
                key={msg.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25 }}
                className={[
                  "rounded-md border px-2.5 py-1 font-mono text-xs",
                  msg.delivered
                    ? "border-slate-700 bg-slate-800/60 text-slate-500"
                    : "border-amber-500 bg-amber-950/40 text-amber-300",
                ].join(" ")}
              >
                {msg.id}
                {msg.delivered ? " ✓" : ""}
              </motion.span>
            ))}
          </AnimatePresence>
          {step.brokerState.length === 0 && (
            <span className="text-sm text-slate-600">пусто</span>
          )}
        </div>
      </div>
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

function DiagramNode({
  rect,
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
        x={rect.x}
        y={rect.y}
        width={BOX_W}
        height={BOX_H}
        rx={10}
        fill={TONE_FILL[tone]}
        stroke={TONE_STROKE[tone]}
        strokeWidth={tone === "slate" ? 1.5 : 2.5}
        animate={tone !== "slate" ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        style={{
          transformOrigin: `${rect.x + BOX_W / 2}px ${rect.y + BOX_H / 2}px`,
        }}
        transition={{ duration: 0.4 }}
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
