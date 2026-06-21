export function Explanation() {
  return (
    <div className="space-y-4 text-slate-300">
      <p>
        <strong className="text-white">Стек (Stack)</strong> — структура «последним
        пришёл, первым ушёл» (<strong>LIFO</strong>): кладём и снимаем элементы
        только с одного конца — вершины. Он незаменим там, где есть{" "}
        <strong>вложенность</strong>: скобки, теги, вызовы функций — всегда
        закрывается то, что открыли последним. Поэтому многие задачи на парность
        решаются стеком за один проход{" "}
        <code className="rounded bg-slate-800 px-1">O(n)</code>.
      </p>

      <div>
        <h3 className="font-semibold text-white">
          Задача: Minimum Remove to Make Valid Parentheses (LeetCode 1249)
        </h3>
        <p className="mt-2">
          Дана строка из <code className="rounded bg-slate-800 px-1">(</code>,{" "}
          <code className="rounded bg-slate-800 px-1">)</code> и строчных букв.
          Нужно удалить <strong>минимум</strong> скобок так, чтобы оставшиеся были
          корректно сбалансированы, и вернуть любую такую строку.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">Идея решения</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            На стеке держим{" "}
            <strong className="text-sky-400">индексы открытых «(»</strong>, у
            которых ещё нет пары.
          </li>
          <li>
            Встретили <code className="rounded bg-slate-800 px-1">(</code> — кладём
            её индекс на стек (ждём закрывающую).
          </li>
          <li>
            Встретили <code className="rounded bg-slate-800 px-1">)</code> — если
            стек не пуст, снимаем вершину: пара нашлась. Если пуст — закрывать
            нечего, эта{" "}
            <code className="rounded bg-slate-800 px-1">)</code> лишняя, помечаем
            на удаление.
          </li>
          <li>
            Буквы пропускаем — на баланс скобок они не влияют.
          </li>
          <li>
            После прохода всё, что осталось на стеке, — это{" "}
            <strong className="text-rose-400">«(» без пары</strong>: тоже на
            удаление.
          </li>
          <li>
            Собираем строку, пропуская помеченные индексы.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Почему именно стек</h3>
        <p className="mt-2">
          Скобки вложены по принципу LIFO: при встрече{" "}
          <code className="rounded bg-slate-800 px-1">)</code> в пару ей идёт{" "}
          <strong>самая последняя</strong> из ещё открытых{" "}
          <code className="rounded bg-slate-800 px-1">(</code> — ровно та, что
          лежит на вершине. Хранить именно <strong>индексы</strong> (а не сами
          символы) удобно: на финале мы точно знаем, какие позиции исходной строки
          выкинуть.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">Подводные камни</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Нельзя удалять лишние{" "}
            <code className="rounded bg-slate-800 px-1">)</code> «на лету» из
            строки — индексы поедут. Помечаем позиции и собираем результат одним
            проходом в конце.
          </li>
          <li>
            Не забыть второй источник лишних скобок — открытые «(», оставшиеся на
            стеке после прохода.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Где ещё применяется приём</h3>
        <p className="mt-2">
          Valid Parentheses (LC 20), Generate Parentheses, вычисление выражений в
          обратной польской записи (LC 150), Basic Calculator. Отдельная большая
          ветка — <strong>монотонный стек</strong>: Daily Temperatures (LC 739),
          Next Greater Element, Largest Rectangle in Histogram, Trapping Rain
          Water.
        </p>
      </div>
    </div>
  );
}
