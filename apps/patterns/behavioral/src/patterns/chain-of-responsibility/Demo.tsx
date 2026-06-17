import { useState, type ComponentType } from "react";
import { ApprovalDemo } from "./ApprovalDemo";
import { ValidationDemo } from "./ValidationDemo";

/**
 * Демо паттерна показывает ТРИ примера одной и той же идеи "цепочки".
 * Они отличаются ровно одним: КОГДА звено передаёт запрос дальше и
 * когда цепочка останавливается. Переключаемся между ними кнопками —
 * так каждый сценарий разбирается отдельно.
 */
const EXAMPLES: {
  id: string;
  label: string;
  hint: string;
  render: ComponentType;
}[] = [
  {
    id: "first-match",
    label: "First-match",
    hint: "Согласование расхода: обрабатывает первый, кто может, — потом стоп.",
    render: ApprovalDemo,
  },
  {
    id: "fail-fast",
    label: "Fail-fast",
    hint: "Валидация формы: останавливаемся на первой же ошибке.",
    render: () => <ValidationDemo mode="fail-fast" />,
  },
  {
    id: "collect-all",
    label: "Собрать всё",
    hint: "Валидация формы: проходим до конца и собираем все ошибки.",
    render: () => <ValidationDemo mode="collect-all" />,
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

      {/* key — чтобы при смене примера состояние/анимация сбрасывались. */}
      <div key={active.id}>
        <Active />
      </div>
    </div>
  );
}
