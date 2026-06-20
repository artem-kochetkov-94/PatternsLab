import { useState, type ComponentType } from "react";
import { TreeDemo } from "./TreeDemo";
import { SequenceDemo } from "./SequenceDemo";

/**
 * Две грани одной идеи "перебор без раскрытия устройства":
 *  - классический GoF (своя коллекция + несколько стратегий обхода);
 *  - встроенный в язык протокол итерации (Symbol.iterator + генераторы).
 */
const EXAMPLES: {
  id: string;
  label: string;
  hint: string;
  render: ComponentType;
}[] = [
  {
    id: "tree",
    label: "Обход дерева",
    hint: "Одно дерево — четыре итератора. Стратегия обхода меняется, код-потребитель — нет.",
    render: TreeDemo,
  },
  {
    id: "protocol",
    label: "Протокол итерации JS",
    hint: "Тот же паттерн в самом языке: Symbol.iterator, генераторы и ленивые конвейеры.",
    render: SequenceDemo,
  },
];

export function Demo() {
  const [activeId, setActiveId] = useState(EXAMPLES[0].id);
  const active = EXAMPLES.find((e) => e.id === activeId) ?? EXAMPLES[0];
  const Active = active.render;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example.id}
            onClick={() => setActiveId(example.id)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              example.id === activeId
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
            ].join(" ")}
          >
            {example.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-400">{active.hint}</p>

      {/* key — сброс состояния при смене примера. */}
      <div key={active.id}>
        <Active />
      </div>
    </div>
  );
}
