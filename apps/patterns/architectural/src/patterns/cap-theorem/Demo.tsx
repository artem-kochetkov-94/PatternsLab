import { useState } from "react";
import {
  initialCapState,
  readFromNodeB,
  togglePartition,
  writeToNodeA,
  type CapMode,
  type ReadResult,
} from "./cap";
import { CapDiagram } from "./CapDiagram";

const MODES: { id: CapMode; label: string; hint: string }[] = [
  {
    id: "CP",
    label: "CP — жертвуем доступностью",
    hint: "Пока связи нет, Node B лучше откажет в ответе, чем отдаст то, что может оказаться неактуальным.",
  },
  {
    id: "AP",
    label: "AP — жертвуем согласованностью",
    hint: "Node B продолжает отвечать даже без связи с Node A — рискуя отдать устаревшее значение.",
  },
];

export function Demo() {
  const [state, setState] = useState(initialCapState);
  const [lastRead, setLastRead] = useState<ReadResult | null>(null);
  const [flashA, setFlashA] = useState("idle-a");
  const [flashB, setFlashB] = useState("idle-b");

  const handleWrite = () => {
    setState((s) => writeToNodeA(s));
    setLastRead(null);
    setFlashA(`write-${Date.now()}`);
  };

  const handleRead = () => {
    const result = readFromNodeB(state);
    setLastRead(result);
    setFlashB(`read-${Date.now()}`);
  };

  const handleTogglePartition = () => {
    setState((s) => togglePartition(s));
    setLastRead(null);
  };

  const bTone = !state.partitioned
    ? "up"
    : lastRead && !lastRead.ok
      ? "down"
      : lastRead?.stale
        ? "stale"
        : "up";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setState((s) => ({ ...s, mode: m.id }))}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              m.id === state.mode
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
            ].join(" ")}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-400">{MODES.find((m) => m.id === state.mode)!.hint}</p>

      <CapDiagram state={state} flashA={flashA} flashB={flashB} bTone={bTone} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleTogglePartition}
          className={[
            "rounded-md border px-4 py-1.5 text-sm font-medium transition-colors",
            state.partitioned
              ? "border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-500"
              : "border-rose-500 bg-rose-600 text-white hover:bg-rose-500",
          ].join(" ")}
        >
          {state.partitioned ? "🔌 Восстановить связь" : "✂️ Разорвать связь"}
        </button>
        <button
          onClick={handleWrite}
          className="rounded-md border border-indigo-500 bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Записать в Node A
        </button>
        <button
          onClick={handleRead}
          className="rounded-md border border-slate-700 px-4 py-1.5 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-white"
        >
          Прочитать с Node B
        </button>
      </div>

      <div className="min-h-[3.5rem] rounded-md bg-slate-800/60 px-4 py-2 text-sm">
        {lastRead ? (
          <p className={lastRead.ok ? (lastRead.stale ? "text-amber-300" : "text-emerald-300") : "text-rose-300"}>
            {lastRead.ok ? `Node B вернула: ${lastRead.value}. ` : "Node B: ошибка. "}
            {lastRead.message}
          </p>
        ) : (
          <p className="text-slate-400">
            Разорви связь, выбери CP или AP, запиши новое значение в Node A и попробуй прочитать
            с Node B.
          </p>
        )}
      </div>
    </div>
  );
}
