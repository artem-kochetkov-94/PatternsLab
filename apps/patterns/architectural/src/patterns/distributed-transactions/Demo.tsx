import { useEffect, useState } from "react";
import {
  OUTBOX_STEPS,
  SAGA_SCENARIOS,
  TPC_SCENARIOS,
  getSagaSteps,
  getTpcSteps,
  outboxScenario,
  sagaScenario,
  tpcScenario,
  type SagaScenarioId,
  type TpcScenarioId,
  type TxStep,
} from "./transactions";
import { PACKET_LEG_DURATION, TxDiagram } from "./TxDiagram";

const READ_PAUSE_MS = 900;

type Tab = "2pc" | "saga" | "outbox";

const TABS: { id: Tab; label: string }[] = [
  { id: "2pc", label: "2PC" },
  { id: "saga", label: "Saga" },
  { id: "outbox", label: "Transaction Outbox" },
];

export function Demo() {
  const [tab, setTab] = useState<Tab>("2pc");
  const [tpcScenarioId, setTpcScenarioId] = useState<TpcScenarioId>("success");
  const [sagaScenarioId, setSagaScenarioId] = useState<SagaScenarioId>("success");

  const scenario = tab === "2pc" ? tpcScenario : tab === "saga" ? sagaScenario : outboxScenario;
  const steps: TxStep[] =
    tab === "2pc" ? getTpcSteps(tpcScenarioId) : tab === "saga" ? getSagaSteps(sagaScenarioId) : OUTBOX_STEPS;

  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const atEnd = stepIndex >= steps.length - 1;

  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
  }, [tab, tpcScenarioId, sagaScenarioId]);

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
  const eventKey = `${tab}-${tpcScenarioId}-${sagaScenarioId}-${step.id}`;

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

      {tab === "2pc" && (
        <div className="flex flex-wrap gap-2">
          {TPC_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setTpcScenarioId(s.id)}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                s.id === tpcScenarioId
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
              ].join(" ")}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
      {tab === "saga" && (
        <div className="flex flex-wrap gap-2">
          {SAGA_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSagaScenarioId(s.id)}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                s.id === sagaScenarioId
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
              ].join(" ")}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <TxDiagram nodes={scenario.nodes} pos={scenario.pos} edges={scenario.edges} step={step} eventKey={eventKey} />

      <div className="space-y-1.5">
        <p className="font-mono text-xs text-slate-500">{step.label}</p>
        <p className="min-h-[4rem] rounded-md bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
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
