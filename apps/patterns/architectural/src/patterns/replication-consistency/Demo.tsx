import { useEffect, useState } from "react";
import {
  CONSISTENCY_OPTIONS,
  CONSISTENCY_QUIZ,
  SYNC_MODES,
  getSyncSteps,
  type ConsistencyModel,
  type SyncMode,
} from "./consistency";
import { PACKET_LEG_DURATION, SyncDiagram } from "./SyncDiagram";

const READ_PAUSE_MS = 1100;

type Tab = "sync" | "consistency";

const TABS: { id: Tab; label: string }[] = [
  { id: "sync", label: "Синхронность" },
  { id: "consistency", label: "Модели консистентности" },
];

export function Demo() {
  const [tab, setTab] = useState<Tab>("sync");

  return (
    <div className="space-y-6">
      <div className="inline-flex flex-wrap rounded-lg border border-slate-700 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              t.id === tab ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "sync" ? <SyncPlayer /> : <ConsistencyQuiz />}
    </div>
  );
}

function SyncPlayer() {
  const [mode, setMode] = useState<SyncMode>("sync");
  const modeInfo = SYNC_MODES.find((m) => m.id === mode)!;
  const steps = getSyncSteps(mode);

  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const atEnd = stepIndex >= steps.length - 1;

  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
  }, [mode]);

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const legs = steps[stepIndex]?.legs.length || 1;
    const delay = PACKET_LEG_DURATION * legs * 1000 + READ_PAUSE_MS;
    const timer = setTimeout(() => setStepIndex((i) => i + 1), delay);
    return () => clearTimeout(timer);
  }, [playing, atEnd, stepIndex, steps]);

  const step = steps[Math.min(stepIndex, steps.length - 1)];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {SYNC_MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              m.id === mode
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
            ].join(" ")}
          >
            {m.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-400">{modeInfo.hint}</p>

      <SyncDiagram step={step} />

      <div className="space-y-1.5">
        <p className="font-mono text-xs text-slate-500">{step.label}</p>
        <p className="min-h-[3.5rem] rounded-md bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
          {step.description}
        </p>
      </div>

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

function ConsistencyQuiz() {
  const [answers, setAnswers] = useState<Record<number, ConsistencyModel>>({});
  const answeredCount = Object.keys(answers).length;
  const correctCount = CONSISTENCY_QUIZ.filter((item) => answers[item.id] === item.answer).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-400">
          По сценарию — с твитом и его читателями — угадай, какую гарантию консистентности он иллюстрирует.
        </p>
        <span className="rounded-md bg-slate-800/60 px-3 py-1 font-mono text-xs text-slate-300">
          верно: {correctCount} / {answeredCount || "?"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {CONSISTENCY_QUIZ.map((item) => {
          const selected = answers[item.id];
          const answered = selected !== undefined;
          const isCorrect = selected === item.answer;
          return (
            <div
              key={item.id}
              className={[
                "rounded-lg border p-4 transition-colors",
                !answered
                  ? "border-slate-700 bg-slate-900/50"
                  : isCorrect
                    ? "border-emerald-500 bg-emerald-950/20"
                    : "border-rose-500 bg-rose-950/20",
              ].join(" ")}
            >
              <p className="text-sm text-slate-200">{item.prompt}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {CONSISTENCY_OPTIONS.map((opt) => {
                  const isSelected = selected === opt.id;
                  const isTheAnswer = opt.id === item.answer;
                  let tone = "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white";
                  if (answered && isTheAnswer) {
                    tone = "border-emerald-500 bg-emerald-600/20 text-emerald-300";
                  } else if (isSelected && !isTheAnswer) {
                    tone = "border-rose-500 bg-rose-600/20 text-rose-300";
                  }
                  return (
                    <button
                      key={opt.id}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [item.id]: opt.id }))
                      }
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${tone}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <p className="mt-3 text-xs text-slate-400">
                  {isCorrect ? "✅ " : "❌ "}
                  {item.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
