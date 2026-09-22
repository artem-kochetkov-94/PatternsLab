export function Explanation() {
  return (
    <div className="space-y-4 text-slate-300">
      <p>
        <strong className="text-white">Классы баз данных</strong> — это не
        альтернатива «видам» (реляционная, документная, графовая, …), а
        независимые оси классификации поверх них. Один и тот же вид базы
        может относиться к разным классам: Redis — in-memory, но при этом
        обслуживает OLTP-нагрузку; PostgreSQL — persistent OLTP; ClickHouse —
        persistent OLAP.
      </p>

      <div>
        <h3 className="font-semibold text-white">OLTP / OLAP / HTAP</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>OLTP (Online Transaction Processing)</strong> — много
            мелких, быстрых транзакций: прочитать/изменить одну-две записи.
            Оптимизирован под задержку отклика.
          </li>
          <li>
            <strong>OLAP (Online Analytical Processing)</strong> — редкие, но
            тяжёлые запросы, сканирующие и агрегирующие огромные объёмы
            данных. Оптимизирован под пропускную способность, а не задержку.
          </li>
          <li>
            <strong>HTAP (Hybrid Transactional/Analytical Processing)</strong>{" "}
            — обе нагрузки одновременно поверх одних и тех же свежих данных,
            без отдельного ETL в аналитическое хранилище.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Где живут данные</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Persistent</strong> — данные хранятся на диске и обязаны
            пережить перезапуск процесса.
          </li>
          <li>
            <strong>In-memory</strong> — данные живут в оперативной памяти.
            Быстрее на порядки, но по умолчанию не переживает падение
            процесса — если нужна хоть какая-то надёжность, применяют
            периодические снимки на диск, журнал операций или репликацию
            состояния памяти на другие машины.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Ещё два узких класса</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Embedded database</strong> — база, встроенная прямо в
            процесс приложения, без отдельного сервера (SQLite, LevelDB).
          </li>
          <li>
            <strong>Single file database</strong> — частный случай embedded:
            вся база (схема + данные + индексы) — это один файл на диске.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Зачем это знать</h3>
        <p className="mt-2">
          Выбор технологии — это компромисс сразу по нескольким осям:
          транзакции, формат данных, характер обращений (OLTP/OLAP/HTAP),
          частота изменения схемы, зрелость сообщества, навыки команды. Класс
          БД — одна из этих осей, и её легко перепутать с «видом», хотя это
          независимые измерения одного и того же выбора.
        </p>
      </div>
    </div>
  );
}
