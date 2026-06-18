export function Explanation() {
  return (
    <div className="space-y-4 text-slate-300">
      <p>
        <strong className="text-white">Два указателя (Two Pointers)</strong> —
        алгоритмический приём, в котором по структуре данных (чаще массиву или
        строке) одновременно движутся два индекса. Грамотно выбрав направление и
        правило их сдвига, многие задачи удаётся решить за один проход{" "}
        <code className="rounded bg-slate-800 px-1">O(n)</code> и без
        дополнительной памяти — там, где «в лоб» получаются вложенные циклы{" "}
        <code className="rounded bg-slate-800 px-1">O(n²)</code> или лишняя
        сортировка.
      </p>

      <div>
        <h3 className="font-semibold text-white">
          Задача: Squares of a Sorted Array (LeetCode 977)
        </h3>
        <p className="mt-2">
          Дан массив, отсортированный по возрастанию (возможны отрицательные
          числа). Нужно вернуть массив квадратов его элементов, тоже
          отсортированный по возрастанию.
        </p>
        <p className="mt-2">
          Сложность в том, что после возведения в квадрат отрицательные числа
          «переворачивают» порядок: у <code className="rounded bg-slate-800 px-1">[-4, -1, 0, 3, 10]</code>{" "}
          самый большой квадрат даёт <strong>крайний левый</strong> элемент
          (−4), а не правый.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">Идея решения</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Наибольший квадрат всегда находится на одном из{" "}
            <strong>краёв</strong> массива — либо самое отрицательное число
            слева, либо самое большое справа.
          </li>
          <li>
            Ставим указатель <strong className="text-sky-400">L</strong> в начало,{" "}
            <strong className="text-rose-400">R</strong> в конец и сравниваем их
            модули.
          </li>
          <li>
            Больший по модулю элемент возводим в квадрат и кладём в{" "}
            <strong>конец</strong> результата, после чего сдвигаем
            соответствующий указатель внутрь.
          </li>
          <li>
            Повторяем, пока указатели не сойдутся. Результат заполняется справа
            налево — сразу в нужном порядке.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Сложность</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Время — <code className="rounded bg-slate-800 px-1">O(n)</code>:
            каждый элемент просматривается ровно один раз (против{" "}
            <code className="rounded bg-slate-800 px-1">O(n·log n)</code> у
            наивного «возвести и пересортировать»).
          </li>
          <li>
            Память — <code className="rounded bg-slate-800 px-1">O(n)</code> под
            ответ (или <code className="rounded bg-slate-800 px-1">O(1)</code>{" "}
            сверх ответа).
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Где ещё применяется приём</h3>
        <p className="mt-2">
          Two Sum на отсортированном массиве, проверка палиндрома, разворот
          массива/строки на месте, слияние двух отсортированных массивов,
          удаление дубликатов, контейнер с наибольшей водой. Близкий
          родственник — «скользящее окно» (sliding window), где оба указателя
          двигаются в одну сторону.
        </p>
      </div>
    </div>
  );
}
