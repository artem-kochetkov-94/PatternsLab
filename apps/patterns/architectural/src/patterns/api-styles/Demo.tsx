import { useState } from "react";
import { API_STYLES, getApiSteps, type ApiStyle } from "./api";

export function Demo() {
  const [style, setStyle] = useState<ApiStyle>("rest");
  const info = API_STYLES.find((s) => s.id === style)!;
  const steps = getApiSteps(style);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {API_STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStyle(s.id)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              s.id === style
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
            ].join(" ")}
          >
            {s.label}
          </button>
        ))}
        <span className="ml-auto rounded-md bg-slate-800/60 px-3 py-1.5 font-mono text-xs text-slate-300">
          {steps.length} {steps.length === 1 ? "запрос" : "запроса"} на экран
        </span>
      </div>

      <p className="text-sm text-slate-400">{info.hint}</p>

      <p className="text-xs uppercase tracking-wider text-slate-500">
        Задача: получить имя пользователя и заголовки его 3 последних постов.
      </p>

      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <p className="font-mono text-xs text-indigo-300">{step.label}</p>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">
                  Запрос
                </p>
                <pre className="overflow-x-auto rounded-md bg-slate-950 p-3 font-mono text-xs text-sky-300">
                  {step.request}
                </pre>
              </div>
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">
                  Ответ
                </p>
                <pre className="overflow-x-auto rounded-md bg-slate-950 p-3 font-mono text-xs text-slate-300">
                  {step.response}
                </pre>
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-300">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
