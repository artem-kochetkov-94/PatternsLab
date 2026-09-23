import { useState } from "react";
import { ACTIONS, type CqrsAction } from "./cqrs";
import { CqrsDiagram } from "./CqrsDiagram";

export function Demo() {
  const [cqrsEnabled, setCqrsEnabled] = useState(false);
  const [flash, setFlash] = useState<{ action: CqrsAction; key: string } | null>(null);

  const trigger = (action: CqrsAction) => {
    setFlash({ action, key: `${action}-${Date.now()}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          {cqrsEnabled
            ? "CQRS включён: запись и чтение идут в разные сервисы — их можно масштабировать и оптимизировать независимо."
            : "Один и тот же сервис отвечает и за запись, и за чтение — они делят одну и ту же нагрузку и одну и ту же модель данных."}
        </p>
        <button
          onClick={() => setCqrsEnabled((v) => !v)}
          className={[
            "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            cqrsEnabled
              ? "border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-500"
              : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
          ].join(" ")}
        >
          {cqrsEnabled ? "CQRS: включён" : "CQRS: выключен"}
        </button>
      </div>

      <CqrsDiagram cqrsEnabled={cqrsEnabled} flash={flash} />

      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            onClick={() => trigger(a.id)}
            className="rounded-md border border-slate-700 px-4 py-1.5 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-white"
          >
            {a.label}
          </button>
        ))}
      </div>

      <p className="min-h-[3.5rem] rounded-md bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
        {!flash
          ? "Нажми «Купить билет» или «Посмотреть список», чтобы увидеть, куда идёт запрос."
          : cqrsEnabled
            ? flash.action === "write"
              ? "Запись идёт в Tickets Writer — сервис, оптимизированный под надёжную, строго консистентную запись."
              : "Чтение идёт в Tickets Reader — отдельный сервис с денормализованной, быстрой для чтения проекцией данных."
            : "И запись, и чтение идут в один и тот же сервис Tickets — он вынужден быть компромиссом между двумя разными нагрузками сразу."}
      </p>
    </div>
  );
}
