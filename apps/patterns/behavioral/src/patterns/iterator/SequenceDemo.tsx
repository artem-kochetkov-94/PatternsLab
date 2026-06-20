import { useMemo, useState } from "react";
import { filter, map, naturals, Range, take } from "./sequence";

/**
 * Демонстрирует протокол итерации JS на двух уровнях:
 *  1. Range — собственный итерируемый объект, работающий со spread/for...of.
 *  2. Ленивый конвейер поверх БЕСКОНЕЧНОГО источника: видно, что значения
 *     вычисляются по требованию, и лишнего не считается.
 */
export function SequenceDemo() {
  const [count, setCount] = useState(5);

  // Конвейер: натуральные → только нечётные → возводим в квадрат → берём count.
  // Источник бесконечен, но take() обрывает его, как только наберёт нужное.
  // Заодно считаем, сколько чисел РЕАЛЬНО вытянули из источника.
  const { values, pulled } = useMemo(() => {
    let pulledFromSource = 0;
    const counted = map(naturals(), (n) => {
      pulledFromSource++;
      return n;
    });
    const odds = filter(counted, (n) => n % 2 === 1);
    const squares = map(odds, (n) => n * n);
    const result = take(squares, count);
    return { values: result, pulled: pulledFromSource };
  }, [count]);

  // Range — тот же протокол, но без бесконечности: показываем spread.
  const rangeValues = useMemo(() => [...new Range(0, 10, 2)], []);

  return (
    <div className="space-y-6">
      {/* Блок 1: собственный итерируемый объект. */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white">
          Свой итерируемый объект
        </h3>
        <p className="text-sm text-slate-400">
          Класс <code className="rounded bg-slate-800 px-1">Range</code>{" "}
          реализует <code className="rounded bg-slate-800 px-1">[Symbol.iterator]</code>{" "}
          — и сразу работает со spread, <code className="rounded bg-slate-800 px-1">for…of</code>,{" "}
          деструктуризацией.
        </p>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 font-mono text-sm">
          <span className="text-slate-500">{"[...new Range(0, 10, 2)]"} → </span>
          <span className="text-emerald-300">[{rangeValues.join(", ")}]</span>
        </div>
      </div>

      {/* Блок 2: ленивый конвейер над бесконечным источником. */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">
          Ленивый конвейер над бесконечным источником
        </h3>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 font-mono text-xs leading-relaxed text-slate-300">
          <div>
            <span className="text-indigo-300">naturals()</span>{" "}
            <span className="text-slate-500">// 1, 2, 3, … ∞</span>
          </div>
          <div>
            .<span className="text-indigo-300">filter</span>(n =&gt; n % 2 === 1){" "}
            <span className="text-slate-500">// нечётные</span>
          </div>
          <div>
            .<span className="text-indigo-300">map</span>(n =&gt; n * n){" "}
            <span className="text-slate-500">// квадраты</span>
          </div>
          <div>
            .<span className="text-indigo-300">take</span>(
            <span className="text-amber-300">{count}</span>)
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-300">
          <span className="whitespace-nowrap">Взять элементов:</span>
          <input
            type="range"
            min={1}
            max={8}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="flex-1 accent-indigo-500"
          />
          <span className="w-6 text-right font-mono text-indigo-300">{count}</span>
        </label>

        <div className="flex flex-wrap gap-1.5">
          {values.map((v, i) => (
            <span
              key={i}
              className="rounded-md bg-indigo-600/20 px-2.5 py-1 font-mono text-sm text-indigo-200 ring-1 ring-indigo-500/40"
            >
              {v}
            </span>
          ))}
        </div>

        <p className="text-sm text-slate-400">
          Источник бесконечен, но из него реально вычислено лишь{" "}
          <span className="font-semibold text-emerald-300">{pulled}</span>{" "}
          чисел — ровно столько, сколько понадобилось, чтобы выдать{" "}
          <span className="font-semibold text-indigo-300">{count}</span>.
          Остальных «не существует», пока их не запросят.
        </p>
      </div>
    </div>
  );
}
