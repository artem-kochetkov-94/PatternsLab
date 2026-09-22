/**
 * Топология отвечает "кто пишет". Этот паттерн — про другой вопрос: "когда
 * клиент получает ACK на запись, и что к этому моменту успело произойти на
 * реплике". Четыре режима — это четыре разных момента, в который master
 * решает "готово, можно отвечать клиенту":
 *  - sync — только после того, как реплика ПРИМЕНИЛА изменение;
 *  - async — сразу после применения у себя, не дожидаясь реплики вообще;
 *  - semisync — после того, как реплика ПОЛУЧИЛА данные (не обязательно
 *    применила);
 *  - lose-less semisync — то же самое, но данные сначала долетают до
 *    реплики, и только потом применяются в движке мастера — так при
 *    падении мастера сразу после отправки данные не теряются.
 */

export type SyncMode = "sync" | "async" | "semisync" | "loseless-semisync";

export const SYNC_MODES: { id: SyncMode; label: string; hint: string }[] = [
  {
    id: "sync",
    label: "Синхронная",
    hint: "Клиент ждёт, пока реплика ПРИМЕНИТ изменение. Самый надёжный вариант — и самый медленный.",
  },
  {
    id: "async",
    label: "Асинхронная",
    hint: "Клиент получает ACK сразу после мастера, не дожидаясь реплик вообще. Быстро, но реплики могут отстать.",
  },
  {
    id: "semisync",
    label: "Полусинхронная",
    hint: "Мастер ждёт подтверждения ПОЛУЧЕНИЯ от реплики (не применения) — компромисс между sync и async.",
  },
  {
    id: "loseless-semisync",
    label: "Lose-less semisync",
    hint: "Как semisync, но данные сначала долетают до реплики — и только потом применяются в движке мастера.",
  },
];

export type SyncLegKind = "write" | "replicate" | "ack";

export interface SyncLeg {
  from: string;
  to: string;
  kind: SyncLegKind;
}

export interface SyncStep {
  id: number;
  label: string;
  /** Пустой массив — шаг чисто внутренний (например, "применили в движке"), без анимации. */
  legs: SyncLeg[];
  description: string;
}

const SYNC_STEPS: SyncStep[] = [
  {
    id: 1,
    label: "1. Запись транзакции в журнал",
    legs: [{ from: "client", to: "master", kind: "write" }],
    description: "Клиент отправляет INSERT — мастер сначала фиксирует его в журнале (WAL).",
  },
  {
    id: 2,
    label: "2. Применение транзакции в движке",
    legs: [],
    description: "Мастер применяет изменение у себя — данные видны локальным читателям мастера.",
  },
  {
    id: 3,
    label: "3. Отправка данных на реплику",
    legs: [{ from: "master", to: "replica", kind: "replicate" }],
    description: "Изменение уезжает на реплику.",
  },
  {
    id: 4,
    label: "4. Реплика применяет и подтверждает",
    legs: [{ from: "replica", to: "master", kind: "ack" }],
    description: "Реплика применяет изменение у себя и только ПОСЛЕ ЭТОГО шлёт подтверждение.",
  },
  {
    id: 5,
    label: "5. Возвращение подтверждения клиенту",
    legs: [{ from: "master", to: "client", kind: "ack" }],
    description: "Только теперь клиент получает ACK — он гарантированно применён и на реплике тоже.",
  },
];

const ASYNC_STEPS: SyncStep[] = [
  {
    id: 1,
    label: "1. Запись транзакции в журнал",
    legs: [{ from: "client", to: "master", kind: "write" }],
    description: "Клиент отправляет INSERT.",
  },
  {
    id: 2,
    label: "2. Применение транзакции в движке",
    legs: [],
    description: "Мастер применяет изменение у себя.",
  },
  {
    id: 3,
    label: "3. Возвращение подтверждения клиенту",
    legs: [{ from: "master", to: "client", kind: "ack" }],
    description: "Клиент получает ACK СРАЗУ — реплика ещё ни о чём не знает.",
  },
  {
    id: 4,
    label: "4. Отправка данных на реплику",
    legs: [{ from: "master", to: "replica", kind: "replicate" }],
    description: "Только теперь изменение уезжает на реплику — с задержкой, это и есть replication lag.",
  },
];

const SEMISYNC_STEPS: SyncStep[] = [
  {
    id: 1,
    label: "1. Запись транзакции в журнал",
    legs: [{ from: "client", to: "master", kind: "write" }],
    description: "Клиент отправляет INSERT.",
  },
  {
    id: 2,
    label: "2. Применение транзакции в движке",
    legs: [],
    description: "Мастер применяет изменение у себя.",
  },
  {
    id: 3,
    label: "3. Отправка данных на реплику",
    legs: [{ from: "master", to: "replica", kind: "replicate" }],
    description: "Изменение уезжает на реплику.",
  },
  {
    id: 4,
    label: "4. Реплика подтверждает ПОЛУЧЕНИЕ",
    legs: [{ from: "replica", to: "master", kind: "ack" }],
    description:
      "Реплика подтверждает, что данные долетели, — но ещё не факт, что она успела их применить (применит «когда-то потом»).",
  },
  {
    id: 5,
    label: "5. Возвращение подтверждения клиенту",
    legs: [{ from: "master", to: "client", kind: "ack" }],
    description: "Клиент получает ACK — данные точно не потеряются, но на реплике они пока «в пути».",
  },
];

