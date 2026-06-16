import { useState } from "react";
import type { PatternModule } from "@patterns-lab/core";
import { CodeViewer } from "./CodeViewer";

type TabId = "explanation" | "demo" | "code";

const tabs: { id: TabId; label: string }[] = [
  // Теория идёт первой: сначала понять "что это", потом смотреть демо и код.
  { id: "explanation", label: "Разбор" },
  { id: "demo", label: "Демо" },
  { id: "code", label: "Код" },
];

/**
 * Содержимое страницы паттерна в виде вкладок. На экране всегда одна
 * секция — так длинная страница не читается "сплошняком".
 */
export function PatternTabs({ module }: { module: PatternModule }) {
  const [active, setActive] = useState<TabId>("explanation");
  const { Demo, Explanation, code } = module;

  return (
    <div>
      {/* Переключатель вкладок */}
      <div
        role="tablist"
        className="flex gap-1 border-b border-slate-700"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors " +
              (active === tab.id
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200")
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Контент активной вкладки */}
      <div className="mt-6">
        {active === "explanation" && <Explanation />}

        {active === "demo" && <Demo />}

        {active === "code" && (
          <div>
            <p className="mb-4 text-sm text-slate-400">
              Код, который работает в демо. Начните с «ядра» паттерна — это
              чистый TypeScript, без привязки к React.
            </p>
            <CodeViewer files={code} />
          </div>
        )}
      </div>
    </div>
  );
}
