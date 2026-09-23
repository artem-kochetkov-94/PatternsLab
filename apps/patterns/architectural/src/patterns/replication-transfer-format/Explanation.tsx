export function Explanation() {
  return (
    <div className="space-y-4 text-slate-300">
      <p>
        Топология отвечает «кто пишет», синхронность — «когда клиент получает ACK». Этот паттерн
        — про третий, независимый вопрос: <strong className="text-white">как именно</strong>{" "}
        изменение физически доезжает с мастера до реплики.
      </p>

      <div>
        <h3 className="font-semibold text-white">Источник инициативы: Push vs Pull</h3>
        <p className="mt-2">
          <strong className="text-white">Push</strong> — мастер сам рассылает данные репликам
          (так делает PostgreSQL). Мастер обязан знать обо всех подписчиках.{" "}
          <strong className="text-white">Pull</strong> — реплики сами стягивают данные, когда им
          удобно (так делает MySQL). Реплика сама хранит свою позицию — если она отвалилась и
          вернулась, продолжит с того же места без вмешательства мастера.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">Что передаётся: SBR / RBR / Mixed</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong className="text-white">Statement-based (SBR)</strong> — передаются сами
            SQL-запросы, каждый заново исполняется на каждой ноде. Компактно, но опасно:
            недетерминированные функции (<code className="rounded bg-slate-800 px-1">random()</code>
            , <code className="rounded bg-slate-800 px-1">unix_timestamp()</code>) дадут на
            разных нодах разный результат.
          </li>
          <li>
            <strong className="text-white">Row-based (RBR)</strong> — передаются уже изменённые
            строки в бинарном виде. Надёжно (передаётся результат, а не инструкция), но тяжелее
            по трафику — особенно если запрос затронул сразу миллион строк. Можно настраивать{" "}
            <code className="rounded bg-slate-800 px-1">full</code> (вся строка) или{" "}
            <code className="rounded bg-slate-800 px-1">minimal</code> (только изменённые
            столбцы) режим.
          </li>
          <li>
            <strong className="text-white">Mixed</strong> — база сама переключается между SBR и
            RBR в зависимости от того, безопасен ли конкретный запрос для statement-based
            репликации.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Уровень: логическая vs физическая</h3>
        <p className="mt-2">
          <strong className="text-white">Логическая репликация</strong> работает с кортежами
          (тем же SBR/RBR) — она абстрагирована от формата хранения на диске. За счёт этого можно
          реплицировать между разными версиями СУБД и даже частично — только нужные таблицы
          (фильтрация).
        </p>
        <p className="mt-2">
          <strong className="text-white">Физическая репликация</strong> работает со страницами:
          slave — побайтовая копия master. Быстрее и надёжнее (движку не нужно ничего
          интерпретировать), но версии на обеих сторонах обязаны совпадать, и реплицируется
          всегда всё целиком.
        </p>
      </div>
    </div>
  );
}