const LOSELESS_SEMISYNC_STEPS: SyncStep[] = [
  {
    id: 1,
    label: "1. Запись транзакции в журнал",
    legs: [{ from: "client", to: "master", kind: "write" }],
    description: "Клиент отправляет INSERT — но в движке мастера транзакция ЕЩЁ НЕ применена.",
  },
  {
    id: 2,
    label: "2. Отправка данных на реплику",
    legs: [{ from: "master", to: "replica", kind: "replicate" }],
    description:
      "Данные уезжают на реплику ДО применения у себя — если мастер упадёт прямо сейчас, данные всё равно не потеряны.",
  },
  {
    id: 3,
    label: "3. Реплика подтверждает получение",
    legs: [{ from: "replica", to: "master", kind: "ack" }],
    description: "Реплика подтверждает, что данные долетели.",
  },
  {
    id: 4,
    label: "4. Применение транзакции в движке",
    legs: [],
    description:
      "Только теперь мастер применяет изменение у себя — порядок шагов 2↔4 и отличает этот режим от обычного semisync.",
  },
  {
    id: 5,
    label: "5. Возвращение подтверждения клиенту",
    legs: [{ from: "master", to: "client", kind: "ack" }],
    description: "Клиент получает ACK.",
  },
];

export function getSyncSteps(mode: SyncMode): SyncStep[] {
  switch (mode) {
    case "sync":
      return SYNC_STEPS;
    case "async":
      return ASYNC_STEPS;
    case "semisync":
      return SEMISYNC_STEPS;
    case "loseless-semisync":
      return LOSELESS_SEMISYNC_STEPS;
  }
}

// ---------------------------------------------------------------------------
// Модели консистентности — узнать гарантию по сценарию (формат: квиз).
// ---------------------------------------------------------------------------

export type ConsistencyModel =
  | "strong"
  | "eventual"
  | "read-your-writes"
  | "monotonic-reads"
  | "consistent-prefix";

export const CONSISTENCY_OPTIONS: { id: ConsistencyModel; label: string }[] = [
  { id: "strong", label: "Strong Consistency" },
  { id: "eventual", label: "Eventual Consistency" },
  { id: "read-your-writes", label: "Read Your Writes" },
  { id: "monotonic-reads", label: "Monotonic Reads" },
  { id: "consistent-prefix", label: "Consistent Prefix Reads" },
];

export interface ConsistencyQuizItem {
  id: number;
  prompt: string;
  answer: ConsistencyModel;
  explanation: string;
}

export const CONSISTENCY_QUIZ: ConsistencyQuizItem[] = [
  {
    id: 1,
    prompt:
      "Пользователь опубликовал твит с телефона, тут же открыл ленту с компьютера — а своего твита не видит, хотя запись точно прошла.",
    answer: "read-your-writes",
    explanation:
      "Нужно отследить, когда пользователь в последний раз писал, и на какое-то время слать ЕГО чтения на мастер (или заведомо свежую реплику).",
  },
  {
    id: 2,
    prompt:
      "Пользователь обновил страницу и увидел свой новый пост. Обновил ещё раз — и пост снова пропал.",
    answer: "monotonic-reads",
    explanation:
      "Каждый пользователь должен читать с одного и того же узла-последователя — тогда «назад во времени» он не уедет (разные пользователи при этом могут читать с разных реплик).",
  },
  {
    id: 3,
    prompt:
      "Пользователь Б ответил комплиментом на фото собаки пользователя А. Третий читатель увидел ответ Б раньше, чем сам исходный пост А с фото, — бессмыслица без контекста.",
    answer: "consistent-prefix",
    explanation:
      "Причинно-следственно связанные записи должны применяться на всех узлах в одном порядке — обычно это достигается тем, что связанные события пишут в одну и ту же секцию/партицию.",
  },
  {
    id: 4,
    prompt:
      "Пока в базу ничего не пишут, через какое-то время после последнего обновления ЛЮБОЙ запрос на чтение вернёт одно и то же, последнее записанное значение.",
    answer: "eventual",
    explanation:
      "«В конечном счёте» — самая слабая гарантия из моделей: не обещает мгновенности, только то, что расхождение не будет длиться вечно.",
  },
  {
    id: 5,
    prompt: "Любая операция чтения с ЛЮБОГО узла базы данных возвращает результат последней операции записи.",
    answer: "strong",
    explanation:
      "Самая сильная и самая дорогая гарантия — по сути требует синхронной репликации или обращения к единственному источнику правды.",
  },
];
