export function Explanation() {
  return (
    <div className="space-y-4 text-slate-300">
      <p>
        <strong className="text-white">Observer (Наблюдатель)</strong> — это
        поведенческий паттерн, который задаёт связь «один ко многим»: один объект
        (<em>субъект</em>) при изменении своего состояния автоматически уведомляет
        всех зависимых от него объектов (<em>наблюдателей</em>).
      </p>

      <div>
        <h3 className="font-semibold text-white">Когда применять</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Когда изменение одного объекта должно повлечь изменения в других, но
            вы не хотите жёстко связывать их между собой.
          </li>
          <li>
            Когда набор объектов-слушателей заранее неизвестен или меняется во
            время работы.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Из чего состоит</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Subject</strong> — хранит состояние и список подписчиков,
            умеет уведомлять их об изменениях.
          </li>
          <li>
            <strong>Observer</strong> — интерфейс с методом{" "}
            <code className="rounded bg-slate-800 px-1">update()</code>, который
            субъект вызывает при изменениях.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Где встречается на практике</h3>
        <p className="mt-2">
          DOM-события (<code className="rounded bg-slate-800 px-1">addEventListener</code>
          ), RxJS-потоки, реактивность в MobX и Vue, паттерн pub/sub в шинах
          событий.
        </p>
      </div>
    </div>
  );
}
