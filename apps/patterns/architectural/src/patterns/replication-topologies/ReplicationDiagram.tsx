import { motion } from "framer-motion";
import type {
  NodeState,
  ReplicationLeg,
  ReplicationNode,
  ReplicationStep,
  TopologyDef,
} from "./topologies";

const W = 640;
const H = 260;
const BOX_W = 130;
const BOX_H = 56;

/** Сколько секунд длится импульс на ОДНОМ перегоне — используется и Demo.tsx. */
export const PACKET_LEG_DURATION = 1.1;

function rectAt(center: { x: number; y: number }) {
  return { x: center.x - BOX_W / 2, y: center.y - BOX_H / 2 };
}

/**
 * write — клиентская запись, летит вперёд (индиго). read — полноценный
 * обмен запрос/ответ (индиго туда, голубой обратно). replicate — трафик
 * МЕЖДУ базами, а не от клиента, — визуально отличаем фиолетовым, чтобы не
 * путать с клиентским write.
 */
function LegPulses({
  legs,
  pos,
  eventKey,
}: {
  legs: ReplicationLeg[];
  pos: Record<string, { x: number; y: number }>;
  eventKey: string;
}) {
  const half = PACKET_LEG_DURATION / 2;
  return (
    <>
      {legs.map((leg, i) => {
        const a = pos[leg.from];
        const b = pos[leg.to];
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
                transition={{ duration: half, delay: legStart + half, ease: "easeInOut" }}
              />
            </g>
          );
        }

        const fill = leg.kind === "replicate" ? "rgb(168 85 247)" : "rgb(99 102 241)";
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

const TONE_FILL: Record<string, string> = {
  slate: "rgb(30 41 59)",
  indigo: "rgb(49 46 129)",
  rose: "rgb(76 5 25)",
  emerald: "rgb(6 78 59)",
};
const TONE_STROKE: Record<string, string> = {
  slate: "rgb(71 85 105)",
  indigo: "rgb(129 140 248)",
  rose: "rgb(244 63 94)",
  emerald: "rgb(52 211 153)",
};

function nodeTone(id: string, states: Record<string, NodeState>, touched: Set<string>) {
  const state = states[id];
  if (state === "down") return "rose";
  if (state === "promoted") return "emerald";
  return touched.has(id) ? "indigo" : "slate";
}

function DiagramNode({
  rect,
  title,
  tone,
  down,
  flashKey,
}: {
  rect: { x: number; y: number };
  title: string;
  tone: keyof typeof TONE_FILL;
  down: boolean;
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
        style={{ transformOrigin: `${rect.x + BOX_W / 2}px ${rect.y + BOX_H / 2}px` }}
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
      {down && (
        <text
          x={rect.x + BOX_W - 14}
          y={rect.y + 18}
          textAnchor="middle"
          fill="rgb(244 63 94)"
          fontSize={16}
          fontWeight={700}
        >
          ✕
        </text>
      )}
    </g>
  );
}

export function ReplicationDiagram({
  topology,
  step,
}: {
  topology: TopologyDef;
  step: ReplicationStep;
}) {
  const touched = new Set(step.legs.flatMap((leg) => [leg.from, leg.to]));
  const eventKey = `${topology.id}-${step.id}`;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Схема топологии ${topology.label}`}
      >
        {topology.edges.map(([from, to]) => {
          const a = topology.pos[from];
          const b = topology.pos[to];
          return (
            <line
              key={`edge-${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgb(51 65 85)"
              strokeWidth={2}
            />
          );
        })}

        {step.blockedWrite && (
          <g>
            <line
              x1={topology.pos[step.blockedWrite.from].x}
              y1={topology.pos[step.blockedWrite.from].y}
              x2={topology.pos[step.blockedWrite.to].x}
              y2={topology.pos[step.blockedWrite.to].y}
              stroke="rgb(244 63 94)"
              strokeWidth={2.5}
              strokeDasharray="6 5"
            />
            <text
              x={(topology.pos[step.blockedWrite.from].x + topology.pos[step.blockedWrite.to].x) / 2}
              y={(topology.pos[step.blockedWrite.from].y + topology.pos[step.blockedWrite.to].y) / 2 - 10}
              textAnchor="middle"
              fill="rgb(244 63 94)"
              fontSize={18}
              fontWeight={700}
            >
              ✕
            </text>
          </g>
        )}

        <LegPulses legs={step.legs} pos={topology.pos} eventKey={eventKey} />

        {topology.nodes.map((node: ReplicationNode) => (
          <DiagramNode
            key={node.id}
            rect={rectAt(topology.pos[node.id])}
            title={node.label}
            tone={nodeTone(node.id, step.nodeStates, touched)}
            down={step.nodeStates[node.id] === "down"}
            flashKey={`${eventKey}-${node.id}-${step.nodeStates[node.id]}`}
          />
        ))}
      </svg>
    </div>
  );
}
