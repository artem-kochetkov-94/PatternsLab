export function Explanation() {
  return (
    <div className="space-y-4 text-slate-300">
      <p>
        <strong className="text-white">Кэширование</strong> — архитектурный
        паттерн, при котором результат "дорогого" запроса (в БД, к внешнему
        сервису, тяжёлое вычисление) сохраняется в быстром хранилище, чтобы
        повторные обращения не платили ту же цену снова. Задача кэша —
        ускорить ответ, а не заменить собой способность системы держать
        нагрузку без него.
      </p>

      <div>
        <h3 className="font-semibold text-white">Основные термины</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Cache hit / miss</strong> — попадание (ключ нашёлся) или
            промах (не нашёлся, идём к первоисточнику).
          </li>
          <li>
            <strong>Hit ratio</strong> — доля попаданий; чем выше, тем
            эффективнее кэш.
          </li>
          <li>
            <strong>Инвалидация</strong> — удаление устаревших данных из
            кэша; самая сложная часть кэширования на практике.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">
          Cache-Aside vs Cache-Through
        </h3>
        <p className="mt-2">
          Разница не в результате, а в том, <em>кто</em> ходит в БД. В
          демо рядом это видно по маршруту запроса на диаграмме:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Cache-Aside</strong> — сервис сам решает: сходил в кэш,
            не нашёл — сам идёт в БД и сам же кладёт результат в кэш. Кэш
            "не знает" про БД вообще.
          </li>
          <li>
            <strong>Cache-Through</strong> (Read Through + Write Through) —
            сервис ходит только в кэш; при промахе кэш сам обращается к БД
            и сохраняет результат. Сервис про БД не знает вообще.
          </li>
        </ul>
        <p className="mt-2">
          Есть и третий вариант — <strong>Cache-Ahead</strong>: запросы на
          чтение всегда идут только в кэш, а кэш периодически (не по
          запросу) сам обновляется из БД в фоне.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">Вытеснение (LRU)</h3>
        <p className="mt-2">
          Кэш ограничен по объёму, поэтому нужна стратегия вытеснения. В
          демо — <strong>LRU (Least Recently Used)</strong>: вытесняется
          ключ, к которому дольше всего не обращались. Другие частые
          варианты: <strong>LFU</strong> (реже всего используемый),{" "}
          <strong>MRU</strong> (наоборот, самый недавний — для специфичных
          сценариев), <strong>TLRU</strong> (LRU + TTL).
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">Где встречается на практике</h3>
        <p className="mt-2">
          Redis / Memcached перед базой данных, HTTP-кэш в браузере и на
          CDN, кэш вычисленных данных внутри сервиса (in-memory), кэш
          результатов внешних API-вызовов.
        </p>
      </div>
    </div>
  );
}
