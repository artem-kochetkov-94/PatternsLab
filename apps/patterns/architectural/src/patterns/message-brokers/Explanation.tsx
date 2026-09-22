export function Explanation() {
  return (
    <div className="space-y-4 text-slate-300">
      <p>
        <strong className="text-white">Брокер сообщений</strong> — узел
        между отправителем (producer) и получателем (consumer), который
        принимает сообщение и хранит его до доставки. Это даёт буферизацию
        (producer не ждёт, пока consumer освободится), асинхронную связь,
        слабое связывание (стороны не знают друг о друге напрямую) и
        независимое масштабирование обеих сторон.
      </p>

      <div>
        <h3 className="font-semibold text-white">
          Главный водораздел: кто инициирует доставку
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Kafka — pull</strong>. Consumer сам приходит и
            запрашивает следующую порцию сообщений начиная со своего
            оффсета, когда ему удобно. Сообщения в партиции при этом не
            удаляются — это лог, а не очередь: несколько разных consumer'ов
            могут читать один и тот же топик каждый со своей скоростью.
          </li>
          <li>
            <strong>RabbitMQ — push</strong>. Как только сообщение попало в
            очередь через exchange, брокер сам толкает его подписанному
            consumer'у. Прочитанное сообщение из очереди исчезает.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Термины Kafka</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Producer</strong> / <strong>Consumer</strong> — писатель
            и читатель.
          </li>
          <li>
            <strong>Broker</strong> — один узел кластера Kafka.
          </li>
          <li>
            <strong>Topic</strong> — логическая очередь; физически состоит
            из <strong>Partition</strong> — независимых, упорядоченных
            частей топика, за счёт которых Kafka параллелит чтение и запись.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Data retention и гарантии доставки</h3>
        <p className="mt-2">
          <strong>Data retention</strong> определяет, сколько времени (или
          места) брокер хранит сообщения, прежде чем их удалить, —
          политика, которую задаёт команда, а не техническое ограничение.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>At least once</strong> — сообщение доставится хотя бы
            один раз (возможны дубли при повторной отправке после сбоя).
          </li>
          <li>
            <strong>At most once</strong> — доставится не более одного раза
            (возможна потеря, зато без дублей).
          </li>
          <li>
            <strong>Exactly once</strong> — доставится ровно один раз;
            самая дорогая гарантия, обычно требует идемпотентности на
            стороне consumer'а.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Где встречается на практике</h3>
        <p className="mt-2">
          Kafka — event sourcing, стриминг аналитики, лог всех событий
          системы, когда важно, чтобы разные consumer'ы читали одну и ту же
          историю независимо. RabbitMQ — классические очереди задач
          (отправка email, обработка платежей), где важна именно доставка
          конкретному обработчику, а не хранение истории.
        </p>
      </div>
    </div>
  );
}
