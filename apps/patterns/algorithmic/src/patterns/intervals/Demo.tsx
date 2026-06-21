import { useEffect, useMemo, useState } from "react";
import { minMeetingRooms, type Interval } from "./intervals";
import { mergeIntervalsTrace } from "./merge";
import { IntervalsVisualizer } from "./IntervalsVisualizer";
import { MergeVisualizer } from "./MergeVisualizer";

// Два режима: считаем переговорки (метод точек) и сливаем отрезки (merge).
type Mode = "rooms" | "merge";

// У каждого режима свои наборы данных — у пары [start, end].
const PRESETS: Record<
  Mode,
  { label: string; intervals: [number, number][] }[]
> = {
  rooms: [
    { label: "Классика (3 комнаты)", intervals: [[0, 30], [5, 10], [10, 20], [15, 25], [16, 40]] },
    { label: "Встык — не пересекаются", intervals: [[0, 10], [10, 20], [20, 30]] },
    { label: "Всё внахлёст (4)", intervals: [[1, 8], [2, 9], [3, 7], [4, 6]] },
    { label: "Две комнаты", intervals: [[0, 5], [3, 9], [6, 12]] },
  ],
  merge: [
    { label: "Классика (LC 56)", intervals: [[1, 3], [2, 6], [8, 10], [15, 18]] },
    { label: "Касание сливается", intervals: [[1, 4], [4, 5]] },
    { label: "Один поглощает всех", intervals: [[1, 20], [3, 5], [7, 9], [12, 15]] },
    { label: "Без пересечений", intervals: [[1, 2], [4, 6], [8, 10]] },
  ],
};

const MODE_LABEL: Record<Mode, string> = {
  rooms: "Meeting Rooms · метод точек",
  merge: "Merge Intervals · слияние",
};

const PLAY_INTERVAL = 900;

// Превращает пары [start, end] в объекты Interval с устойчивыми id.
const toIntervals = (pairs: [number, number][]): Interval[] =>
  pairs.map(([start, end], id) => ({ id, start, end }));

export function Demo() {
  const [mode, setMode] = useState<Mode>("rooms");
  const [pairs, setPairs] = useState<[number, number][]>(
    PRESETS.rooms[0].intervals,
  );
  const [draft, setDraft] = useState(
    PRESETS.rooms[0].intervals.map((p) => p.join("-")).join(", "),
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const intervals = useMemo(() => toIntervals(pairs), [pairs]);
  // История шагов своя для каждого режима; считается один раз на набор.
  const steps = useMemo(
    () =>
      mode === "rooms"
        ? minMeetingRooms(intervals)
        : mergeIntervalsTrace(intervals),
    [mode, intervals],
  );
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

  const load = (next: [number, number][]) => {
    setPairs(next);
    setDraft(next.map((p) => p.join("-")).join(", "));
    setStepIndex(0);
    setPlaying(false);
  };

  // Переключение режима сбрасывает данные на первый пресет этого режима.
  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    load(PRESETS[next][0].intervals);
  };

  // Свой ввод: пары вида "0-30, 5-10". Берём только корректные start < end.
  const applyDraft = () => {
    const parsed = draft
      .split(",")
      .map((chunk) => chunk.trim().split(/[\s-]+/).map(Number))
      .filter(
        ([a, b]) =>
          a !== undefined &&
          b !== undefined &&
          Number.isFinite(a) &&
          Number.isFinite(b) &&
          a < b,
      )
      .map(([a, b]) => [a, b] as [number, number]);
    if (parsed.length > 0) load(parsed);
  };

  return (
    <div className="space-y-6">
      {/* Тумблер режима. */}
      <div className="inline-flex rounded-lg border border-slate-700 p-1">
        {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={[
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              mode === m
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white",
            ].join(" ")}
          >
            {MODE_LABEL[m]}
          </button>
        ))}
      </div>

      {/* Выбор примера. */}
      <div className="flex flex-wrap gap-2">
        {PRESETS[mode].map((preset) => {
          const isCurrent =
            JSON.stringify(preset.intervals) === JSON.stringify(pairs);
          return (
            <button
              key={preset.label}
              onClick={() => load(preset.intervals)}
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

      {/* Свои встречи. */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyDraft()}
          placeholder="отрезки: 1-3, 2-6, 8-10"
          className="w-72 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
        />
        <button
          onClick={applyDraft}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
        >
          Применить
        </button>
        <span className="text-xs text-slate-500">
          пары «начало-конец» через запятую
        </span>
      </div>

      {/* Сама визуализация текущего шага — своя для каждого режима. */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        {mode === "rooms" ? (
          <IntervalsVisualizer
            intervals={intervals}
            step={step as ReturnType<typeof minMeetingRooms>[number]}
          />
        ) : (
          <MergeVisualizer
            intervals={intervals}
            step={step as ReturnType<typeof mergeIntervalsTrace>[number]}
          />
        )}
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
