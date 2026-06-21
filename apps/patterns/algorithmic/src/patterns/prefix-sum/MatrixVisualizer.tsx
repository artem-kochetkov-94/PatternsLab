import { motion } from "framer-motion";
import type { Cell, PrefixStep, Rect } from "./prefixSum";

const CELL =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-md border text-[11px] font-semibold tabular-nums";

const eqCell = (a: Cell, r: number, c: number) => a.row === r && a.col === c;
const inRect = (rect: Rect | null, r: number, c: number) =>
  !!rect && r >= rect.r1 && r <= rect.r2 && c >= rect.c1 && c <= rect.c2;

/**
 * Чистая отрисовка ОДНОГО кадра. Слева — исходная матрица, справа — таблица
 * префиксов P. На фазе build подсвечиваются текущая клетка P и её слагаемые;
 * на фазе query — запрашиваемый прямоугольник и активный член формулы.
 * Матрица кликабельна (когда передан `onCellClick`) — так выбирают прямоугольник.
 */
export function MatrixVisualizer({
  matrix,
  step,
  selection,
  pending,
  onCellClick,
}: {
  matrix: number[][];
  step: PrefixStep;
  selection: Rect | null;
  pending: Cell | null;
  onCellClick?: (row: number, col: number) => void;
}) {
  const activeTerm =
    step.phase === "query" && step.terms && step.activeTerm >= 0
      ? step.terms[step.activeTerm]
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-8">
        {/* Матрица. */}
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
            матрица{onCellClick ? " · кликни две клетки = углы" : ""}
          </p>
          <div className="inline-flex flex-col gap-1">
            {matrix.map((row, r) => (
              <div key={r} className="flex gap-1">
                {row.map((value, c) => {
                  const isSource =
                    step.contributors && eqCell(step.contributors.source, r, c);
                  const inQuery = inRect(step.rect, r, c);
                  const inTerm = inRect(activeTerm?.covers ?? null, r, c);
                  const isPending = pending?.row === r && pending?.col === c;
                  const inSelection = inRect(selection, r, c);

                  let tone =
                    "border-slate-700 bg-slate-800 text-slate-200";
                  if (isSource)
                    tone = "border-emerald-400 bg-emerald-500/25 text-white";
                  else if (inTerm)
                    tone =
                      activeTerm!.sign === 1
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-100"
                        : "border-rose-500 bg-rose-500/20 text-rose-100";
                  else if (inQuery || inSelection)
                    tone = "border-indigo-500 bg-indigo-500/15 text-white";

                  return (
                    <motion.button
                      key={c}
                      type="button"
                      disabled={!onCellClick}
                      onClick={() => onCellClick?.(r, c)}
                      className={[
                        CELL,
                        tone,
                        isPending ? "ring-2 ring-amber-400" : "",
                        onCellClick ? "cursor-pointer hover:brightness-125" : "",
                      ].join(" ")}
                      animate={isSource ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {value}
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Таблица префиксов P. */}
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
            префиксы P (на 1 больше по каждой стороне)
          </p>
          <div className="inline-flex flex-col gap-1">
            {step.prefix.map((row, i) => (
              <div key={i} className="flex gap-1">
                {row.map((value, j) => {
                  const isBuild =
                    step.buildCell && eqCell(step.buildCell, i, j);
                  const ct = step.contributors;
                  const isTop = ct && eqCell(ct.top, i, j);
                  const isLeft = ct && eqCell(ct.left, i, j);
                  const isDiag = ct && eqCell(ct.diag, i, j);
                  const padding = i === 0 || j === 0;

                  // Член запроса, чья клетка P здесь.
                  const term = step.terms?.find((t) =>
                    eqCell(t.prefixCell, i, j),
                  );
                  const isActiveTermCell =
                    activeTerm && eqCell(activeTerm.prefixCell, i, j);

                  let tone = padding
                    ? "border-slate-800 bg-slate-900 text-slate-600"
                    : value === null
                      ? "border-dashed border-slate-700 bg-slate-900 text-slate-700"
                      : "border-slate-700 bg-slate-800 text-slate-300";
                  if (isBuild)
                    tone = "border-amber-400 bg-amber-500/25 text-white";
                  else if (isDiag)
                    tone = "border-rose-500 bg-rose-500/20 text-rose-100";
                  else if (isTop || isLeft)
                    tone = "border-sky-500 bg-sky-500/20 text-sky-100";
                  else if (isActiveTermCell)
                    tone =
                      activeTerm!.sign === 1
                        ? "border-emerald-400 bg-emerald-500/25 text-white"
                        : "border-rose-400 bg-rose-500/25 text-white";
                  else if (term)
                    tone = "border-indigo-600 bg-indigo-900/40 text-indigo-200";

                  return (
                    <motion.div
                      key={j}
                      className={[CELL, tone].join(" ")}
                      animate={isBuild ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {value === null ? "·" : value}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Формула запроса с накоплением (только на фазе query). */}
      {step.phase === "query" && step.terms && (
        <div className="rounded-md bg-slate-800/60 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
            {step.terms.map((t, k) => (
              <span
                key={k}
                className={[
                  "rounded px-2 py-1",
                  k === step.activeTerm
                    ? t.sign === 1
                      ? "bg-emerald-600 text-white"
                      : "bg-rose-600 text-white"
                    : k < step.activeTerm
                      ? "bg-slate-700 text-slate-300"
                      : "bg-slate-900 text-slate-500",
                ].join(" ")}
              >
                {t.sign === 1 ? "+" : "−"}
                {t.value}
              </span>
            ))}
            <span className="ml-2 text-slate-400">=</span>
            <span className="rounded bg-indigo-600 px-2 py-1 font-bold text-white">
              {step.runningSum}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
