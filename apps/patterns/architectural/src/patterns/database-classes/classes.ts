/**
 * Классы баз данных — не альтернатива "видам" (реляционная/документная/
 * графовая/…), а ДВЕ ОРТОГОНАЛЬНЫЕ оси классификации поверх них: какая
 * нагрузка (OLTP/OLAP/HTAP) и где физически живут данные (Persistent/
 * In-memory). Redis, например, — in-memory, но при этом обслуживает OLTP-
 * нагрузку; PostgreSQL — persistent OLTP; ClickHouse — persistent OLAP.
 * Формат — не диаграмма, а классификация: сценарий → к какому классу он
 * относится и почему.
 */

export type OltpAxis = "oltp" | "olap" | "htap";

export const OLTP_OPTIONS: { id: OltpAxis; label: string }[] = [
  { id: "oltp", label: "OLTP" },
  { id: "olap", label: "OLAP" },
  { id: "htap", label: "HTAP" },
];

export interface QuizItem<T extends string> {
  id: number;
  prompt: string;
  answer: T;
  explanation: string;
}

export const OLTP_QUIZ: QuizItem<OltpAxis>[] = [
  {
    id: 1,
    prompt: "Списать деньги со счёта при оплате картой на кассе.",
    answer: "oltp",
    explanation:
      "Короткая транзакция, читает и пишет одну-две записи, критична скорость отклика — классический OLTP.",
  },
  {
    id: 2,
    prompt: "Построить отчёт «выручка по регионам за последний квартал».",
    answer: "olap",
    explanation:
      "Агрегирует миллионы строк сразу, отклик может занимать секунды — классический OLAP.",
  },
  {
    id: 3,
    prompt:
      "Показать клиенту баланс счёта в приложении банка прямо сейчас — и тут же дать менеджеру дашборд аналитики по всем счетам на тех же свежих данных.",
    answer: "htap",
    explanation:
      "Нужны обе нагрузки поверх одних и тех же свежих данных, без отдельного ETL в аналитическое хранилище, — ровно то, для чего придумали HTAP.",
  },
  {
    id: 4,
    prompt: "Поставить лайк под постом в соцсети.",
    answer: "oltp",
    explanation: "Точечная быстрая запись одной записи — OLTP.",
  },
  {
    id: 5,
    prompt: "Посчитать, сколько уникальных пользователей заходило в приложение каждый день за последний год.",
    answer: "olap",
    explanation: "Сканирование большого объёма исторических данных с агрегацией — OLAP.",
  },
  {
    id: 6,
    prompt:
      "Склад: кассир проводит продажу, а через секунду менеджер должен увидеть актуальный остаток на живом дашборде.",
    answer: "htap",
    explanation: "Транзакционная запись и почти мгновенная аналитика поверх неё — снова HTAP.",
  },
];

export type DurabilityAxis = "persistent" | "in-memory";

export const DURABILITY_OPTIONS: { id: DurabilityAxis; label: string }[] = [
  { id: "persistent", label: "Persistent" },
  { id: "in-memory", label: "In-memory" },
];

export const DURABILITY_QUIZ: QuizItem<DurabilityAxis>[] = [
  {
    id: 1,
    prompt: "Исходный код проекта — должен пережить перезагрузку сервера и жить годами.",
    answer: "persistent",
    explanation: "Данные обязаны переживать перезапуск — хранение на диске, с журналом и бэкапами.",
  },
  {
    id: 2,
    prompt:
      "Кэш пользовательских сессий: если сервер перезапустится, пользователи просто перелогинятся — не критично.",
    answer: "in-memory",
    explanation: "Скорость важнее, чем переживание перезапуска, — типичный in-memory кейс (Redis).",
  },
  {
    id: 3,
    prompt: "Счётчик активных WebSocket-соединений на конкретном инстансе прямо сейчас.",
    answer: "in-memory",
    explanation: "Эфемерные данные, актуальные только пока жив процесс, — диск тут не нужен.",
  },
  {
    id: 4,
    prompt: "Баланс банковского счёта.",
    answer: "persistent",
    explanation: "Потеря данных недопустима ни при каких обстоятельствах — обязательно на диск.",
  },
  {
    id: 5,
    prompt: "Промежуточный результат MapReduce-джобы, который нужен только следующему шагу этой же джобы.",
    answer: "in-memory",
    explanation: "Живёт ровно до конца вычисления — переживать перезапуск ему незачем.",
  },
];
