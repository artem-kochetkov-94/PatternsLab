import { motion } from "framer-motion";
import { RING_KEYS, RING_SHARDS } from "./sharding";

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = 120;

const SHARD_COLORS: Record<string, { fill: string; stroke: string }> = {
  s1: { fill: "rgb(49 46 129)", stroke: "rgb(129 140 248)" }, // indigo
  s2: { fill: "rgb(6 78 59)", stroke: "rgb(52 211 153)" }, // emerald
  s3: { fill: "rgb(69 26 3)", stroke: "rgb(245 158 11)" }, // amber
  s4: { fill: "rgb(12 74 110)", stroke: "rgb(56 189 248)" }, // sky
};

function pointOnRing(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
}

export function ShardRing({
  activeShardIds,
  assignment,
  movedKeys,
  onToggleShard,
}: {
  activeShardIds: ReadonlySet<string>;
  assignment: Record<string, string>;
  movedKeys: ReadonlySet<string>;
  onToggleShard: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto h-auto w-full max-w-xs" role="img" aria-label="Кольцо consistent hashing">
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="rgb(51 65 85)" strokeWidth={2} />

        {RING_KEYS.map((key) => {
          const pos = pointOnRing(key.angle, RADIUS);
          const shardId = assignment[key.id];
          const color = SHARD_COLORS[shardId] ?? { fill: "rgb(30 41 59)", stroke: "rgb(100 116 139)" };
          const moved = movedKeys.has(key.id);
          return (
            <motion.circle
              key={`${key.id}-${shardId}`}
              cx={pos.x}
              cy={pos.y}
              r={moved ? 8 : 6}
              fill={color.fill}
              stroke={moved ? "rgb(244 63 94)" : color.stroke}
              strokeWidth={moved ? 3 : 2}
              animate={moved ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
              transition={{ duration: 0.5 }}
            />
          );
        })}

        {RING_SHARDS.map((shard) => {
          const pos = pointOnRing(shard.angle, RADIUS);
          const active = activeShardIds.has(shard.id);
          const color = SHARD_COLORS[shard.id];
          const labelPos = pointOnRing(shard.angle, RADIUS + 34);
          return (
            <g key={shard.id} className="cursor-pointer" onClick={() => onToggleShard(shard.id)}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={12}
                fill={active ? color.fill : "rgb(15 23 42)"}
                stroke={active ? color.stroke : "rgb(71 85 105)"}
                strokeWidth={active ? 3 : 2}
                strokeDasharray={active ? undefined : "3 3"}
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                fill={active ? "white" : "rgb(100 116 139)"}
                fontSize={11}
                fontWeight={600}
              >
                {shard.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-xs text-slate-500">
        Клик по узлу шарда — включить/выключить его в кольце.
      </p>
    </div>
  );
}
