import { motion } from "framer-motion";
import type { TempStep } from "./dailyTemperaturesTrace";

const CELL =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-md border text-sm font-semibold";

/**
 * Чистая отрисовка ОДНОГО кадра. Сверху — ряд температур: курсор подсвечен
 * (янтарный), дни на стеке обведены голубым, только что закрытый день вспыхивает
 * зелёным. Под каждым днём — его ответ (· пока не посчитан). Снизу — сам
 * монотонный стек индексов.
 */
export function TemperaturesVisualizer({
  temps,
  step,
}: {
  temps: number[];
  step: TempStep;
}) {
  const onStack = new Set(step.stack);

  return (
    <div className="space-y-6">
      {/* Ряд температур + ответ под каждым днём. */}
      <div className="overflow-x-auto">
        <div className="flex gap-2">
          {temps.map((t, i) => {
            const isCur = i === step.pos;
            const isStack = onStack.has(i);
            const isResolved = i === step.resolved;

            let tone = "border-slate-700 bg-slate-800 text-slate-200";
            if (isResolved)
              tone = "border-emerald-400 bg-emerald-500/25 text-white";
            else if (isCur) tone = "border-amber-400 bg-amber-500/25 text-white";
            else if (isStack) tone = "border-sky-500 bg-sky-500/15 text-sky-200";

            const ans = step.answer[i];

            return (
              <div key={i} className="flex flex-col items-center">
                <motion.div
                  className={[CELL, tone].join(" ")}
                  animate={
                    isCur || isResolved ? { scale: [1, 1.15, 1] } : { scale: 1 }
                  }
                  transition={{ duration: 0.3 }}
                >
                  {t}°
                </motion.div>
                <span className="mt-1 text-[10px] text-slate-600">{i}</span>
                <div className="mt-1 flex h-6 items-center">
                  <span
                    className={[
                      "rounded px-1.5 font-mono text-[11px] font-bold",
                      ans === null
                        ? "text-slate-600"
                        : ans === 0
                          ? "bg-slate-700 text-slate-300"
                          : "bg-emerald-600 text-white",
                    ].join(" ")}
                  >
                    {ans === null ? "·" : ans}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-1 text-[10px] text-slate-600">
          снизу — ответ: через сколько дней станет теплее (· ещё не посчитан)
        </p>
      </div>

      {/* Монотонный стек индексов. */}
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
          Монотонный стек — индексы дней, ждущих потепления
        </p>
        <div className="flex min-h-[3.5rem] items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 p-3">
          {step.stack.length === 0 ? (
            <span className="text-sm text-slate-600">пусто</span>
          ) : (
            step.stack.map((idx, k) => (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center"
              >
                <div className="flex h-10 items-center gap-1 rounded-md border border-sky-500 bg-sky-500/15 px-2 font-mono text-xs font-bold text-sky-200">
                  <span className="text-sky-400">#{idx}</span>
                  <span>{temps[idx]}°</span>
                </div>
                {k === step.stack.length - 1 && (
                  <span className="mt-1 text-[10px] text-sky-400">вершина</span>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
