export function Explanation() {
  return (
    <div className="space-y-4 text-slate-300">
      <p>
        <strong className="text-white">Стек (Stack)</strong> — структура «последним
        пришёл, первым ушёл» (<strong>LIFO</strong>): кладём и снимаем элементы
        только с одного конца — вершины. Он незаменим там, где есть{" "}
        <strong>вложенность</strong> или нужно помнить «ещё не закрытые» элементы:
        скобки, теги, вызовы функций, поиск ближайшего большего. В демо — две
        классические задачи на стек (переключатель сверху).
      </p>

      <div>
        <h3 className="font-semibold text-white">
          Задача 1: Minimum Remove to Make Valid Parentheses (LeetCode 1249)
        </h3>
        <p className="mt-2">
          Дана строка из <code className="rounded bg-slate-800 px-1">(</code>,{" "}
          <code className="rounded bg-slate-800 px-1">)</code> и строчных букв.
          Нужно удалить <strong>минимум</strong> скобок так, чтобы оставшиеся были
          корректно сбалансированы, и вернуть любую такую строку.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            На стеке держим{" "}
            <strong className="text-sky-400">индексы открытых «(»</strong> без
            пары.
          </li>
          <li>
            Встретили <code className="rounded bg-slate-800 px-1">(</code> — кладём
            индекс на стек; встретили{" "}
            <code className="rounded bg-slate-800 px-1">)</code> — снимаем вершину
            (пара нашлась) либо, если стек пуст, помечаем эту{" "}
            <code className="rounded bg-slate-800 px-1">)</code> на удаление.
          </li>
          <li>
            После прохода всё, что осталось на стеке, —{" "}
            <strong className="text-rose-400">«(» без пары</strong>: тоже на
            удаление. Собираем строку, пропуская помеченные индексы.
          </li>
        </ul>
        <p className="mt-2 text-sm text-slate-400">
          Почему стек: скобки вложены по LIFO — в пару к{" "}
          <code className="rounded bg-slate-800 px-1">)</code> идёт самая последняя
          из открытых, ровно та, что на вершине.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">
          Задача 2: Daily Temperatures (LeetCode 739) — монотонный стек
        </h3>
        <p className="mt-2">
          Дан массив дневных температур. Для каждого дня нужно узнать, через
          сколько дней станет <strong>теплее</strong> (или{" "}
          <code className="rounded bg-slate-800 px-1">0</code>, если потепления
          впереди нет).
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            На стеке — индексы дней, <strong>ждущих потепления</strong>; их
            температуры идут по убыванию от дна к вершине. Такой стек называют{" "}
            <strong className="text-white">монотонным</strong>.
          </li>
          <li>
            Пришёл день теплее вершины — значит для неё потепление наступило именно
            сегодня: снимаем день со стека и пишем{" "}
            <code className="rounded bg-slate-800 px-1">i − day</code>. Повторяем,
            пока вершина холоднее текущего дня.
          </li>
          <li>
            Затем кладём текущий день на стек — теперь уже он ждёт своего
            потепления.
          </li>
        </ul>
        <p className="mt-2 text-sm text-slate-400">
          Каждый день кладётся и снимается со стека ровно один раз — отсюда{" "}
          <code className="rounded bg-slate-800 px-1">O(n)</code> вместо{" "}
          <code className="rounded bg-slate-800 px-1">O(n²)</code> у наивного
          поиска первого большего справа.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">Подводные камни</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Скобки:</strong> не удалять лишние «на лету» — индексы поедут;
            помечаем позиции и собираем результат одним проходом в конце. И не
            забыть второй источник лишних — открытые «(», оставшиеся на стеке.
          </li>
          <li>
            <strong>Монотонный стек:</strong> важна строгость сравнения. Здесь{" "}
            <code className="rounded bg-slate-800 px-1">&gt;</code> (строго теплее)
            — при равных температурах день остаётся ждать; для других задач знак
            подбирают под условие.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Где ещё применяется приём</h3>
        <p className="mt-2">
          Парность и вложенность — Valid Parentheses (LC 20), Generate Parentheses,
          обратная польская запись (LC 150), Basic Calculator. Монотонный стек —
          Next Greater Element, Largest Rectangle in Histogram, Trapping Rain
          Water. Также стек лежит в основе обхода в глубину (DFS) без рекурсии и
          истории «отмен» (Undo).
        </p>
      </div>
    </div>
  );
}
