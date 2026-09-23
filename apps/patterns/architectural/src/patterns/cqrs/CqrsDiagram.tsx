import { motion } from "framer-motion";
import type { CqrsAction } from "./cqrs";

const W = 480;
const H = 200;
const CLIENT = { x: 80, y: 100 };
const UNIFIED = { x: 350, y: 100 };
const WRITER = { x: 350, y: 50 };
const READER = { x: 350, y: 150 };
const BOX_W = 140;
const BOX_H = 46;

export function CqrsDiagram({
  cqrsEnabled,
  flash,
}: {
  cqrsEnabled: boolean;
  flash: { action: CqrsAction; key: string } | null;
}) {
  const targets = cqrsEnabled ? { write: WRITER, read: READER } : { write: UNIFIED, read: UNIFIED };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-md" role="img" aria-label="CQRS: разделение чтения и записи">
        {cqrsEnabled ? (
          <>
            <line x1={CLIENT.x} y1={CLIENT.y} x2={WRITER.x} y2={WRITER.y} stroke="rgb(51 65 85)" strokeWidth={2} />
            <line x1={CLIENT.x} y1={CLIENT.y} x2={READER.x} y2={READER.y} stroke="rgb(51 65 85)" strokeWidth={2} />
          </>
        ) : (
          <line x1={CLIENT.x} y1={CLIENT.y} x2={UNIFIED.x} y2={UNIFIED.y} stroke="rgb(51 65 85)" strokeWidth={2} />
        )}

        {flash && (
          <motion.circle
            key={flash.key}
            r={7}
            fill={flash.action === "write" ? "rgb(99 102 241)" : "rgb(56 189 248)"}
            initial={{ cx: CLIENT.x, cy: CLIENT.y, opacity: 0 }}
            animate={{
              cx: [CLIENT.x, targets[flash.action].x],
              cy: [CLIENT.y, targets[flash.action].y],
              opacity: [0, 1, 1, 0],
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        )}

        <Node pos={CLIENT} label="Client" />
        {cqrsEnabled ? (
          <>
            <Node pos={WRITER} label="Tickets Writer" tone={flash?.action === "write" ? "indigo" : "slate"} />
            <Node pos={READER} label="Tickets Reader" tone={flash?.action === "read" ? "sky" : "slate"} />
          </>
        ) : (
          <Node
            pos={UNIFIED}
            label="Tickets"
            tone={flash?.action === "write" ? "indigo" : flash?.action === "read" ? "sky" : "slate"}
          />
        )}
      </svg>
    </div>
  );
}

function Node({
  pos,
  label,
  tone = "slate",
}: {
  pos: { x: number; y: number };
  label: string;
  tone?: "slate" | "indigo" | "sky";
}) {
  const fill = tone === "indigo" ? "rgb(49 46 129)" : tone === "sky" ? "rgb(12 74 110)" : "rgb(30 41 59)";
  const stroke = tone === "indigo" ? "rgb(129 140 248)" : tone === "sky" ? "rgb(56 189 248)" : "rgb(71 85 105)";
  return (
    <g>
      <motion.rect
        x={pos.x - BOX_W / 2}
        y={pos.y - BOX_H / 2}
        width={BOX_W}
        height={BOX_H}
        rx={10}
        fill={fill}
        stroke={stroke}
        strokeWidth={tone === "slate" ? 1.5 : 2.5}
        animate={tone !== "slate" ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
        transition={{ duration: 0.4 }}
      />
      <text x={pos.x} y={pos.y + 5} textAnchor="middle" fill="white" fontSize={13} fontWeight={600}>
        {label}
      </text>
    </g>
  );
}
