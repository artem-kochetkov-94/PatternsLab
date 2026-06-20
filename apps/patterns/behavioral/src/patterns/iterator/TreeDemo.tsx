import { useEffect, useMemo, useState } from "react";
import { BinaryTree, type TraversalOrder, type TreeNode } from "./iterator";

/**
 * Дерево поиска (BST) для демонстрации. Картинка:
 *
 *            D
 *         /     \
 *        B       F
 *       / \     / \
 *      A   C   E   G
 *
 * Выбрано BST намеренно: in-order обход выдаёт значения по алфавиту —
 * наглядное "ага" про симметричный обход.
 */
const ROOT: TreeNode<string> = {
  value: "D",
  left: {
    value: "B",
    left: { value: "A" },
    right: { value: "C" },
  },
  right: {
    value: "F",
    left: { value: "E" },
    right: { value: "G" },
  },
};

const tree = new BinaryTree(ROOT);

/** Координаты узлов на холсте: x в процентах ширины, y — в пикселях. */
const LAYOUT: Record<string, { x: number; y: number }> = {
  D: { x: 50, y: 40 },
  B: { x: 25, y: 140 },
  F: { x: 75, y: 140 },
  A: { x: 12.5, y: 240 },
  C: { x: 37.5, y: 240 },
  E: { x: 62.5, y: 240 },
  G: { x: 87.5, y: 240 },
};

/** Рёбра дерева (родитель → потомок) для отрисовки линий. */
const EDGES: [string, string][] = [
  ["D", "B"],
  ["D", "F"],
  ["B", "A"],
  ["B", "C"],
  ["F", "E"],
  ["F", "G"],
];

const ORDERS: { id: TraversalOrder; label: string; hint: string }[] = [
  { id: "pre-order", label: "Прямой (pre-order)", hint: "корень → левое → правое" },
  {
    id: "in-order",
    label: "Симметричный (in-order)",
    hint: "левое → корень → правое — для BST выходит по порядку",
  },
  {
    id: "post-order",
    label: "Обратный (post-order)",
    hint: "левое → правое → корень",
  },
  {
    id: "level-order",
    label: "По уровням (BFS)",
    hint: "сверху вниз, слева направо",
  },
];

export function TreeDemo() {
  const [order, setOrder] = useState<TraversalOrder>("in-order");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Весь обход, собранный через ПУБЛИЧНЫЙ контракт итератора (hasNext/next).
  const sequence = useMemo(() => tree.toArray(order), [order]);

  // Сменили стратегию — начинаем обход заново.
  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [order]);

  // Автопроигрывание: подсвечиваем по одному узлу в секунду.
  useEffect(() => {
    if (!playing) return;
    if (step >= sequence.length) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStep((s) => s + 1), 800);
    return () => clearTimeout(timer);
  }, [playing, step, sequence.length]);

  const visited = sequence.slice(0, step);
  const currentValue = step > 0 ? sequence[step - 1] : undefined;
  const finished = step >= sequence.length;

  const activeOrder = ORDERS.find((o) => o.id === order)!;

  return (
    <div className="space-y-5">
      {/* Выбор стратегии обхода = выбор конкретного итератора. */}
      <div className="flex flex-wrap gap-2">
        {ORDERS.map((o) => (
          <button
            key={o.id}
            onClick={() => setOrder(o.id)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              o.id === order
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
            ].join(" ")}
          >
            {o.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-400">
        Одна коллекция, разные итераторы. Сейчас:{" "}
        <span className="text-slate-200">{activeOrder.hint}</span>.
      </p>

      {/* Холст дерева. */}
      <div className="relative h-[290px] rounded-xl border border-slate-800 bg-slate-900/40">
        <svg
          viewBox="0 0 100 290"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {EDGES.map(([from, to]) => (
            <line
              key={`${from}-${to}`}
              x1={LAYOUT[from].x}
              y1={LAYOUT[from].y}
              x2={LAYOUT[to].x}
              y2={LAYOUT[to].y}
              stroke="currentColor"
              strokeWidth={0.4}
              className="text-slate-700"
            />
          ))}
        </svg>

        {Object.entries(LAYOUT).map(([value, pos]) => {
          const isCurrent = value === currentValue;
          const isVisited = visited.includes(value);
          const orderIndex = visited.indexOf(value);
          return (
            <div
              key={value}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.x}%`, top: pos.y }}
            >
              <div
                className={[
                  "flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg font-semibold transition-colors duration-300",
                  isCurrent
                    ? "border-indigo-400 bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : isVisited
                      ? "border-emerald-500/60 bg-emerald-600/20 text-emerald-300"
                      : "border-slate-700 bg-slate-800 text-slate-300",
                ].join(" ")}
              >
                {value}
              </div>
              {/* Порядковый номер выдачи итератором. */}
              {isVisited && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 text-[10px] font-bold text-slate-300 ring-1 ring-slate-700">
                  {orderIndex + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Накопленная последовательность — то, что вернул итератор. */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-500">next() →</span>
        <div className="flex flex-wrap gap-1.5">
          {visited.length === 0 ? (
            <span className="text-slate-600">— ещё ни одного вызова —</span>
          ) : (
            visited.map((value, i) => (
              <span
                key={i}
                className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-slate-200"
              >
                {value}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Плеер шагов. */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ◀ Назад
        </button>
        <button
          onClick={() => {
            if (finished) {
              setStep(0);
              return;
            }
            setStep((s) => Math.min(sequence.length, s + 1));
          }}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-slate-500"
        >
          {finished ? "⟲ Заново" : "Вперёд ▶"}
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={finished}
          className="rounded-lg border border-indigo-500 bg-indigo-600/20 px-3 py-1.5 text-sm font-medium text-indigo-200 transition-colors hover:bg-indigo-600/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {playing ? "❚❚ Пауза" : "▶ Авто"}
        </button>
        <span className="ml-auto text-sm text-slate-500">
          шаг {step} / {sequence.length}
        </span>
      </div>
    </div>
  );
}
