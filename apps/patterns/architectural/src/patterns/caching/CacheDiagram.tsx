import { AnimatePresence, motion } from "framer-motion";
import { CACHE_CAPACITY, type CacheNodeId, type CacheStep } from "./strategies";

// Как и в диаграмме балансировки — фиксированный "холст" вместо измерения
// реальных DOM-координат: у нас всегда ровно три узла (Service/Cache/DB).
const W = 640;
const H = 220;

const POS: Record<CacheNodeId, { x: number; y: number }> = {
  service: { x: 80, y: 130 },
  cache: { x: 320, y: 130 },
  db: { x: 560, y: 130 },
};

const BOX_W = 130;
const BOX_H = 56;

/** Сколько секунд пакет летит через ОДИН перегон — используется и плеером
 * (Demo.tsx), чтобы автопрокрутка не переключала шаг раньше, чем долетит
 * анимация. */
export const PACKET_LEG_DURATION = 1.6;

function rectAt(center: { x: number; y: number }) {
  return { x: center.x - BOX_W / 2, y: center.y - BOX_H / 2 };
}

/** Собирает keyframes для "пакета", последовательно проходящего все перегоны шага. */
function buildPacketKeyframes(legs: [CacheNodeId, CacheNodeId][]) {
  const cx: number[] = [];
  const cy: number[] = [];
  for (const [from, to] of legs) {
    cx.push(POS[from].x, POS[to].x);
    cy.push(POS[from].y, POS[to].y);
  }
  const opacity = cx.map((_, i) => (i === 0 || i === cx.length - 1 ? 0 : 1));
  return { cx, cy, opacity };
}

export function CacheDiagram({ step }: { step: CacheStep }) {
  const packet = buildPacketKeyframes(step.legs);
  const touched = new Set(step.legs.flat());
  const eventKey = `${step.id}-${step.op}`;
  const cacheFlash = step.hit ? "sky" : "amber";

  return (
    <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Схема прохождения запроса через кэш"
      >
        {/* Service — Cache. */}
        <line
          x1={POS.service.x + BOX_W / 2}
          y1={POS.service.y}
          x2={POS.cache.x - BOX_W / 2}
          y2={POS.cache.y}
          stroke="rgb(51 65 85)"
          strokeWidth={2}
        />
        {/* Cache — DB. */}
        <line
          x1={POS.cache.x + BOX_W / 2}
          y1={POS.cache.y}
          x2={POS.db.x - BOX_W / 2}
          y2={POS.db.y}
          stroke="rgb(51 65 85)"
          strokeWidth={2}
        />
        {/* Service — DB напрямую: используется только Cache-Aside, поэтому
            всегда рисуем её приглушённой пунктирной линией дугой сверху —
            видно, что путь ЕСТЬ, но ходят по нему не всегда. */}
        <path
          d={`M ${POS.service.x} ${POS.service.y - BOX_H / 2} Q ${W / 2} 10 ${POS.db.x} ${POS.db.y - BOX_H / 2}`}
          fill="none"
          stroke="rgb(51 65 85)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          opacity={0.6}
        />

        {/* Бегущий пакет — проходит все перегоны текущего шага подряд. */}
        <motion.circle
          key={`packet-${eventKey}`}
          r={7}
          fill="rgb(99 102 241)"
          initial={{ cx: packet.cx[0], cy: packet.cy[0], opacity: 0 }}
          animate={{ cx: packet.cx, cy: packet.cy, opacity: packet.opacity }}
          transition={{
            duration: PACKET_LEG_DURATION * step.legs.length,
            ease: "easeInOut",
          }}
        />

        <DiagramNode
          rect={rectAt(POS.service)}
          title="Service"
          tone={touched.has("service") ? "indigo" : "slate"}
          flashKey={touched.has("service") ? eventKey : "idle"}
        />
        <DiagramNode
          rect={rectAt(POS.cache)}
          title="Cache"
          tone={touched.has("cache") ? cacheFlash : "slate"}
          flashKey={touched.has("cache") ? eventKey : "idle"}
        />
        <DiagramNode
          rect={rectAt(POS.db)}
          title="DB"
          tone={touched.has("db") ? "rose" : "slate"}
          flashKey={touched.has("db") ? eventKey : "idle"}
        />
      </svg>

      {/* Содержимое кэша: слева — самый недавно использованный ключ. */}
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
          Кэш (MRU → LRU, вместимость {CACHE_CAPACITY})
        </p>
        <div className="flex min-h-[2.75rem] flex-wrap items-center gap-2">
          <AnimatePresence initial={false}>
            {step.cacheEntries.map((key) => (
              <motion.span
                key={key}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25 }}
                className={[
                  "rounded-md border px-2.5 py-1 font-mono text-xs",
                  key === step.key
                    ? "border-sky-500 bg-sky-500/15 text-sky-200"
                    : "border-slate-700 bg-slate-800 text-slate-300",
                ].join(" ")}
              >
                {key}
              </motion.span>
            ))}
          </AnimatePresence>
          {step.cacheEntries.length === 0 && (
            <span className="text-sm text-slate-600">пусто</span>
          )}
          {step.evictedKey && (
            <motion.span
              key={`evicted-${eventKey}`}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="rounded-md border border-rose-500/60 bg-rose-950/40 px-2.5 py-1 font-mono text-xs text-rose-400 line-through"
            >
              {step.evictedKey}
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}

const TONE_FILL: Record<string, string> = {
  slate: "rgb(30 41 59)",
  indigo: "rgb(49 46 129)",
  sky: "rgb(12 74 110)",
  amber: "rgb(120 53 15)",
  rose: "rgb(80 7 36)",
};
const TONE_STROKE: Record<string, string> = {
  slate: "rgb(71 85 105)",
  indigo: "rgb(129 140 248)",
  sky: "rgb(56 189 248)",
  amber: "rgb(251 191 36)",
  rose: "rgb(251 113 133)",
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
