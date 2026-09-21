import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_INSTANCES,
  DEFAULT_REQUESTS,
  LB_STRATEGIES,
  simulateLoadBalancing,
  type LbStrategyId,
} from "./strategies";
import { LoadBalancerDiagram } from "./LoadBalancerDiagram";

const PLAY_INTERVAL = 2800;

export function Demo() {
  const [strategyId, setStrategyId] = useState<LbStrategyId>("round-robin");
  const strategy = LB_STRATEGIES.find((s) => s.id === strategyId)!;

  const steps = useMemo(
    () => simulateLoadBalancing(strategyId, DEFAULT_INSTANCES, DEFAULT_REQUESTS),
    [strategyId],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const atEnd = stepIndex >= steps.length - 1;

  // Смена стратегии — свежая трасса, начинаем показ заново.
  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
  }, [strategyId]);

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
      {/* Выбор стратегии. */}
      <div className="flex flex-wrap gap-2">
        {LB_STRATEGIES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStrategyId(s.id)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              s.id === strategyId
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
            ].join(" ")}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-400">{strategy.hint}</p>

      <LoadBalancerDiagram
        strategyId={strategyId}
        instances={DEFAULT_INSTANCES}
        step={step}
      />

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
          событие {stepIndex + 1} / {steps.length}
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
