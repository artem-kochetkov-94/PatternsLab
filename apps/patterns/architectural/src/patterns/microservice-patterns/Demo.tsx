import { useEffect, useState } from "react";
import {
  DEFERRED_MODES,
  EVENT_MODES,
  aggregatorScenario,
  chainScenario,
  deferredScenario,
  eventDrivenScenario,
  getDeferredSteps,
  getEventSteps,
  type DeferredMode,
  type EventDrivenMode,
  type MsStep,
} from "./microservices";
import { MsDiagram, PACKET_LEG_DURATION } from "./MsDiagram";

const READ_PAUSE_MS = 900;

type Tab = "aggregator" | "chain" | "event-driven" | "deferred";

const TABS: { id: Tab; label: string }[] = [
  { id: "aggregator", label: "Агрегатор" },
  { id: "chain", label: "Цепочка" },
  { id: "event-driven", label: "Событийно-ориентированная" },
  { id: "deferred", label: "Отложенное выполнение задач" },
];

export function Demo() {
  const [tab, setTab] = useState<Tab>("aggregator");
  const [eventMode, setEventMode] = useState<EventDrivenMode>("notification");
  const [deferredMode, setDeferredMode] = useState<DeferredMode>("sync");

  const scenario =
    tab === "aggregator"
      ? aggregatorScenario
      : tab === "chain"
        ? chainScenario
        : tab === "event-driven"
          ? eventDrivenScenario
          : deferredScenario;

  const steps: MsStep[] =
    tab === "event-driven"
      ? getEventSteps(eventMode)
      : tab === "deferred"
        ? getDeferredSteps(deferredMode)
        : scenario.steps;

  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const atEnd = stepIndex >= steps.length - 1;

  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
  }, [tab, eventMode, deferredMode]);

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const maxUnit = Math.max(0, ...steps[stepIndex].legs.map((l) => l.delayUnits));
    const delay = (maxUnit + 1) * PACKET_LEG_DURATION * 1000 + READ_PAUSE_MS;
    const timer = setTimeout(() => setStepIndex((i) => i + 1), delay);
    return () => clearTimeout(timer);
  }, [playing, atEnd, stepIndex, steps]);

  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const eventKey = `${tab}-${eventMode}-${deferredMode}-${step.id}`;

  return (
    <div className="space-y-6">
      <div className="inline-flex flex-wrap rounded-lg border border-slate-700 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              t.id === tab ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "event-driven" && (
        <div className="flex flex-wrap gap-2">
          {EVENT_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setEventMode(m.id)}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                m.id === eventMode
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
              ].join(" ")}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}
      {tab === "deferred" && (
        <div className="flex flex-wrap gap-2">
          {DEFERRED_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setDeferredMode(m.id)}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                m.id === deferredMode
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
              ].join(" ")}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-slate-400">
        {tab === "event-driven"
          ? EVENT_MODES.find((m) => m.id === eventMode)!.hint
          : tab === "deferred"
            ? DEFERRED_MODES.find((m) => m.id === deferredMode)!.hint
            : scenario.hint}
      </p>

      <MsDiagram nodes={scenario.nodes} pos={scenario.pos} edges={scenario.edges} step={step} eventKey={eventKey} />

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
