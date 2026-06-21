export function Explanation() {
  return (
    <div className="space-y-4 text-slate-300">
      <p>
        <strong className="text-white">Сортировка слиянием (Merge Sort)</strong>{" "}
        — классический алгоритм по стратегии{" "}
        <strong>«разделяй и властвуй»</strong>. Массив рекурсивно делится пополам
        до кусочков из одного элемента (такой кусок уже отсортирован), а потом
        соседние отсортированные половины <strong>сливаются</strong> в одну
        большую отсортированную — за один линейный проход.
      </p>

      <div>
        <h3 className="font-semibold text-white">Идея решения</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong className="text-indigo-400">Разделение.</strong> Отрезок{" "}
            <code className="rounded bg-slate-800 px-1">[lo, hi)</code> делим по
            середине на <code className="rounded bg-slate-800 px-1">[lo, mid)</code>{" "}
            и <code className="rounded bg-slate-800 px-1">[mid, hi)</code> и
            сортируем каждую половину тем же приёмом.
          </li>
          <li>
            <strong className="text-emerald-400">Слияние.</strong> Идём двумя
            указателями <strong className="text-sky-400">i</strong> и{" "}
            <strong className="text-rose-400">j</strong> по головам половин и
            каждый раз забираем <strong>меньший</strong> элемент в результат.
            Когда одна половина кончилась — дописываем хвост второй (он уже
            отсортирован).
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Сложность</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Глубина деления —{" "}
            <code className="rounded bg-slate-800 px-1">log n</code> уровней, на
            каждом уровне суммарно <code className="rounded bg-slate-800 px-1">n</code>{" "}
            работы на слияния. Итог —{" "}
            <code className="rounded bg-slate-800 px-1">O(n·log n)</code> и в
            худшем, и в среднем случае (в отличие от быстрой сортировки, у которой
            худший случай <code className="rounded bg-slate-800 px-1">O(n²)</code>).
          </li>
          <li>
            Память — <code className="rounded bg-slate-800 px-1">O(n)</code> под
            буфер результата: это плата за стабильное время.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Устойчивость (stable)</h3>
        <p className="mt-2">
          При слиянии равные элементы берём из левой половины первыми (сравнение
          нестрогое <code className="rounded bg-slate-800 px-1">left[i] &lt;= right[j]</code>),
          поэтому относительный порядок равных значений сохраняется. На пресете
          «Дубликаты» это особенно заметно. Устойчивость важна, когда сортируешь
          объекты по одному полю, не ломая прежнюю сортировку по другому.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">Где применяется</h3>
        <p className="mt-2">
          Внешняя сортировка больших файлов (данные не влезают в память),
          сортировка связных списков (слияние не требует случайного доступа),
          подсчёт «инверсий» в массиве. Гибрид merge sort и вставок — это{" "}
          <strong>Timsort</strong>, стандартная сортировка в Python и в{" "}
          <code className="rounded bg-slate-800 px-1">Array.prototype.sort</code>{" "}
          у V8.
        </p>
      </div>
    </div>
  );
}
