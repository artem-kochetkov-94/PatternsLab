import { useEffect, useMemo, useState } from "react";
import { tracePrefixSum, type Cell, type Rect } from "./prefixSum";
import { MatrixVisualizer } from "./MatrixVisualizer";

// Матрицы-примеры. Первая — каноническая из LeetCode 304.
const PRESETS: { label: string; matrix: number[][]; rect: Rect }[] = [
  {
    label: "LeetCode 304 (5×5)",
    matrix: [
      [3, 0, 1, 4, 2],
      [5, 6, 3, 2, 1],
      [1, 2, 0, 1, 5],
      [4, 1, 0, 1, 7],
      [1, 0, 3, 0, 5],
    ],
    rect: { r1: 2, c1: 1, r2: 4, c2: 3 },
  },
  {
    label: "С отрицательными (3×4)",
    matrix: [
      [1, -2, 3, 0],
      [-4, 5, -6, 7],
      [8, -9, 1, 2],
    ],
    rect: { r1: 0, c1: 1, r2: 2, c2: 2 },
  },
  {
    label: "Однородная (4×4)",
    matrix: [
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
    ],
    rect: { r1: 1, c1: 1, r2: 2, c2: 2 },
  },
];

const PLAY_INTERVAL = 700;

// Прямая проверка ответа простым двойным циклом — чтобы сверить с приёмом.
function bruteSum(matrix: number[][], rect: Rect): number {
  let s = 0;
  for (let r = rect.r1; r <= rect.r2; r++)
    for (let c = rect.c1; c <= rect.c2; c++) s += matrix[r][c];
  return s;
}

export function Demo() {
  const [preset, setPreset] = useState(0);
  const [matrix, setMatrix] = useState<number[][]>(PRESETS[0].matrix);
  const [rect, setRect] = useState<Rect | null>(PRESETS[0].rect);
  const [pending, setPending] = useState<Cell | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  // История шагов: построение P + (если выбран прямоугольник) разбор запроса.
  const steps = useMemo(() => tracePrefixSum(matrix, rect), [matrix, rect]);
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const atEnd = stepIndex >= steps.length - 1;

  // Кликаем по клеткам матрицы только когда плеер стоит на месте (на построении
  // или в самом начале) — иначе выбор мешал бы анимации запроса.
  const canSelect = !playing && step.phase === "build";

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStepIndex((i) => i + 1), PLAY_INTERVAL);
    return () => clearTimeout(timer);
  }, [playing, atEnd, stepIndex]);

  const loadPreset = (idx: number) => {
    setPreset(idx);
    setMatrix(PRESETS[idx].matrix);
    setRect(PRESETS[idx].rect);
    setPending(null);
    setStepIndex(0);
    setPlaying(false);
  };

  // Выбор прямоугольника: первый клик — один угол, второй — противоположный.
  const handleCellClick = (row: number, col: number) => {
    if (!canSelect) return;
    if (!pending) {
      setPending({ row, col });
      setRect(null);
    } else {
      setRect({
        r1: Math.min(pending.row, row),
        c1: Math.min(pending.col, col),
        r2: Math.max(pending.row, row),
        c2: Math.max(pending.col, col),
      });
      setPending(null);
      setStepIndex(0);
    }
  };

  const answer = rect ? bruteSum(matrix, rect) : null;

  return (
    <div className="space-y-6">
      {/* Выбор матрицы. */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p, idx) => (
          <button
            key={p.label}
            onClick={() => loadPreset(idx)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              idx === preset
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
            ].join(" ")}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Подсказка по выбору. */}
      <p className="text-xs text-slate-500">
        {rect
          ? `Прямоугольник (${rect.r1},${rect.c1})…(${rect.r2},${rect.c2}). ` +
            "Кликни по матрице (на фазе построения), чтобы выбрать новый."
          : pending
            ? `Угол (${pending.row},${pending.col}) выбран — кликни вторую клетку.`
            : "Кликни две клетки матрицы, чтобы задать прямоугольник запроса."}
      </p>

      {/* Визуализация текущего шага. */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <MatrixVisualizer
          matrix={matrix}
          step={step}
          selection={rect}
          pending={pending}
          onCellClick={canSelect ? handleCellClick : undefined}
        />
      </div>

      {/* Пояснение шага + сверка ответа. */}
      <div className="space-y-2">
        <p className="min-h-[2.5rem] rounded-md bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
          {step.description}
        </p>
        {step.phase === "query" && step.done && answer !== null && (
          <p className="text-sm text-emerald-400">
            Проверка прямым перебором: сумма = {answer}{" "}
            {answer === step.runningSum ? "✓ совпало" : "✗ расхождение"}
          </p>
        )}
      </div>

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
          {step.phase === "build" ? "построение" : "запрос"} · шаг{" "}
          {stepIndex + 1} / {steps.length}
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
