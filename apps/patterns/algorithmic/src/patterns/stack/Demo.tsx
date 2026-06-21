import { useEffect, useMemo, useState } from "react";
import { minRemoveTrace } from "./stack";
import { StackVisualizer } from "./StackVisualizer";

// Примеры подобраны под разные исходы: лишняя «)», лишние «(», скобки по краям
// и уже валидная строка.
const PRESETS: { label: string; s: string }[] = [
  { label: "Лишняя «)»", s: "a)b(c)d" },
  { label: "Лишние «(»", s: "(a(b(c)" },
  { label: "Скобки по краям", s: "))((" },
  { label: "Уже валидна", s: "(a(b)c)" },
];

const PLAY_INTERVAL = 900;

export function Demo() {
  const [s, setS] = useState(PRESETS[0].s);
  const [draft, setDraft] = useState(PRESETS[0].s);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  // История шагов пересчитывается на каждую новую строку.
  const steps = useMemo(() => minRemoveTrace(s), [s]);
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const atEnd = stepIndex >= steps.length - 1;

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStepIndex((i) => i + 1), PLAY_INTERVAL);
    return () => clearTimeout(timer);
  }, [playing, atEnd, stepIndex]);

  const load = (next: string) => {
    setS(next);
    setDraft(next);
    setStepIndex(0);
    setPlaying(false);
  };

  const applyDraft = () => {
    if (draft.length > 0) load(draft);
  };

  return (
    <div className="space-y-6">
      {/* Выбор примера. */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => load(preset.s)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              preset.s === s
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
            ].join(" ")}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Своя строка. */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyDraft()}
          placeholder="строка из ( ) и букв"
          className="w-72 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-sm text-slate-200 outline-none focus:border-indigo-500"
        />
        <button
          onClick={applyDraft}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
        >
          Применить
        </button>
      </div>

      {/* Визуализация текущего шага. */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <StackVisualizer s={s} step={step} />
      </div>

      {/* Пояснение шага. */}
      <p className="min-h-[2.5rem] rounded-md bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
        {step.description}
      </p>

      {/* Управление плеером. */}
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
          шаг {stepIndex + 1} / {steps.length}
        </span>
      </div>

      {/* Перемотка по шагам. */}
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
