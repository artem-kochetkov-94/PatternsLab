export function Explanation() {
  return (
    <div className="space-y-4 text-slate-300">
      <p>
        <strong className="text-white">Iterator (Итератор)</strong> —
        поведенческий паттерн, который даёт единый способ последовательно
        перебирать элементы коллекции, <strong>не раскрывая</strong> её
        внутреннее устройство (массив это, дерево, связный список или вообще
        бесконечный поток). Логика обхода выносится из коллекции в отдельный
        объект-итератор.
      </p>

      <div>
        <h3 className="font-semibold text-white">Когда применять</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Когда нужно обходить сложную структуру (дерево, граф), скрыв от
            клиента детали её устройства.
          </li>
          <li>
            Когда у одной коллекции должно быть несколько способов обхода — и
            возможность идти по ней несколькими итераторами одновременно.
          </li>
          <li>
            Когда хочется единый интерфейс перебора для разных структур данных,
            чтобы клиентский код не зависел от их типа.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Из чего состоит</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Iterator</strong> — интерфейс обхода:{" "}
            <code className="rounded bg-slate-800 px-1">hasNext</code> и{" "}
            <code className="rounded bg-slate-800 px-1">next</code>.
          </li>
          <li>
            <strong>ConcreteIterator</strong> — конкретная стратегия обхода.
            Хранит позицию обхода (стек, очередь, индекс) и знает, как добраться
            до следующего элемента.
          </li>
          <li>
            <strong>Aggregate (Коллекция)</strong> — интерфейс с фабричным
            методом <code className="rounded bg-slate-800 px-1">createIterator</code>.
          </li>
          <li>
            <strong>ConcreteAggregate</strong> — конкретная коллекция (наше
            дерево), которая умеет выдавать подходящие итераторы.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Две грани (см. вкладку «Демо»)</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Обход дерева</strong> — одно двоичное дерево и четыре
            итератора (pre-/in-/post-order и BFS). Коллекция одна, а порядок
            выдачи задаёт выбранный итератор; код, который крутит{" "}
            <code className="rounded bg-slate-800 px-1">hasNext/next</code>, при
            этом не меняется.
          </li>
          <li>
            <strong>Протокол итерации JS</strong> — тот же паттерн встроен в
            язык: объект с <code className="rounded bg-slate-800 px-1">[Symbol.iterator]</code>{" "}
            работает с <code className="rounded bg-slate-800 px-1">for…of</code>,
            spread и деструктуризацией. Генераторы дают <em>ленивый</em> обход:
            из бесконечного источника вычисляется ровно столько, сколько
            запросили.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Где встречается на практике</h3>
        <p className="mt-2">
          Встроенный протокол итерации JS (
          <code className="rounded bg-slate-800 px-1">Symbol.iterator</code>,
          генераторы, <code className="rounded bg-slate-800 px-1">for…of</code>),
          обход <code className="rounded bg-slate-800 px-1">Map</code>/
          <code className="rounded bg-slate-800 px-1">Set</code> и DOM-коллекций
          (<code className="rounded bg-slate-800 px-1">NodeList</code>), ленивые
          последовательности и пагинация (постраничная подгрузка как поток
          элементов), курсоры в базах данных.
        </p>
      </div>
    </div>
  );
}
