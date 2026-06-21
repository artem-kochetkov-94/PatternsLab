export function Explanation() {
  return (
    <div className="space-y-4 text-slate-300">
      <p>
        <strong className="text-white">Префиксные суммы (Prefix Sums)</strong> —
        приём, в котором заранее считают «накопленные суммы», чтобы потом
        отвечать на запросы суммы на отрезке (или в прямоугольнике) за{" "}
        <code className="rounded bg-slate-800 px-1">O(1)</code>. Предподсчёт
        делается один раз, а запросов может быть сколько угодно.
      </p>

      <div>
        <h3 className="font-semibold text-white">Сначала одномерный случай</h3>
        <p className="mt-2">
          Для массива строим{" "}
          <code className="rounded bg-slate-800 px-1">P[i] = a[0] + … + a[i−1]</code>{" "}
          (с нулём в начале). Тогда сумма на отрезке{" "}
          <code className="rounded bg-slate-800 px-1">[l, r]</code> — это просто{" "}
          <code className="rounded bg-slate-800 px-1">P[r+1] − P[l]</code>, без
          цикла.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">
          Задача: Range Sum Query 2D (LeetCode 304)
        </h3>
        <p className="mt-2">
          Та же идея в двух измерениях. Строим таблицу{" "}
          <code className="rounded bg-slate-800 px-1">P</code> размера{" "}
          <code className="rounded bg-slate-800 px-1">(m+1)×(n+1)</code>, где{" "}
          <code className="rounded bg-slate-800 px-1">P[i][j]</code> — сумма всего
          прямоугольника от угла <code className="rounded bg-slate-800 px-1">(0,0)</code>{" "}
          до <code className="rounded bg-slate-800 px-1">(i−1,j−1)</code>.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">Построение таблицы</h3>
        <p className="mt-2">Каждая клетка собирается из трёх соседних:</p>
        <pre className="mt-2 overflow-x-auto rounded bg-slate-800 p-3 text-xs text-slate-200">
{`P[i][j] = matrix[i-1][j-1]
        + P[i-1][j]      // сумма сверху
        + P[i][j-1]      // сумма слева
        - P[i-1][j-1]    // угол посчитан дважды`}
        </pre>
        <p className="mt-2">
          Лишние нулевые строка и столбец сверху/слева убирают проверки границ —
          поэтому таблица на единицу больше матрицы по каждой стороне.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">
          Запрос суммы — включения-исключения
        </h3>
        <p className="mt-2">
          Сумма прямоугольника{" "}
          <code className="rounded bg-slate-800 px-1">(r1,c1)…(r2,c2)</code>{" "}
          берётся четырьмя обращениями к <code className="rounded bg-slate-800 px-1">P</code>:
        </p>
        <pre className="mt-2 overflow-x-auto rounded bg-slate-800 p-3 text-xs text-slate-200">
{`sum = P[r2+1][c2+1]   // весь блок
    - P[r1][c2+1]     // минус полоса сверху
    - P[r2+1][c1]     // минус полоса слева
    + P[r1][c1]       // угол вычли дважды — вернуть`}
        </pre>
        <p className="mt-2">
          Это и есть формула включений-исключений: вычли две полосы, их общий
          угол ушёл в минус дважды, поэтому его прибавляем обратно.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">Сложность</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Предподсчёт —{" "}
            <code className="rounded bg-slate-800 px-1">O(m·n)</code>, память —{" "}
            <code className="rounded bg-slate-800 px-1">O(m·n)</code>.
          </li>
          <li>
            Каждый запрос — <code className="rounded bg-slate-800 px-1">O(1)</code>{" "}
            (против <code className="rounded bg-slate-800 px-1">O(площади)</code> у
            наивного перебора).
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Где ещё применяется приём</h3>
        <p className="mt-2">
          Subarray Sum Equals K, Range Sum Query 1D, разностный массив (difference
          array) для пакетных прибавлений на отрезках, подсчёт подмассивов с
          заданной суммой. Двумерный вариант — основа для задач на суммы
          подматриц и «максимальную сумму прямоугольника».
        </p>
      </div>
    </div>
  );
}
