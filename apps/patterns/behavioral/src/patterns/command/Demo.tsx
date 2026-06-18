import { useState, type ComponentType } from "react";
import { EditorDemo } from "./EditorDemo";
import { RemoteDemo } from "./RemoteDemo";

/**
 * Демо паттерна показывает ДВЕ грани одной идеи "действие как объект".
 * В обоих примерах команда — это объект с execute()/undo(); меняется лишь
 * то, что с этими объектами делают: хранят историю или копят в очередь.
 */
const EXAMPLES: {
  id: string;
  label: string;
  hint: string;
  render: ComponentType;
}[] = [
  {
    id: "undo-redo",
    label: "Undo / Redo",
    hint: "Редактор: каждое действие — команда, поэтому его можно отменить и повторить.",
    render: EditorDemo,
  },
  {
    id: "queue",
    label: "Очередь и макрос",
    hint: "Умный дом: команды копятся в очередь и запускаются одним сценарием.",
    render: RemoteDemo,
  },
];

export function Demo() {
  const [activeId, setActiveId] = useState(EXAMPLES[0].id);
  const active = EXAMPLES.find((e) => e.id === activeId) ?? EXAMPLES[0];
  const Active = active.render;

  return (
    <div className="space-y-6">
      {/* Выбор примера. */}
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

      {/* key — чтобы при смене примера состояние сбрасывалось. */}
      <div key={active.id}>
        <Active />
      </div>
    </div>
  );
}
