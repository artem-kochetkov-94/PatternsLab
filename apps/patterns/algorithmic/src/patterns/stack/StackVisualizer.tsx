import { motion } from "framer-motion";
import type { StackStep } from "./stack";

const CELL =
  "flex h-12 w-10 shrink-0 items-center justify-center rounded-md border text-base font-semibold";

/**
 * Чистая отрисовка ОДНОГО кадра разбора. Сверху — входная строка: курсор
 * подсвечен, открытые «(» на стеке обведены голубым, помеченные на удаление —
 * красные и зачёркнуты. Снизу — сам стек индексов, элементы которого плавно
 * появляются и исчезают (Framer Motion, `layout`).
 */
export function StackVisualizer({ s, step }: { s: string; step: StackStep }) {
  const onStack = new Set(step.stack);
  const removed = new Set(step.removed);

  return (
    <div className="space-y-6">
      {/* Входная строка. */}
      <div className="overflow-x-auto">
        <div className="flex gap-1.5">
          {Array.from(s).map((ch, i) => {
            const isCur = i === step.pos;
            const isOpen = onStack.has(i);
            const isRemoved = removed.has(i);

            let tone = "border-slate-700 bg-slate-800 text-slate-200";
            if (isRemoved)
              tone =
                "border-rose-500/60 bg-rose-950/40 text-rose-400 line-through";
            else if (isCur) tone = "border-amber-400 bg-amber-500/25 text-white";
            else if (isOpen) tone = "border-sky-500 bg-sky-500/15 text-sky-200";

            return (
              <div key={i} className="flex flex-col items-center">
                <motion.div
                  className={[CELL, tone].join(" ")}
                  animate={isCur ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {ch === " " ? "␣" : ch}
                </motion.div>
                <span className="mt-1 text-[10px] text-slate-600">{i}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Стек индексов открытых «(». */}
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
          Стек — индексы открытых «(» без пары
        </p>
        <div className="flex min-h-[3.25rem] items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 p-3">
          {step.stack.length === 0 ? (
            <span className="text-sm text-slate-600">пусто</span>
          ) : (
            step.stack.map((idx, k) => (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-sky-500 bg-sky-500/15 font-mono text-sm font-bold text-sky-200">
                  {idx}
                </div>
                {k === step.stack.length - 1 && (
                  <span className="mt-1 text-[10px] text-sky-400">вершина</span>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Результат на финале. */}
      {step.result !== null && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500">результат =</span>
          <span className="rounded-md border border-emerald-500 bg-emerald-500/15 px-3 py-1 font-mono font-bold text-white">
            {step.result === "" ? "«пусто»" : step.result}
          </span>
        </div>
      )}
    </div>
  );
}
