export function Explanation() {
  return (
    <div className="space-y-4 text-slate-300">
      <p>
        <strong className="text-white">Интервалы (Intervals)</strong> — большой
        класс задач, где данные — это отрезки{" "}
        <code className="rounded bg-slate-800 px-1">[start, end]</code>: встречи,
        бронирования, отрезки на прямой. Почти все они решаются после одной
        подготовки — <strong>сортировки</strong> отрезков по началу или по концу,
        — после чего достаточно одного прохода.
      </p>

      <div>
        <h3 className="font-semibold text-white">
          Задача: Meeting Rooms II (LeetCode 253)
        </h3>
        <p className="mt-2">
          Дан список встреч, каждая — отрезок времени{" "}
          <code className="rounded bg-slate-800 px-1">[start, end)</code>. Сколько
          минимум переговорок нужно, чтобы провести их все, не пересекая две
          встречи в одной комнате?
        </p>
        <p className="mt-2">
          Ключ к задаче: минимальное число комнат равно{" "}
          <strong>максимальному числу встреч, идущих одновременно</strong> — то
          есть «пику загруженности» на временной оси.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">
          Метод развёртки / метод точек (sweep line)
        </h3>
        <p className="mt-2">Именно его показывает демо рядом:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Каждый отрезок разбиваем на два <strong>события</strong>:{" "}
            <code className="rounded bg-slate-800 px-1">+1</code> в точке начала и{" "}
            <code className="rounded bg-slate-800 px-1">−1</code> в точке конца.
          </li>
          <li>
            Все события <strong>сортируем по времени</strong> и идём слева
            направо, поддерживая счётчик активных встреч.
          </li>
          <li>
            <strong>Максимум</strong> этого счётчика за весь проход и есть ответ.
          </li>
          <li>
            Тонкость стыков: при равном времени «конец» обрабатываем раньше
            «начала», иначе встреча{" "}
            <code className="rounded bg-slate-800 px-1">[0,10]</code> ложно
            «пересечётся» с <code className="rounded bg-slate-800 px-1">[10,20]</code>.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Другие способы той же задачи</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Куча (min-heap):</strong> сортируем встречи по началу и
            держим в куче времена окончания занятых комнат. Перед каждой новой
            встречей выкидываем из кучи все комнаты, что уже освободились; размер
            кучи — текущее число комнат, а её максимум — ответ.
          </li>
          <li>
            <strong>Два массива:</strong> отдельно сортируем все начала и все
            концы, затем двумя указателями шагаем по ним — это та же развёртка,
            записанная иначе.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Метод слияния (merge)</h3>
        <p className="mt-2">
          Второй режим демо (переключатель сверху) — задача «Merge Intervals»
          (LeetCode 56): отрезки сортируют по началу и идут по списку,{" "}
          <strong>сливая</strong> каждый следующий с предыдущим, если они
          перекрываются или касаются (
          <code className="rounded bg-slate-800 px-1">next.start ≤ cur.end</code>),
          расширяя конец. Так из множества пересекающихся отрезков получают
          непрерывные «острова».
        </p>
        <p className="mt-2">
          Обрати внимание на разницу со стыками: в Meeting Rooms касание{" "}
          <code className="rounded bg-slate-800 px-1">[0,10]</code> и{" "}
          <code className="rounded bg-slate-800 px-1">[10,20]</code> —{" "}
          <strong>не</strong> пересечение (условие строгое), а в Merge —{" "}
          <strong>сливается</strong> (условие нестрогое). Тот же шаблон лежит в
          основе «Insert Interval» и «Interval List Intersections».
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">Сложность</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Время —{" "}
            <code className="rounded bg-slate-800 px-1">O(n·log n)</code> на
            сортировку событий; сам проход линейный.
          </li>
          <li>
            Память — <code className="rounded bg-slate-800 px-1">O(n)</code> на
            события (или на кучу).
          </li>
        </ul>
      </div>
    </div>
  );
}
