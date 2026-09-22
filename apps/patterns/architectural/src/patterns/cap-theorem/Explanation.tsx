export function Explanation() {
  return (
    <div className="space-y-4 text-slate-300">
      <p>
        <strong className="text-white">CAP-теорема</strong>: в любой реализации распределённых
        вычислений можно обеспечить не более двух из трёх свойств — согласованность
        (Consistency), доступность (Availability), устойчивость к разделению сети (Partition
        tolerance).
      </p>

      <div>
        <h3 className="font-semibold text-white">Три буквы по отдельности</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong className="text-white">Consistency</strong> — данные во всех узлах одинаковы;
            любой запрос вернёт одно и то же значение независимо от того, к какому узлу он пришёл.
          </li>
          <li>
            <strong className="text-white">Availability</strong> — если запрос пришёл на живую
            ноду, он будет обработан за конечное время (нода не откажет молча).
          </li>
          <li>
            <strong className="text-white">Partition tolerance</strong> — система продолжает
            работать, несмотря на разрыв связи между частями кластера.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">Почему выбор на самом деле не из трёх</h3>
        <p className="mt-2">
          Наш мир не идеален — сети рвутся сами по себе, без спроса. Значит, P — не то свойство,
          от которого можно отказаться: раздел сети случится независимо от желания архитектора.
          Настоящий выбор происходит уже ПОСЛЕ разрыва, между оставшимися двумя:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong className="text-white">CP-система</strong> — разрешает читать, но не писать
            (или вообще отказывает в ответе) на той стороне разрыва, где не может гарантировать
            актуальность. Жертвует доступностью ради согласованности.
          </li>
          <li>
            <strong className="text-white">AP-система</strong> — разрешает и читать, и писать по
            обе стороны разрыва, рискуя разойтись в данных. Жертвует согласованностью ради
            доступности.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white">В демо рядом</h3>
        <p className="mt-2">
          Пока связь есть — Node B всегда актуальна. Разорви связь, запиши новое значение в Node
          A и попробуй прочитать с Node B: в режиме CP чтение откажет, в режиме AP — вернёт то,
          что у узла есть, даже если это уже не совпадает с Node A.
        </p>
      </div>
    </div>
  );
}
