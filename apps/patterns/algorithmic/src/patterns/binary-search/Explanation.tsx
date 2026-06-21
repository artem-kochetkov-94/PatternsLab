export function Explanation() {
  return (
    <div className="space-y-4 text-slate-300">
      <p>
        <strong className="text-white">Бинарный поиск (Binary Search)</strong> —
        приём поиска в <strong>отсортированных</strong> данных: на каждом шаге
        смотрим середину диапазона и по одному сравнению отбрасываем целую
        половину кандидатов. Диапазон сокращается вдвое за шаг, поэтому всего{" "}
        <code className="rounded bg-slate-800 px-1">O(log n)</code> сравнений
        вместо <code className="rounded bg-slate-800 px-1">O(n)</code> у линейного
        перебора.
      </p>

      <div>
        <h3 className="font-semibold text-white">
          Задача: Binary Search (LeetCode 704)
        </h3>
        <p className="mt-2">
          Дан отсортированный по возрастанию массив и число{" "}
          <code className="rounded bg-slate-800 px-1">target</code>. Нужно вернуть
          его индекс или <code className="rounded bg-slate-800 px-1">−1</code>,
          если такого числа нет.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">Идея решения</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Держим границы диапазона{" "}
            <strong className="text-sky-400">low</strong> и{" "}
            <strong className="text-rose-400">high</strong>; берём середину{" "}
            <strong className="text-amber-400">mid</strong>.
          </li>
          <li>
            <code className="rounded bg-slate-800 px-1">nums[mid] === target</code>{" "}
            — нашли, выходим.
          </li>
          <li>
            <code className="rounded bg-slate-800 px-1">nums[mid] &lt; target</code>{" "}
            — target правее, сдвигаем{" "}
            <code className="rounded bg-slate-800 px-1">low = mid + 1</code>.
          </li>
          <li>
            <code className="rounded bg-slate-800 px-1">nums[mid] &gt; target</code>{" "}
            — target левее, сдвигаем{" "}
            <code className="rounded bg-slate-800 px-1">high = mid − 1</code>.
          </li>
          <li>
            Повторяем, пока <code className="rounded bg-slate-800 px-1">low ≤ high</code>.
            Как только границы разошлись — числа нет.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Подводные камни</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Середину берут как{" "}
            <code className="rounded bg-slate-800 px-1">low + (high − low) / 2</code>{" "}
            (или сдвигом <code className="rounded bg-slate-800 px-1">(low + high) &gt;&gt; 1</code>),
            чтобы не переполнить сумму в языках с фиксированным int.
          </li>
          <li>
            Главный источник багов — границы: строгое или нестрогое сравнение,
            <code className="rounded bg-slate-800 px-1">mid</code> или{" "}
            <code className="rounded bg-slate-800 px-1">mid ± 1</code>. Диапазон на
            каждом шаге обязан сокращаться, иначе цикл зависнет.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">
          Варианты: левая и правая граница (переключатель в демо)
        </h3>
        <p className="mt-2">
          Куда полезнее на интервью — искать не точное совпадение, а{" "}
          <strong>границу</strong> на полуинтервале{" "}
          <code className="rounded bg-slate-800 px-1">[low, high)</code> (ответ —
          индекс от <code className="rounded bg-slate-800 px-1">0</code> до{" "}
          <code className="rounded bg-slate-800 px-1">n</code>, может быть и за
          концом массива):
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong className="text-white">lower bound</strong> — первый индекс с{" "}
            <code className="rounded bg-slate-800 px-1">nums[i] ≥ target</code>.
            Сравнение строгое (<code className="rounded bg-slate-800 px-1">&lt;</code>):
            равные target элементы остаются справа от границы.
          </li>
          <li>
            <strong className="text-white">upper bound</strong> — первый индекс с{" "}
            <code className="rounded bg-slate-800 px-1">nums[i] &gt; target</code>.
            Сравнение нестрогое (<code className="rounded bg-slate-800 px-1">≤</code>):
            равные target уходят влево.
          </li>
        </ul>
        <p className="mt-2">
          Разница ровно в одном символе сравнения, но именно из неё растёт куча
          задач. Например, на пресете «Дубликаты: 4» видно, что{" "}
          <code className="rounded bg-slate-800 px-1">upperBound − lowerBound</code>{" "}
          = <strong>количество вхождений</strong> target в массив. Через границы
          решаются Search Insert Position и First/Last Position of Element.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">Где ещё применяется приём</h3>
        <p className="mt-2">
          Search Insert Position, First/Last Position of Element, поиск в
          повёрнутом массиве, «бинпоиск по ответу» (минимальная скорость/размер,
          при которой условие выполнимо — Koko Eating Bananas, Capacity to Ship
          Packages), извлечение квадратного корня.
        </p>
      </div>
    </div>
  );
}
