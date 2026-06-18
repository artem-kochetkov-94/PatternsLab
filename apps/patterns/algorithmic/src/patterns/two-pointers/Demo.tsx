import { useEffect, useMemo, useState } from "react";
import { squaresOfSortedArray } from "./twoPointers";
import { ArrayVisualizer } from "./ArrayVisualizer";

// Готовые примеры. Главное — наличие отрицательных чисел: именно из-за них
// наивная сортировка и проигрывает приёму «два указателя».
const PRESETS: { label: string; nums: number[] }[] = [
  { label: "−4 −1 0 3 10", nums: [-4, -1, 0, 3, 10] },
  { label: "−7 −3 2 3 11", nums: [-7, -3, 2, 3, 11] },
  { label: "−5 −2 −1", nums: [-5, -2, -1] },
  { label: "1 2 3 4", nums: [1, 2, 3, 4] },
];

const PLAY_INTERVAL = 900;

export function Demo() {
  const [nums, setNums] = useState<number[]>(PRESETS[0].nums);
  const [draft, setDraft] = useState(PRESETS[0].nums.join(", "));
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Вся история шагов считается один раз на каждый входной массив.
  const steps = useMemo(() => squaresOfSortedArray(nums), [nums]);
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const atEnd = stepIndex >= steps.length - 1;

  // Автопроигрывание: пока playing и не дошли до конца — листаем дальше.
  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStepIndex((i) => i + 1), PLAY_INTERVAL);
    return () => clearTimeout(timer);
  }, [playing, atEnd, stepIndex]);

  const load = (next: number[]) => {
    setNums(next);
    setDraft(next.join(", "));
    setStepIndex(0);
    setPlaying(false);
  };

  // Свой ввод: парсим числа и сортируем — приём требует отсортированный вход.
  const applyDraft = () => {
    const parsed = draft
      .split(/[\s,]+/)
      .map(Number)
      .filter((x) => Number.isFinite(x))
      .sort((a, b) => a - b);
    if (parsed.length > 0) load(parsed);
  };

  return (
    <div className="space-y-6">
      {/* Выбор примера. */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => load(preset.nums)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              preset.nums.join(",") === nums.join(",")
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
            ].join(" ")}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Свой массив. */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyDraft()}
          placeholder="свои числа через запятую"
          className="w-64 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
        />
        <button
          onClick={applyDraft}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
        >
          Применить
        </button>
        <span className="text-xs text-slate-500">
          вход автоматически сортируется по возрастанию
        </span>
      </div>

      {/* Сама визуализация текущего шага. */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <ArrayVisualizer nums={nums} step={step} />
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
