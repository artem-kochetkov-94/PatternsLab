import { useEffect, useMemo, useState } from "react";
import {
  ANOMALIES,
  ISOLATION_LEVELS,
  buildIsolationScenario,
  isPrevented,
  type AnomalyId,
  type IsolationLevel,
} from "./isolation";
import { IsolationDiagram } from "./IsolationDiagram";

// Тут нет анимации "полёта пакета" — только смена значений, поэтому шаг
// плеера ждёт фиксированную паузу, а не считает время анимации отдельно.
const PLAY_INTERVAL = 2200;

export function Demo() {
  const [anomalyId, setAnomalyId] = useState<AnomalyId>("dirty-read");
  const [level, setLevel] = useState<IsolationLevel>("read-uncommitted");

  const anomaly = ANOMALIES.find((a) => a.id === anomalyId)!;
  const prevented = isPrevented(anomalyId, level);

  const steps = useMemo(
    () => buildIsolationScenario(anomalyId, level),
    [anomalyId, level],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const atEnd = stepIndex >= steps.length - 1;

  // Смена аномалии или уровня изоляции — начинаем сценарий заново.
  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
  }, [anomalyId, level]);

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStepIndex((i) => i + 1), PLAY_INTERVAL);
    return () => clearTimeout(timer);
  }, [playing, atEnd, stepIndex]);

  const step = steps[Math.min(stepIndex, steps.length - 1)];

  return (
    <div className="space-y-6">
      {/* Выбор аномалии. */}
      <div className="flex flex-wrap gap-2">
        {ANOMALIES.map((a) => (
          <button
            key={a.id}
            onClick={() => setAnomalyId(a.id)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              a.id === anomalyId
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
            ].join(" ")}
          >
            {a.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-400">{anomaly.hint}</p>

      {/* Выбор уровня изоляции. */}
      <div className="inline-flex flex-wrap rounded-lg border border-slate-700 p-1">
        {ISOLATION_LEVELS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLevel(l.id)}
            className={[
              "rounded-md px-3 py-1.5 text-xs font-mono font-medium transition-colors",
              l.id === level
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white",
            ].join(" ")}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div
        className={[
          "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium",
          prevented
            ? "bg-emerald-950/40 text-emerald-300"
            : "bg-rose-950/40 text-rose-300",
        ].join(" ")}
      >
        {prevented ? "🟢" : "🔴"}
        {prevented
          ? "На этом уровне изоляции аномалия предотвращена."
          : "На этом уровне изоляции аномалия происходит."}
      </div>

      <IsolationDiagram steps={steps} stepIndex={Math.min(stepIndex, steps.length - 1)} />

      <div className="space-y-1.5">
        <p className="font-mono text-xs text-slate-500">
          {step.actor === "t1" ? "T1 → " : step.actor === "t2" ? "T2 → " : ""}
          {step.sql}
        </p>
        <p className="min-h-[2.5rem] rounded-md bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
          {step.description}
        </p>
      </div>

      {/* Плеер: сброс / назад / авто / вперёд + перемотка ползунком. */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            setStepIndex(0);
            setPlaying(false);
          }}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
        >
          ⏮ Сброс
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setStepIndex((i) => Math.max(0, i - 1));
          }}
          disabled={stepIndex === 0}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-40"
        >
          ◀ Назад
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={atEnd}
          className="rounded-md border border-indigo-500 bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40"
        >
          {playing ? "⏸ Пауза" : "▶ Авто"}
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setStepIndex((i) => Math.min(steps.length - 1, i + 1));
          }}
          disabled={atEnd}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-40"
        >
          Вперёд ▶
        </button>
        <span className="ml-auto font-mono text-xs text-slate-500">
          {stepIndex + 1} / {steps.length}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={steps.length - 1}
        value={stepIndex}
        onChange={(e) => {
          setPlaying(false);
          setStepIndex(Number(e.target.value));
        }}
        className="w-full accent-indigo-500"
      />
    </div>
  );
}
