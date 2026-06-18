import { motion } from "framer-motion";
import type { TwoPointersStep } from "./twoPointers";

// Общий стиль ячейки массива (вход и результат).
const CELL =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-md border text-sm font-semibold";

/**
 * Чистая отрисовка ОДНОГО кадра алгоритма. Никакой логики — только текущий
 * шаг (`step`) превращается в картинку. Framer Motion плавно перемещает
 * маркеры L/R между ячейками (через общий `layoutId`) и «подсвечивает»
 * только что записанную клетку результата.
 */
export function ArrayVisualizer({
  nums,
  step,
}: {
  nums: number[];
  step: TwoPointersStep;
}) {
  // Какую ячейку результата заполнили на этом шаге (writeIndex уже сдвинут).
  const placedIndex = step.picked ? step.writeIndex + 1 : -1;

  return (
    <div className="space-y-8 overflow-x-auto">
      {/* Входной массив. */}
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
          nums (отсортирован по возрастанию)
        </p>
        <div className="flex gap-2">
          {nums.map((value, i) => {
            const consumed = i < step.left || i > step.right;
            const isLeft = i === step.left && !step.done;
            const isRight = i === step.right && !step.done;
            const isActive = isLeft || isRight;

            return (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={[
                    CELL,
                    consumed
                      ? "border-slate-800 bg-slate-900 text-slate-600"
                      : isActive
                        ? "border-indigo-500 bg-indigo-500/15 text-white"
                        : "border-slate-700 bg-slate-800 text-slate-200",
                  ].join(" ")}
                >
                  {value}
                </div>
                <span className="mt-1 text-[10px] text-slate-600">{i}</span>

                {/* Дорожка для маркеров под ячейкой. */}
                <div className="mt-1 flex h-5 items-center gap-1">
                  {isLeft && (
                    <motion.span
                      layoutId="ptr-left"
                      className="rounded bg-sky-500 px-1.5 text-[10px] font-bold text-white"
                    >
                      L
                    </motion.span>
                  )}
                  {isRight && (
                    <motion.span
                      layoutId="ptr-right"
                      className="rounded bg-rose-500 px-1.5 text-[10px] font-bold text-white"
                    >
                      R
                    </motion.span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Массив результата. */}
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
          результат (квадраты по возрастанию)
        </p>
        <div className="flex gap-2">
          {step.result.map((value, i) => {
            const filled = value !== null;
            const justPlaced = i === placedIndex;

            return (
              <div key={i} className="flex flex-col items-center">
                <motion.div
                  className={[
                    CELL,
                    justPlaced
                      ? "border-emerald-400 bg-emerald-500/20 text-white"
                      : filled
                        ? "border-emerald-700 bg-emerald-900/30 text-emerald-200"
                        : "border-dashed border-slate-700 bg-slate-900 text-slate-700",
                  ].join(" ")}
                  animate={justPlaced ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                  transition={{ duration: 0.35 }}
                >
                  {filled ? value : "·"}
                </motion.div>
                <span className="mt-1 text-[10px] text-slate-600">{i}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
