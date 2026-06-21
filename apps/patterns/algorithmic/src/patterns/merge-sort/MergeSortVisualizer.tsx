import { motion } from "framer-motion";
import type { MergeSortStep } from "./mergeSort";

const CELL =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-md border text-sm font-semibold";

/**
 * Чистая отрисовка ОДНОГО кадра. Сверху — весь массив с подсвеченным активным
 * отрезком [lo, hi). Во время слияния снизу появляется «стол слияния»: левая и
 * правая половины с указателями i / j и строка результата, которая наполняется
 * (новые ячейки плавно въезжают через Framer Motion).
 */
export function MergeSortVisualizer({ step }: { step: MergeSortStep }) {
  const { array, lo, hi, phase } = step;
  const merging = step.left !== null && step.right !== null;
  const active = (idx: number) => idx >= lo && idx < hi;

  return (
    <div className="space-y-6">
      {/* Весь массив. */}
      <div className="overflow-x-auto">
        <div className="flex gap-2">
          {array.map((value, idx) => {
            let tone = "border-slate-700 bg-slate-800 text-slate-200";
            if (phase === "done")
              tone = "border-emerald-400 bg-emerald-500/25 text-white";
            else if (phase === "merged" && active(idx))
              tone = "border-emerald-400 bg-emerald-500/20 text-emerald-100";
            else if (active(idx))
              tone = "border-indigo-500 bg-indigo-500/15 text-white";
            else tone = "border-slate-800 bg-slate-900 text-slate-500";

            return (
              <div key={idx} className="flex flex-col items-center">
                <motion.div
                  layout
                  className={[CELL, tone].join(" ")}
                  animate={
                    (phase === "merged" && active(idx)) || phase === "done"
                      ? { scale: [1, 1.12, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.3 }}
                >
                  {value}
                </motion.div>
                <span className="mt-1 text-[10px] text-slate-600">{idx}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Стол слияния — только во время merge. */}
      {merging && (
        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <Row
            label="левая"
            values={step.left!}
            pointer={step.i}
            picked={step.picked === "left" ? step.i : null}
            accent="sky"
          />
          <Row
            label="правая"
            values={step.right!}
            pointer={step.j}
            picked={step.picked === "right" ? step.j : null}
            accent="rose"
          />
          <div className="h-px bg-slate-800" />
          <ResultRow values={step.result ?? []} justAdded={step.phase === "copy"} />
        </div>
      )}
    </div>
  );
}

const ACCENT = {
  sky: { ptr: "bg-sky-500", cell: "border-sky-400 bg-sky-500/20 text-white" },
  rose: { ptr: "bg-rose-500", cell: "border-rose-400 bg-rose-500/20 text-white" },
} as const;

/** Строка одной из половин: указатель показывает текущую «голову». */
function Row({
  label,
  values,
  pointer,
  picked,
  accent,
}: {
  label: string;
  values: number[];
  pointer: number | null;
  picked: number | null;
  accent: keyof typeof ACCENT;
}) {
  const a = ACCENT[accent];
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-right text-xs text-slate-500">
        {label}
      </span>
      <div className="flex gap-2">
        {values.map((value, idx) => {
          const isHead = idx === pointer;
          const consumed = pointer !== null && idx < pointer;
          let tone = "border-slate-700 bg-slate-800 text-slate-300";
          if (idx === picked) tone = a.cell;
          else if (isHead) tone = a.cell;
          else if (consumed) tone = "border-slate-800 bg-slate-900 text-slate-600";
          return (
            <div key={idx} className="flex flex-col items-center">
              <div className={[CELL, "h-10 w-10 text-xs", tone].join(" ")}>
                {value}
              </div>
              <div className="mt-1 h-4">
                {isHead && (
                  <span
                    className={[
                      "rounded px-1.5 text-[10px] font-bold text-white",
                      a.ptr,
                    ].join(" ")}
                  >
                    {accent === "sky" ? "i" : "j"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Строка результата слияния — наполняется слева направо. */
function ResultRow({
  values,
  justAdded,
}: {
  values: number[];
  justAdded: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-right text-xs text-slate-500">
        результат
      </span>
      <div className="flex min-h-[2.5rem] gap-2">
        {values.length === 0 && (
          <span className="self-center text-xs text-slate-600">пусто</span>
        )}
        {values.map((value, idx) => {
          const isLast = idx === values.length - 1;
          return (
            <motion.div
              key={idx}
              layout
              initial={isLast && justAdded ? { scale: 0.4, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className={[
                CELL,
                "h-10 w-10 text-xs",
                "border-emerald-500 bg-emerald-500/20 text-emerald-100",
              ].join(" ")}
            >
              {value}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
