export function Explanation() {
  return (
    <div className="space-y-4 text-slate-300">
      <p>
        <strong className="text-white">Репликация</strong> — создание клона базы данных, чтобы
        он мог быстро подхватить функции повреждённой системы. Это не то же самое, что{" "}
        <strong className="text-white">бэкап</strong>: бэкап — снятая копия для восстановления
        после потери, репликация — живой, постоянно обновляемый клон.
      </p>

      <div>
        <h3 className="font-semibold text-white">Зачем нужна</h3>
        <p className="mt-2">
          Две независимые причины: <strong className="text-white">надёжность</strong> (если
          основная база умрёт, есть готовая копия) и{" "}
          <strong className="text-white">масштабирование чтения</strong> (часть запросов на
          чтение можно увести на реплики, разгрузив основной узел).
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">Master-Slave</h3>
        <p className="mt-2">
          Пишем только в мастер, читаем из слейвов или из мастера. При падении мастера —
          downtime на запись, пока кто-то не станет новым мастером (failover). Slave, который
          держат готовым к быстрому переключению, называют{" "}
          <strong className="text-white">hot standby</strong>: он либо асинхронный (мог немного
          отстать), либо синхронный (гарантированно не отстал).
        </p>
        <p className="mt-2">
          Опасный сценарий — <strong className="text-white">split brain</strong>: старый мастер
          «ожил» после failover, и в кластере оказалось два мастера одновременно, каждый со своей
          версией правды.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">Master-Master</h3>
        <p className="mt-2">
          Пишем в несколько мастеров сразу — падение одного не создаёт downtime на запись. Плата
          за это — конфликты, когда два мастера приняли разные значения для одного ключа.
          Разрешают их одним из способов: <strong className="text-white">LWW</strong> (last write
          wins — побеждает запись с более поздним таймстемпом),{" "}
          <strong className="text-white">ранг реплик</strong> (у одной реплики приоритет выше),
          решение на клиенте, либо <strong className="text-white">CRDT</strong> (Conflict-free
          Replicated Data Type — структура данных, которая умеет мержиться сама, без выбора
          «победителя»).
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">Master-less</h3>
        <p className="mt-2">
          Нет выделенной роли «мастер» — пишем в W узлов из N, читаем с R узлов из N. Формула
          решает, гарантирована ли согласованность:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong className="text-white">W + R &gt; N</strong> — гарантируется строгая
            согласованность: набор записи и набор чтения обязаны пересечься хотя бы в одном узле.
          </li>
          <li>
            <strong className="text-white">W + R ≤ N</strong> — согласованность не гарантируется,
            чтение может не увидеть последнюю запись.
          </li>
          <li>
            <strong className="text-white">R = 1, W = N</strong> — оптимизация под быстрое чтение
            (читаем с любого узла).
          </li>
          <li>
            <strong className="text-white">W = 1, R = N</strong> — оптимизация под быструю запись.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Итого</h3>
        <p className="mt-2">
          Master-Slave — просто и предсказуемо, но с downtime на запись при падении мастера.
          Master-Master убирает этот downtime ценой конфликтов. Master-less вообще уходит от
          понятия «мастер» и превращает вопрос согласованности в настройку двух чисел — W и R.
        </p>
      </div>
    </div>
  );
}
