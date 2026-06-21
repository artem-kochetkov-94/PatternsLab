import { useEffect, useMemo, useState } from "react";
import { binarySearchTrace, type SearchMode } from "./binarySearch";
import { BinarySearchVisualizer } from "./BinarySearchVisualizer";

// Примеры: массив всегда отсортирован, target подобран под разные исходы.
// «Дубликаты» специально показывают разницу lower/upper.
const PRESETS: { label: string; nums: number[]; target: number }[] = [
  { label: "Есть в середине", nums: [1, 3, 5, 7, 9, 11, 13], target: 9 },
  { label: "Дубликаты: 4", nums: [2, 4, 4, 4, 6, 8], target: 4 },
  { label: "Нет в массиве", nums: [1, 4, 6, 8, 15, 23, 42], target: 7 },
  { label: "За концом", nums: [1, 2, 3, 5], target: 10 },
];

const MODES: { id: SearchMode; label: string }[] = [
  { id: "exact", label: "Точный поиск" },
  { id: "lower", label: "Левая граница ≥" },
  { id: "upper", label: "Правая граница >" },
];

const PLAY_INTERVAL = 900;

export function Demo() {
  const [mode, setMode] = useState<SearchMode>("exact");
  const [nums, setNums] = useState<number[]>(PRESETS[0].nums);
  const [target, setTarget] = useState<number>(PRESETS[0].target);
  const [draftNums, setDraftNums] = useState(PRESETS[0].nums.join(", "));
  const [draftTarget, setDraftTarget] = useState(String(PRESETS[0].target));
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  // История шагов считается заново на каждую тройку (массив, target, режим).
  const steps = useMemo(
    () => binarySearchTrace(nums, target, mode),
    [nums, target, mode],
  );
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

  const load = (nextNums: number[], nextTarget: number) => {
    setNums(nextNums);
    setTarget(nextTarget);
    setDraftNums(nextNums.join(", "));
    setDraftTarget(String(nextTarget));
    setStepIndex(0);
    setPlaying(false);
  };

  const switchMode = (next: SearchMode) => {
    if (next === mode) return;
    setMode(next);
    setStepIndex(0);
    setPlaying(false);
  };

  // Свой ввод: числа парсим и сортируем (поиск требует отсортированный вход).
  const applyDraft = () => {
    const parsed = draftNums
      .split(/[\s,]+/)
      .map(Number)
      .filter((x) => Number.isFinite(x))
      .sort((a, b) => a - b);
    const t = Number(draftTarget);
    if (parsed.length > 0 && Number.isFinite(t)) load(parsed, t);
  };

  return (
    <div className="space-y-6">
      {/* Тумблер режима. */}
      <div className="inline-flex rounded-lg border border-slate-700 p-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => switchMode(m.id)}
            className={[
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              mode === m.id
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white",
            ].join(" ")}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Выбор примера. */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const isCurrent =
            preset.nums.join(",") === nums.join(",") && preset.target === target;
          return (
            <button
              key={preset.label}
              onClick={() => load(preset.nums, preset.target)}
              className={[
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                isCurrent
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
              ].join(" ")}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Свой массив и цель. */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={draftNums}
          onChange={(e) => setDraftNums(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyDraft()}
          placeholder="числа через запятую"
          className="w-56 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
        />
        <input
          value={draftTarget}
          onChange={(e) => setDraftTarget(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyDraft()}
          placeholder="target"
          className="w-24 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
        />
        <button
          onClick={applyDraft}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
        >
          Применить
        </button>
        <span className="text-xs text-slate-500">
          вход автоматически сортируется
        </span>
      </div>

      {/* Визуализация текущего шага. */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <BinarySearchVisualizer nums={nums} target={target} step={step} />
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
