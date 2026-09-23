import { motion } from "framer-motion";
import type { InstanceState, ReleaseStep } from "./strategies";

const W = 640;
const H = 220;
const ROUTER = { x: 320, y: 50 };
const BOX_W = 110;
const BOX_H = 48;
const ROW_Y = 170;

function slotX(index: number, total: number) {
  const spacing = 150;
  const start = 320 - ((total - 1) * spacing) / 2;
  return start + index * spacing;
}

const ROLE_FILL: Record<string, string> = {
  old: "rgb(30 41 59)",
  new: "rgb(49 22 89)",
};
const ROLE_STROKE: Record<string, string> = {
  old: "rgb(100 116 139)",
  new: "rgb(168 85 247)",
};

export function ReleaseDiagram({ step }: { step: ReleaseStep }) {
  const visible = step.instances.filter((i) => i.traffic !== "hidden");

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Схема раскатки новой версии">
        {visible.map((inst, i) => {
          const x = slotX(i, visible.length);
          const live = inst.traffic === "live";
          if (!live) return null;
          const label = step.trafficLabels?.[inst.role];
          return (
            <g key={`edge-${inst.id}`}>
              <line
                x1={ROUTER.x}
                y1={ROUTER.y + 20}
                x2={x}
                y2={ROW_Y - BOX_H / 2}
                stroke={ROLE_STROKE[inst.role]}
                strokeWidth={2}
              />
              {label && (
                <text
                  x={(ROUTER.x + x) / 2}
                  y={(ROUTER.y + 20 + ROW_Y - BOX_H / 2) / 2 - 6}
                  textAnchor="middle"
                  fill={ROLE_STROKE[inst.role]}
                  fontSize={12}
                  fontWeight={600}
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}

        <g>
          <rect
            x={ROUTER.x - 60}
            y={ROUTER.y - 20}
            width={120}
            height={40}
            rx={10}
            fill="rgb(30 41 59)"
            stroke="rgb(129 140 248)"
            strokeWidth={2}
          />
          <text x={ROUTER.x} y={ROUTER.y + 5} textAnchor="middle" fill="white" fontSize={14} fontWeight={600}>
            Router
          </text>
        </g>

        {visible.map((inst, i) => {
          const x = slotX(i, visible.length);
          return (
            <InstanceBox
              key={inst.id}
              x={x}
              inst={inst}
            />
          );
        })}
      </svg>
    </div>
  );
}

function InstanceBox({ x, inst }: { x: number; inst: InstanceState }) {
  const live = inst.traffic === "live";
  const rect = { x: x - BOX_W / 2, y: ROW_Y - BOX_H / 2 };
  return (
    <g>
      <motion.rect
        key={`${inst.id}-${inst.role}-${inst.traffic}`}
        x={rect.x}
        y={rect.y}
        width={BOX_W}
        height={BOX_H}
        rx={10}
        fill={ROLE_FILL[inst.role]}
        stroke={ROLE_STROKE[inst.role]}
        strokeWidth={live ? 2.5 : 1.5}
        strokeDasharray={live ? undefined : "4 4"}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: live ? 1 : 0.55, scale: 1 }}
        transition={{ duration: 0.35 }}
      />
      <text
        x={x}
        y={ROW_Y - 2}
        textAnchor="middle"
        fill="white"
        fontSize={13}
        fontWeight={600}
      >
        {inst.role === "old" ? "Old" : "New"}
      </text>
      <text
        x={x}
        y={ROW_Y + 14}
        textAnchor="middle"
        fill={live ? "rgb(203 213 225)" : "rgb(100 116 139)"}
        fontSize={10}
      >
        {live ? "получает трафик" : "простаивает"}
      </text>
    </g>
  );
}
