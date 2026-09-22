import { useEffect, useState } from "react";
import { TRACE_STEPS, getSpan } from "./tracing";
import { Waterfall, BAR_GROW_DURATION } from "./Waterfall";

// Пауза после того, как бар доигрался, — чтобы успеть прочитать описание.
const READ_PAUSE_MS = 1200;

export function Demo() {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const atEnd = stepIndex >= TRACE_STEPS.length - 1;

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const delay = BAR_GROW_DURATION * 1000 + READ_PAUSE_MS;
    const timer = setTimeout(() => setStepIndex((i) => i + 1), delay);
    return () => clearTimeout(timer);
  }, [playing, atEnd]);

  const step = TRACE_STEPS[Math.min(stepIndex, TRACE_STEPS.length - 1)];
  const visibleSpans = TRACE_STEPS.slice(0, stepIndex + 1).map((s) => getSpan(s.spanId));

  return (
    <div className="space-y-6">
      <Waterfall spans={visibleSpans} />

      <p className="min-h-[3.5rem] rounded-md bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
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
            setStepIndex((i) => Math.min(TRACE_STEPS.length - 1, i + 1));
          }}
          disabled={atEnd}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-40"
        >
          Вперёд ▶
        </button>
        <span className="ml-auto font-mono text-xs text-slate-500">
          {stepIndex + 1} / {TRACE_STEPS.length}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={TRACE_STEPS.length - 1}
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
