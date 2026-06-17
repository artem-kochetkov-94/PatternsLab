export function Explanation() {
  return (
    <div className="space-y-4 text-slate-300">
      <p>
        <strong className="text-white">Chain of Responsibility (Цепочка
        обязанностей)</strong>{" "}
        — поведенческий паттерн, который позволяет передавать запрос по цепочке
        обработчиков. Каждый обработчик решает сам: обработать запрос или
        передать его следующему звену. Отправитель не знает заранее, кто именно
        справится с запросом.
      </p>

      <div>
        <h3 className="font-semibold text-white">Когда применять</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Когда запрос могут обработать разные объекты, а конкретный
            обработчик заранее неизвестен и определяется в рантайме.
          </li>
          <li>
            Когда набор и порядок обработчиков должны легко меняться — звенья
            можно добавлять, убирать и переставлять, не трогая отправителя.
          </li>
          <li>
            Когда важно избежать жёсткой привязки отправителя запроса к его
            получателю.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Из чего состоит</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Handler (Approver)</strong> — звено цепочки. Хранит ссылку
            на следующее звено (<code className="rounded bg-slate-800 px-1">setNext</code>)
            и умеет либо обработать запрос, либо делегировать его дальше (
            <code className="rounded bg-slate-800 px-1">handle</code>).
          </li>
          <li>
            <strong>Request</strong> — запрос, который путешествует по цепочке.
          </li>
          <li>
            <strong>Client</strong> — собирает цепочку и отдаёт запрос её
            первому звену, не зная, кто его в итоге обработает.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Стратегии (см. вкладку «Демо»)</h3>
        <p className="mt-2">
          Цепочка всегда устроена одинаково (звенья связаны, запрос идёт по
          ним), а вот <em>когда звено передаёт запрос дальше и когда цепочка
          останавливается</em> — это решение и задаёт поведение:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>First-match</strong> — первый, кто способен обработать
            запрос, обрабатывает его и обрывает цепочку. Так работают обработка
            исключений, выдача купюр в банкомате, эскалация тикета.
          </li>
          <li>
            <strong>Fail-fast</strong> — запрос проходит проверки, но на первой
            же неудаче цепочка прерывается. Типично для валидации, где нет
            смысла продолжать после первой ошибки.
          </li>
          <li>
            <strong>Collect-all (пайплайн)</strong> — запрос проходит цепочку до
            конца независимо от результата; звенья копят итог или обогащают
            запрос. Так устроены middleware и валидация, собирающая все ошибки.
          </li>
        </ul>
        <p className="mt-2 text-sm text-slate-400">
          Замечание: «чистым» Chain of Responsibility обычно называют именно
          first-match; collect-all-вариант часто выделяют в отдельный паттерн
          Pipeline / Intercepting Filter.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">Где встречается на практике</h3>
        <p className="mt-2">
          Middleware в Express/Koa и Redux (
          <code className="rounded bg-slate-800 px-1">next()</code>), пайплайны
          обработки HTTP-запросов, всплытие DOM-событий по дереву, цепочки
          валидаторов и interceptor-ы в HTTP-клиентах.
        </p>
      </div>
    </div>
  );
}
