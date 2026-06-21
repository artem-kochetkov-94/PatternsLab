import { useEffect, useMemo, useState } from "react";
import { minRemoveTrace } from "./stack";
import { StackVisualizer } from "./StackVisualizer";
import { dailyTemperaturesTrace } from "./dailyTemperaturesTrace";
import { TemperaturesVisualizer } from "./TemperaturesVisualizer";

const PLAY_INTERVAL = 900;

type Task = "parens" | "temps";

const TASKS: { id: Task; label: string }[] = [
  { id: "parens", label: "Скобки · LC 1249" },
  { id: "temps", label: "Температуры · LC 739" },
];

export function Demo() {
  const [task, setTask] = useState<Task>("parens");

  return (
    <div className="space-y-6">
      {/* Переключатель задачи: смена размонтирует под-демо, состояние сбрасывается. */}
      <div className="inline-flex rounded-lg border border-slate-700 p-1">
        {TASKS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTask(t.id)}
            className={[
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              task === t.id
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {task === "parens" ? <ParensDemo /> : <TempsDemo />}
    </div>
  );
}

/** Общая логика плеера: индекс шага, автопроигрывание, сброс. */
function useStepPlayer(stepsLength: number) {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const atEnd = stepIndex >= stepsLength - 1;

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStepIndex((i) => i + 1), PLAY_INTERVAL);
    return () => clearTimeout(timer);
  }, [playing, atEnd, stepIndex]);

  const reset = () => {
    setStepIndex(0);
    setPlaying(false);
  };

  return { stepIndex, setStepIndex, playing, setPlaying, atEnd, reset };
}

/** Кнопки «сброс / назад / авто / вперёд» + счётчик + перемотка. Общие для задач. */
function PlayerControls({
  player,
  stepsLength,
}: {
  player: ReturnType<typeof useStepPlayer>;
  stepsLength: number;
}) {
  const { stepIndex, setStepIndex, playing, setPlaying, atEnd, reset } = player;
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={reset}
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
            setStepIndex((i) => Math.min(stepsLength - 1, i + 1));
          }}
          disabled={atEnd}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-40"
        >
          Вперёд ▶
        </button>
        <span className="ml-auto font-mono text-xs text-slate-500">
          шаг {stepIndex + 1} / {stepsLength}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={stepsLength - 1}
        value={stepIndex}
        onChange={(e) => {
          setPlaying(false);
          setStepIndex(Number(e.target.value));
        }}
        className="w-full accent-indigo-500"
      />
    </>
  );
}

const PRESET_BTN = (active: boolean) =>
  [
    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
    active
      ? "border-indigo-500 bg-indigo-600 text-white"
      : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
  ].join(" ");

const INPUT =
  "rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500";

const APPLY_BTN =
  "rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white";

/* ── Задача 1: Minimum Remove to Make Valid Parentheses (LC 1249) ───────── */

const PARENS_PRESETS: { label: string; s: string }[] = [
  { label: "Лишняя «)»", s: "a)b(c)d" },
  { label: "Лишние «(»", s: "(a(b(c)" },
  { label: "Скобки по краям", s: "))((" },
  { label: "Уже валидна", s: "(a(b)c)" },
];

function ParensDemo() {
  const [s, setS] = useState(PARENS_PRESETS[0].s);
  const [draft, setDraft] = useState(PARENS_PRESETS[0].s);

  const steps = useMemo(() => minRemoveTrace(s), [s]);
  const player = useStepPlayer(steps.length);
  const step = steps[Math.min(player.stepIndex, steps.length - 1)];

  const load = (next: string) => {
    setS(next);
    setDraft(next);
    player.reset();
  };
  const applyDraft = () => {
    if (draft.length > 0) load(draft);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {PARENS_PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => load(p.s)}
            className={PRESET_BTN(p.s === s)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyDraft()}
          placeholder="строка из ( ) и букв"
          className={`w-72 font-mono ${INPUT}`}
        />
        <button onClick={applyDraft} className={APPLY_BTN}>
          Применить
        </button>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <StackVisualizer s={s} step={step} />
      </div>

      <p className="min-h-[2.5rem] rounded-md bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
        {step.description}
      </p>

      <PlayerControls player={player} stepsLength={steps.length} />
    </div>
  );
}

/* ── Задача 2: Daily Temperatures (LC 739), монотонный стек ──────────────── */

const TEMP_PRESETS: { label: string; temps: number[] }[] = [
  { label: "Классика LC", temps: [73, 74, 75, 71, 69, 72, 76, 73] },
  { label: "Только теплеет", temps: [30, 40, 50, 60] },
  { label: "Только холодает", temps: [60, 50, 40, 30] },
  { label: "Плато и скачок", temps: [55, 55, 55, 80] },
];

function TempsDemo() {
  const [temps, setTemps] = useState(TEMP_PRESETS[0].temps);
  const [draft, setDraft] = useState(TEMP_PRESETS[0].temps.join(", "));

  const steps = useMemo(() => dailyTemperaturesTrace(temps), [temps]);
  const player = useStepPlayer(steps.length);
  const step = steps[Math.min(player.stepIndex, steps.length - 1)];

  const load = (next: number[]) => {
    setTemps(next);
    setDraft(next.join(", "));
    player.reset();
  };
  const applyDraft = () => {
    const parsed = draft
      .split(/[\s,]+/)
      .map(Number)
      .filter((x) => Number.isFinite(x));
    if (parsed.length > 0) load(parsed);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TEMP_PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => load(p.temps)}
            className={PRESET_BTN(p.temps.join(",") === temps.join(","))}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyDraft()}
          placeholder="температуры через запятую"
          className={`w-72 ${INPUT}`}
        />
        <button onClick={applyDraft} className={APPLY_BTN}>
          Применить
        </button>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <TemperaturesVisualizer temps={temps} step={step} />
      </div>

      <p className="min-h-[2.5rem] rounded-md bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
        {step.description}
      </p>

      <PlayerControls player={player} stepsLength={steps.length} />
    </div>
  );
}
