import { AnimatePresence, motion } from "framer-motion";
import {
  CACHE_CAPACITY,
  type CacheLeg,
  type CacheNodeId,
  type CacheStep,
} from "./strategies";

// Треугольная раскладка вместо линейной: у Service—Cache—DB теперь три
// РЕАЛЬНЫХ ребра (а не одно решётчатое + декоративная дуга-намёк). Cache-Aside
// и Cache-Through буквально ходят по разным сторонам треугольника — это и
// есть наглядная разница между стратегиями.
const W = 640;
const H = 260;

const POS: Record<CacheNodeId, { x: number; y: number }> = {
  service: { x: 110, y: 80 },
  cache: { x: 530, y: 80 },
  db: { x: 320, y: 220 },
};

const BOX_W = 130;
const BOX_H = 56;

/** Сколько секунд длится импульс на ОДНОМ перегоне — используется и плеером
 * (Demo.tsx), чтобы автопрокрутка не переключала шаг раньше, чем все импульсы
 * шага доиграют. */
export const PACKET_LEG_DURATION = 1.1;

function rectAt(center: { x: number; y: number }) {
  return { x: center.x - BOX_W / 2, y: center.y - BOX_H / 2 };
}

/**
 * Каждый перегон — свой независимый импульс, стартующий заново в точке
 * "from". Раньше все перегоны шага соединялись в одно движение, и для
 * несмежных перегонов (service→cache, затем ОПЯТЬ service→db) кружок
 * визуально прыгал через холст. Отдельные импульсы с задержкой друг за
 * другом полностью убирают прыжки — независимо от того, смежные перегоны
 * или нет.
 *
 * Внутри READ-перегона — не один бросок, а полный цикл запрос/ответ: первая
 * половина времени запрос летит к цели (индиго), вторая половина — ответ С
 * ДАННЫМИ летит обратно (голубой) — уместно, когда адресат УЖЕ знает ответ
 * (например, у БД он есть всегда).
 *
 * WRITE и REQUEST едут только вперёд одним импульсом (индиго) — отвечать
 * пока нечем: при записи в принципе нет ответа, а при REQUEST адресат сам
 * ещё не знает результат (кэш при промахе сначала должен сходить в БД).
 *
 * RESPONSE — тоже один импульс, но голубой и в обратную сторону: это
 * доставка результата, добытого ЧЕРЕЗ ДРУГОЙ перегон раньше (кэш относит
 * сервису то, что только что получил из БД). Без него получилось бы, что
 * кэш сходил в БД — и данные никуда не делись.
 */
function LegPulses({ legs, eventKey }: { legs: CacheLeg[]; eventKey: string }) {
  const half = PACKET_LEG_DURATION / 2;
  return (
    <>
      {legs.map((leg, i) => {
        const a = POS[leg.from];
        const b = POS[leg.to];
        const legStart = i * PACKET_LEG_DURATION;

        if (leg.kind === "read") {
          return (
            <g key={`${eventKey}-leg-${i}`}>
              {/* Запрос: from → to. */}
              <motion.circle
                r={7}
                fill="rgb(99 102 241)"
                initial={{ cx: a.x, cy: a.y, opacity: 0 }}
                animate={{ cx: [a.x, b.x], cy: [a.y, b.y], opacity: [0, 1, 1, 0] }}
                transition={{ duration: half, delay: legStart, ease: "easeInOut" }}
              />
              {/* Ответ с данными: to → from. */}
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

        // write / request — индиго, одним impульсом вперёд.
        // response — голубой (как "ответ" у read), тоже одним импульсом, но
        // это отдельный самостоятельный перегон, а не вторая половина read.
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

export function CacheDiagram({ step }: { step: CacheStep }) {
  const touched = new Set(step.legs.flatMap((leg) => [leg.from, leg.to]));
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
        {/* Три реальных ребра треугольника — все одинаковым сплошным стилем. */}
        <line
          x1={POS.service.x}
          y1={POS.service.y}
          x2={POS.cache.x}
          y2={POS.cache.y}
          stroke="rgb(51 65 85)"
          strokeWidth={2}
        />
        <line
          x1={POS.cache.x}
          y1={POS.cache.y}
          x2={POS.db.x}
          y2={POS.db.y}
          stroke="rgb(51 65 85)"
          strokeWidth={2}
        />
        <line
          x1={POS.service.x}
          y1={POS.service.y}
          x2={POS.db.x}
          y2={POS.db.y}
          stroke="rgb(51 65 85)"
          strokeWidth={2}
        />

        <LegPulses legs={step.legs} eventKey={eventKey} />

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
