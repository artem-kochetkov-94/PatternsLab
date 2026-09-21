import { useEffect, useMemo, useState } from "react";
import { DEFAULT_REQUESTS, simulateCircuitBreaker } from "./circuitBreaker";
import { CircuitBreakerDiagram, PACKET_LEG_DURATION } from "./CircuitBreakerDiagram";

// Пауза после того, как пакет долетел, — чтобы успеть прочитать описание.
const READ_PAUSE_MS = 1100;

const OUTCOME_LABEL: Record<string, string> = {
  success: "успех",
  failure: "отказ",
  "short-circuited": "быстрый отказ (backend не тронут)",
};

export function Demo() {
  const steps = useMemo(() => simulateCircuitBreaker(DEFAULT_REQUESTS), []);

  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const atEnd = stepIndex >= steps.length - 1;

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const legs = steps[stepIndex]?.attempted ? 2 : 1;
    const delay = PACKET_LEG_DURATION * legs * 1000 + READ_PAUSE_MS;
    const timer = setTimeout(() => setStepIndex((i) => i + 1), delay);
    return () => clearTimeout(timer);
  }, [playing, atEnd, stepIndex, steps]);

  const step = steps[Math.min(stepIndex, steps.length - 1)];

  return (
    <div className="space-y-6">
      <CircuitBreakerDiagram step={step} />

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-md bg-slate-800/60 px-3 py-1.5 font-mono text-slate-300">
          запрос #{step.id}
        </span>
        <span className="rounded-md bg-slate-800/60 px-3 py-1.5 font-mono text-slate-300">
          исход: {OUTCOME_LABEL[step.outcome]}
        </span>
        <span className="rounded-md bg-slate-800/60 px-3 py-1.5 font-mono text-slate-300">
          отказов подряд: {step.consecutiveFailures}
        </span>
      </div>

      <p className="min-h-[2.5rem] rounded-md bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
        {step.description}
      </p>

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
