import { motion } from "framer-motion";
import type { Interval } from "./intervals";
import { intervalLabel } from "./intervals";
import type { MergeStep } from "./merge";
import { sortByStart } from "./merge";

/**
 * Чистая отрисовка ОДНОГО кадра слияния. Сверху — входные отрезки,
 * отсортированные по началу (бегунок подсвечивает текущий), снизу на той же
 * временной шкале растут «острова». Framer Motion плавно тянет границы
 * последнего острова, когда он впитывает очередной отрезок.
 */
export function MergeVisualizer({
  intervals,
  step,
}: {
  intervals: Interval[];
  step: MergeStep;
}) {
  const sorted = sortByStart(intervals);

  // Общая временная ось для обеих лент.
  const minT = Math.min(...intervals.map((it) => it.start));
  const maxT = Math.max(...intervals.map((it) => it.end));
  const span = Math.max(1, maxT - minT);
  const pct = (t: number) => ((t - minT) / span) * 100;

  // id отрезков, уже впитанных в острова (для приглушения «обработанных»).
  const consumed = new Set(step.merged.flatMap((isl) => isl.sourceIds));
  const lastIslandIndex = step.merged.length - 1;

  return (
    <div className="space-y-6">
      {/* Вход: отрезки в порядке сортировки по началу. */}
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
          отрезки, отсортированные по началу
        </p>
        <div className="relative overflow-x-auto">
          <div className="relative min-w-[480px] space-y-2 py-1">
            {sorted.map((it) => {
              const isCurrent = it.id === step.intervalId;
              const isConsumed = consumed.has(it.id) && !isCurrent;

              return (
                <div key={it.id} className="relative h-9">
                  <div className="absolute inset-0 rounded bg-slate-900" />
                  <motion.div
                    className={[
                      "absolute top-0 flex h-9 items-center justify-center rounded border text-xs font-semibold",
                      isCurrent
                        ? "border-amber-400 bg-amber-500/25 text-white ring-2 ring-amber-400"
                        : isConsumed
                          ? "border-slate-800 bg-slate-800/40 text-slate-600"
                          : "border-slate-700 bg-slate-800 text-slate-300",
                    ].join(" ")}
                    style={{
                      left: `${pct(it.start)}%`,
                      width: `${pct(it.end) - pct(it.start)}%`,
                    }}
                    animate={isCurrent ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {intervalLabel(it.id)} [{it.start}, {it.end}]
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Результат: собранные острова. */}
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
          результат — слитые острова
        </p>
        <div className="relative overflow-x-auto">
          <div className="relative min-w-[480px] py-1">
            {/* Одна общая дорожка-ось. */}
            <div className="relative h-9">
              <div className="absolute inset-0 rounded bg-slate-900" />
              {step.merged.map((isl, idx) => {
                const isLast = idx === lastIslandIndex;
                return (
                  <motion.div
                    key={idx}
                    layout
                    className={[
                      "absolute top-0 flex h-9 items-center justify-center rounded border text-xs font-semibold",
                      isLast
                        ? "border-emerald-400 bg-emerald-500/25 text-white"
                        : "border-emerald-700 bg-emerald-900/40 text-emerald-200",
                    ].join(" ")}
                    style={{
                      left: `${pct(isl.start)}%`,
                      width: `${pct(isl.end) - pct(isl.start)}%`,
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 30 }}
                  >
                    [{isl.start}, {isl.end}]
                  </motion.div>
                );
              })}
            </div>

            {/* Подписи краёв оси. */}
            <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-600">
              <span>{minT}</span>
              <span>{maxT}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
