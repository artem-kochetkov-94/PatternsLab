export function Explanation() {
  return (
    <div className="space-y-4 text-slate-300">
      <p>
        <strong className="text-white">CQRS</strong> (Command Query Responsibility Segregation) —
        разделить путь записи (Command) и путь чтения (Query) на разные сервисы, вместо одного
        сервиса, отвечающего за оба.
      </p>

      <div>
        <h3 className="font-semibold text-white">Зачем</h3>
        <p className="mt-2">
          Чтение и запись почти всегда нагружены по-разному — обычно читают на порядки чаще, чем
          пишут, — и требуют разной оптимизации схемы данных. Модель, удобная для записи
          (нормализованная, с проверками целостности), редко бывает удобна для чтения
          (денормализованная, готовая к быстрой отдаче).
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-white">Что это даёт</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong className="text-white">Независимое масштабирование</strong> — Reader'ов можно
            поднять в 10 раз больше, чем Writer'ов, если читают в 10 раз чаще, чем пишут.
          </li>
          <li>
            <strong className="text-white">Разные хранилища</strong> — Writer может писать в
            строгую реляционную БД, а Reader — читать из денормализованной проекции или даже из
            другого движка (например, поисковый индекс).
          </li>
          <li>
            <strong className="text-white">Разные модели данных</strong> — команда на запись и
            результат чтения не обязаны быть одной и той же структурой.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Цена</h3>
        <p className="mt-2">
          Если Reader читает из отдельной, реплицируемой проекции — между записью и её появлением
          в Reader неизбежна задержка (тот же replication lag, что и у обычной репликации).
          Дополнительная инфраструктурная сложность тоже никуда не девается — двух сервисов вместо
          одного нужно деплоить, мониторить и поддерживать.
        </p>
      </div>
    </div>
  );
}
