import { AnimatePresence, motion } from "framer-motion";
import type { IsolationStep } from "./isolation";

/**
 * Раньше тут была SVG-схема "T1 — БД — T2" с бегающим кружком, которая
 * подсвечивала КТО сходил в базу, но нигде не показывала КАКОЕ значение он
 * увидел, — а вся суть аномалий изоляции именно в разнице значений. Поэтому
 * вместо схемы потока — прямое сравнение состояний: полоса "реальное
 * состояние БД" сверху и две колонки T1/T2 с растущей историей того, что
 * каждая транзакция успела прочитать/узнать. Расхождение видно напрямую,
 * без необходимости расшифровывать цвет узла.
 */

interface HistoryEntry {
  stepId: number;
  value: string;
  reveal: boolean;
  anomaly: boolean;
  isCurrent: boolean;
}

function buildHistory(
  steps: IsolationStep[],
  upToIndex: number,
  pick: (step: IsolationStep) => string | null,
): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  for (let i = 0; i <= upToIndex; i++) {
    const step = steps[i];
    const value = pick(step);
    if (value !== null) {
      entries.push({
        stepId: step.id,
        value,
        reveal: step.reveal,
        anomaly: step.anomaly,
        isCurrent: i === upToIndex,
      });
    }
  }
  return entries;
}

export function IsolationDiagram({
  steps,
  stepIndex,
}: {
  steps: IsolationStep[];
  stepIndex: number;
}) {
  const step = steps[stepIndex];
  const t1History = buildHistory(steps, stepIndex, (s) => s.t1View);
  const t2History = buildHistory(steps, stepIndex, (s) => s.t2View);
  const dbHistory = buildHistory(steps, stepIndex, (s) => s.dbState);
  const dbCurrent = dbHistory[dbHistory.length - 1];

  // На переломном шаге не у всех сценариев меняется dbState — но там, где
  // меняется (потерянное обновление: реальное значение в БД перезаписывается
  // прямо на этом шаге), сама БД и есть место аномалии, и полоса должна это
  // показывать тем же цветом, что и карточка транзакции.
  const dbIsReveal = step.reveal && dbCurrent?.stepId === step.id;

  return (
    <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      {/* Реальное состояние БД — общая истина, к которой должны сходиться обе транзакции. */}
      <div
        className={[
          "rounded-md border px-4 py-2 text-center transition-colors",
          dbIsReveal
            ? step.anomaly
              ? "border-rose-500 bg-rose-950/40"
              : "border-emerald-500 bg-emerald-950/40"
            : "border-slate-700 bg-slate-800/60",
        ].join(" ")}
      >
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          База данных (реальное состояние)
        </p>
        <motion.p
          key={dbCurrent?.stepId ?? "initial"}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={[
            "mt-1 font-mono text-sm",
            dbIsReveal
              ? step.anomaly
                ? "text-rose-300"
                : "text-emerald-300"
              : "text-slate-200",
          ].join(" ")}
        >
          {dbCurrent?.value ?? "…"}
        </motion.p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TransactionColumn title="T1" active={step.actor === "t1"} history={t1History} />
        <TransactionColumn title="T2" active={step.actor === "t2"} history={t2History} />
      </div>
    </div>
  );
}

function TransactionColumn({
  title,
  active,
  history,
}: {
  title: string;
  active: boolean;
  history: HistoryEntry[];
}) {
  return (
    <div
      className={[
        "rounded-md border p-3 transition-colors",
        active ? "border-indigo-500 bg-indigo-500/10" : "border-slate-700",
      ].join(" ")}
    >
      <p
        className={[
          "text-xs font-bold uppercase tracking-wider",
          active ? "text-indigo-300" : "text-slate-500",
        ].join(" ")}
      >
        {title}
        {active ? " ← сейчас" : ""}
      </p>
      <div className="mt-2 space-y-1.5">
        <AnimatePresence initial={false}>
          {history.length === 0 && (
            <p className="text-xs text-slate-600">ещё ничего не читал(а)</p>
          )}
          {history.map((entry) => (
            <motion.div
              key={entry.stepId}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: entry.isCurrent ? [1, 1.03, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
              className={[
                "rounded border px-2 py-1 font-mono text-xs",
                entry.reveal
                  ? entry.anomaly
                    ? "border-rose-500 bg-rose-950/40 text-rose-300"
                    : "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                  : "border-slate-700 bg-slate-800/60 text-slate-300",
              ].join(" ")}
            >
              {entry.value}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
