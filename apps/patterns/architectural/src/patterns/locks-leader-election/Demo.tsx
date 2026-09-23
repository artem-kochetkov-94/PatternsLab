import { useEffect, useState } from "react";
import { BULLY_STEPS, LOCK_SCENARIOS, getLockSteps, type LockScenarioId } from "./consensus";
import { LockDiagram } from "./LockDiagram";
import { BullyDiagram } from "./BullyDiagram";

type Tab = "locks" | "leader";

const TABS: { id: Tab; label: string }[] = [
  { id: "locks", label: "Распределённые блокировки" },
  { id: "leader", label: "Выбор лидера (Bully algorithm)" },
];

export function Demo() {
  const [tab, setTab] = useState<Tab>("locks");

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

      {tab === "locks" ? <LocksPanel /> : <LeaderPanel />}
    </div>
  );
}

function LocksPanel() {
  const [scenarioId, setScenarioId] = useState<LockScenarioId>("unsafe");
  const steps = getLockSteps(scenarioId);

  const [stepIndex, setStepIndex] = useState(0);
  useEffect(() => setStepIndex(0), [scenarioId]);

  const step = steps[Math.min(stepIndex, steps.length - 1)];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {LOCK_SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setScenarioId(s.id)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              s.id === scenarioId
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
            ].join(" ")}
          >
            {s.label}
          </button>
        ))}
      </div>

      <LockDiagram leg={step.leg} eventKey={`${scenarioId}-${step.id}`} />

      <div className="space-y-1.5">
        <p className="font-mono text-xs text-slate-500">{step.label}</p>
        <p className="min-h-[4.5rem] rounded-md bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
          {step.description}
        </p>
      </div>

      <StepControls stepIndex={stepIndex} setStepIndex={setStepIndex} total={steps.length} />
    </div>
  );
}

function LeaderPanel() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = BULLY_STEPS[Math.min(stepIndex, BULLY_STEPS.length - 1)];

  return (
    <div className="space-y-6">
      <BullyDiagram step={step} eventKey={`${step.id}`} />

      <div className="space-y-1.5">
        <p className="font-mono text-xs text-slate-500">{step.label}</p>
        <p className="min-h-[4.5rem] rounded-md bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
          {step.description}
        </p>
      </div>

      <StepControls stepIndex={stepIndex} setStepIndex={setStepIndex} total={BULLY_STEPS.length} />
    </div>
  );
}

function StepControls({
  stepIndex,
  setStepIndex,
  total,
}: {
  stepIndex: number;
  setStepIndex: (updater: (i: number) => number) => void;
  total: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={() => setStepIndex(() => 0)}
        className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
      >
        ⏮ Сброс
      </button>
      <button
        onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
        disabled={stepIndex === 0}
        className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-40"
      >
        ◀ Назад
      </button>
      <button
        onClick={() => setStepIndex((i) => Math.min(total - 1, i + 1))}
        disabled={stepIndex === total - 1}
        className="rounded-md border border-indigo-500 bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40"
      >
        Вперёд ▶
      </button>
      <span className="ml-auto font-mono text-xs text-slate-500">
        {stepIndex + 1} / {total}
      </span>
      <input
        type="range"
        min={0}
        max={total - 1}
        value={stepIndex}
        onChange={(e) => setStepIndex(() => Number(e.target.value))}
        className="w-full accent-indigo-500 sm:w-auto sm:flex-1"
      />
    </div>
  );
}
