import { motion } from "framer-motion";
import type { BinarySearchStep } from "./binarySearch";

const CELL =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-md border text-sm font-semibold";

/**
 * Чистая отрисовка ОДНОГО кадра. Клетки вне диапазона показаны «отброшенными»,
 * середина подсвечена, маркеры L / M / H плавно перемещаются (Framer Motion).
 *
 * Для режимов границ (lower/upper) диапазон полуоткрытый [low, high), а ответ
 * может оказаться за концом массива — поэтому рисуем фантомный слот «n».
 */
export function BinarySearchVisualizer({
  nums,
  target,
  step,
}: {
  nums: number[];
  target: number;
  step: BinarySearchStep;
}) {
  const n = nums.length;
  const halfOpen = step.mode !== "exact";
  // Для границ показываем дополнительный слот в самом конце — позицию n.
  const positions = halfOpen ? n + 1 : n;

  const isEliminated = (i: number) =>
    halfOpen ? i < step.low || i >= step.high : i < step.low || i > step.high;

  // Маркеры L/H рисуем, пока поиск не закончен; на финале границы — маркер ans.
  const showLH = !step.done;

  return (
    <div className="space-y-6">
      {/* Цель и итог. */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-500">target =</span>
        <span className="rounded-md border border-indigo-500 bg-indigo-500/15 px-3 py-1 font-mono font-bold text-white">
          {target}
        </span>
        {step.found !== null && (
          <span className="ml-2 rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
            найден на индексе {step.found}
          </span>
        )}
        {step.mode === "exact" && step.done && step.found === null && (
          <span className="ml-2 rounded bg-rose-600 px-2 py-1 text-xs font-semibold text-white">
            не найден
          </span>
        )}
        {step.answer !== null && (
          <span className="ml-2 rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
            граница = {step.answer}
            {step.answer === n ? " (за концом)" : ""}
          </span>
        )}
      </div>

      {/* Массив (+ фантомный слот для границ). */}
      <div className="overflow-x-auto">
        <div className="flex gap-2">
          {Array.from({ length: positions }, (_, i) => {
            const isPhantom = i === n; // только в halfOpen
            const value = isPhantom ? null : nums[i];

            const isMid = i === step.mid;
            const isFound = i === step.found;
            const isAnswer = step.answer !== null && i === step.answer;

            let tone = "border-slate-700 bg-slate-800 text-slate-200";
            if (isPhantom)
              tone = isAnswer
                ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                : "border-dashed border-slate-800 bg-slate-900/40 text-slate-600";
            else if (isFound || isAnswer)
              tone = "border-emerald-400 bg-emerald-500/25 text-white";
            else if (isMid)
              tone =
                step.highlight === "eq"
                  ? "border-emerald-400 bg-emerald-500/25 text-white"
                  : "border-amber-400 bg-amber-500/25 text-white";
            else if (isEliminated(i))
              tone = "border-slate-800 bg-slate-900 text-slate-600";

            return (
              <div key={i} className="flex flex-col items-center">
                <motion.div
                  className={[CELL, tone].join(" ")}
                  animate={
                    isMid || isFound || isAnswer
                      ? { scale: [1, 1.15, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.3 }}
                >
                  {isPhantom ? "∅" : value}
                </motion.div>
                <span className="mt-1 text-[10px] text-slate-600">
                  {isPhantom ? "n" : i}
                </span>

                {/* Дорожка маркеров под ячейкой. */}
                <div className="mt-1 flex h-5 items-center gap-1">
                  {showLH && i === step.low && (
                    <motion.span
                      layoutId="bs-low"
                      className="rounded bg-sky-500 px-1.5 text-[10px] font-bold text-white"
                    >
                      L
                    </motion.span>
                  )}
                  {i === step.mid && (
                    <motion.span
                      layoutId="bs-mid"
                      className="rounded bg-amber-500 px-1.5 text-[10px] font-bold text-white"
                    >
                      M
                    </motion.span>
                  )}
                  {showLH && i === step.high && (
                    <motion.span
                      layoutId="bs-high"
                      className="rounded bg-rose-500 px-1.5 text-[10px] font-bold text-white"
                    >
                      H
                    </motion.span>
                  )}
                  {isAnswer && step.done && (
                    <motion.span
                      layoutId="bs-ans"
                      className="rounded bg-emerald-500 px-1.5 text-[10px] font-bold text-white"
                    >
                      ans
                    </motion.span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
