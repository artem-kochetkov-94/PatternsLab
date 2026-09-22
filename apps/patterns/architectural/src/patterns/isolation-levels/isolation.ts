/**
 * Уровни изоляции транзакций. Одни и те же четыре аномалии параллельного
 * доступа к данным (грязное чтение, неповторяющееся чтение, фантомное
 * чтение, потерянное обновление) — но каждый уровень изоляции закрывает
 * их постепенно, от READ UNCOMMITTED (ничего не закрыто) до SERIALIZABLE
 * (закрыто всё). Сценарии двух конкурентных транзакций T1/T2 фиксированы,
 * от уровня изоляции зависит только то, что видно на "переломном" шаге.
 */

export type IsolationLevel =
  | "read-uncommitted"
  | "read-committed"
  | "repeatable-read"
  | "serializable";

export const ISOLATION_LEVELS: { id: IsolationLevel; label: string }[] = [
  { id: "read-uncommitted", label: "READ UNCOMMITTED" },
  { id: "read-committed", label: "READ COMMITTED" },
  { id: "repeatable-read", label: "REPEATABLE READ" },
  { id: "serializable", label: "SERIALIZABLE" },
];

export type AnomalyId =
  | "dirty-read"
  | "non-repeatable-read"
  | "phantom-read"
  | "lost-update";

export const ANOMALIES: { id: AnomalyId; label: string; hint: string }[] = [
  {
    id: "dirty-read",
    label: "Грязное чтение",
    hint: "T2 читает данные, которые T1 ещё не закоммитил и может откатить.",
  },
  {
    id: "non-repeatable-read",
    label: "Неповторяющееся чтение",
    hint: "T2 дважды читает одни и те же данные — а между чтениями T1 их успел изменить и закоммитить.",
  },
  {
    id: "phantom-read",
    label: "Фантомное чтение",
    hint: "T2 дважды выполняет один и тот же агрегирующий запрос — а между разами T1 добавил новую подходящую строку.",
  },
  {
    id: "lost-update",
    label: "Потерянное обновление",
    hint: "T1 и T2 читают одно и то же значение и оба его увеличивают — одно из увеличений «теряется».",
  },
];

/** Какие уровни изоляции ПРЕДОТВРАЩАЮТ данную аномалию. */
const PREVENTED_AT: Record<AnomalyId, IsolationLevel[]> = {
  "dirty-read": ["read-committed", "repeatable-read", "serializable"],
  "non-repeatable-read": ["repeatable-read", "serializable"],
  "lost-update": ["repeatable-read", "serializable"],
  "phantom-read": ["serializable"],
};

export function isPrevented(anomaly: AnomalyId, level: IsolationLevel): boolean {
  return PREVENTED_AT[anomaly].includes(level);
}

export type Actor = "t1" | "t2" | "system";

export interface IsolationStep {
  id: number;
  actor: Actor;
  /** Короткая SQL-подобная строка операции — показывается моноширинным шрифтом. */
  sql: string;
  /** Что T1 сейчас знает/видит — null, если этот шаг не меняет его картину мира. */
  t1View: string | null;
  /** Что T2 сейчас знает/видит — null, если этот шаг не меняет его картину мира. */
  t2View: string | null;
  /** РЕАЛЬНОЕ состояние в базе (после commit/rollback) — null, если не менялось. */
  dbState: string | null;
  /** true на самом "переломном" шаге сценария — том, где аномалия либо проявляется, либо нет. */
  reveal: boolean;
  /** true — если на этом шаге аномалия НЕ предотвращена (т.е. реально произошла). */
  anomaly: boolean;
  description: string;
}

function dirtyReadScenario(prevented: boolean): IsolationStep[] {
  return [
    {
      id: 1,
      actor: "t1",
      sql: "START TRANSACTION;",
      t1View: null,
      t2View: null,
      dbState: "balance = 1500",
      reveal: false,
      anomaly: false,
      description: "T1 начинает транзакцию. Начальное состояние: balance = 1500.",
    },
    {
      id: 2,
      actor: "t1",
      sql: "UPDATE account SET balance = balance - 500 WHERE user_id = 111;",
      t1View: "balance = 1000 (ещё не закоммичено)",
      t2View: null,
      dbState: null,
      reveal: false,
      anomaly: false,
      description:
        "T1 списывает 500 — изменение видно только внутри T1, в базе оно ещё не зафиксировано.",
    },
    {
      id: 3,
      actor: "t2",
      sql: "SELECT balance FROM account WHERE user_id = 111;",
      t1View: null,
      t2View: prevented
        ? "balance = 1500 (последнее закоммиченное значение)"
        : "balance = 1000 (чужие незакоммиченные данные!)",
      dbState: null,
      reveal: true,
      anomaly: !prevented,
      description: prevented
        ? "Уровень изоляции не даёт T2 увидеть незафиксированные изменения T1 — грязное чтение предотвращено. Значение T2 совпадает с реальным состоянием БД."
        : "T2 прочитал изменение T1, которое ещё не закоммичено и может быть откачено, — это и есть грязное чтение. Значение T2 разошлось с реальным состоянием БД.",
    },
    {
      id: 4,
      actor: "t1",
      sql: "ROLLBACK;",
      t1View: "balance = 1500 (транзакция отменена)",
      t2View: null,
      dbState: "balance = 1500",
      reveal: false,
      anomaly: false,
      description: "T1 откатывает транзакцию — списания 500 фактически не произошло.",
    },
    {
      id: 5,
      actor: "system",
      sql: "Итог",
      t1View: null,
      t2View: null,
      dbState: null,
      reveal: false,
      anomaly: !prevented,
      description: prevented
        ? "T2 всё это время видел только реальные данные — противоречий нет."
        : "T2 успел поработать со значением 1000, которого официально никогда не существовало, — возможна порча данных.",
    },
  ];
}

function nonRepeatableReadScenario(prevented: boolean): IsolationStep[] {
  return [
    {
      id: 1,
      actor: "t2",
      sql: "START TRANSACTION;",
      t1View: null,
      t2View: null,
      dbState: "sum = 4000",
      reveal: false,
      anomaly: false,
      description: "T2 начинает транзакцию. Начальное состояние: sum = 4000.",
    },
    {
      id: 2,
      actor: "t2",
      sql: "SELECT SUM(balance) FROM account;",
      t1View: null,
      t2View: "sum = 4000",
      dbState: null,
      reveal: false,
      anomaly: false,
      description: "T2 читает сумму в первый раз.",
    },
    {
      id: 3,
      actor: "t1",
      sql: "UPDATE account SET balance = balance + 500 WHERE user_id = 111; COMMIT;",
      t1View: "sum = 4500 (после своего обновления)",
      t2View: null,
      dbState: "sum = 4500",
      reveal: false,
      anomaly: false,
      description:
        "T1 целиком выполняет и коммитит свою транзакцию, пока T2 ещё не завершилась.",
    },
    {
      id: 4,
      actor: "t2",
      sql: "SELECT SUM(balance) FROM account;  -- повторно",
      t1View: null,
      t2View: prevented
        ? "sum = 4000 (как и в первый раз)"
        : "sum = 4500 (изменилось!)",
      dbState: null,
      reveal: true,
      anomaly: !prevented,
      description: prevented
        ? "Уровень изоляции удерживает для T2 тот же снимок данных, что и при первом чтении, — неповторяющегося чтения нет."
        : "В рамках ОДНОЙ транзакции T2 дважды прочитал разные значения одного и того же — неповторяющееся чтение. Сравни два значения T2 в колонке слева.",
    },
  ];
}

function phantomReadScenario(prevented: boolean): IsolationStep[] {
  return [
    {
      id: 1,
      actor: "t2",
      sql: "START TRANSACTION;",
      t1View: null,
      t2View: null,
      dbState: "sum = 4000",
      reveal: false,
      anomaly: false,
      description: "T2 начинает транзакцию. Начальное состояние: sum = 4000.",
    },
    {
      id: 2,
      actor: "t2",
      sql: "SELECT SUM(balance) FROM account;",
      t1View: null,
      t2View: "sum = 4000",
      dbState: null,
      reveal: false,
      anomaly: false,
      description: "T2 читает сумму в первый раз.",
    },
    {
      id: 3,
      actor: "t1",
      sql: "INSERT INTO account(user_id, balance) VALUES (333, 1000); COMMIT;",
      t1View: "новая строка добавлена",
      t2View: null,
      dbState: "sum = 5000 (появилась новая строка)",
      reveal: false,
      anomaly: false,
      description: "T1 добавляет новую строку и коммитит, пока T2 ещё не завершилась.",
    },
    {
      id: 4,
      actor: "t2",
      sql: "SELECT SUM(balance) FROM account;  -- повторно",
      t1View: null,
      t2View: prevented
        ? "sum = 4000 (новая строка не видна)"
        : "sum = 5000 (появилась чужая строка!)",
      dbState: null,
      reveal: true,
      anomaly: !prevented,
      description: prevented
        ? "На SERIALIZABLE T2 не видит строк, появившихся после начала его транзакции, — фантома нет."
        : "T2 увидел строку, которой не было в начале его транзакции, — фантомное чтение. Сравни два значения T2 в колонке слева.",
    },
  ];
}

function lostUpdateScenario(prevented: boolean): IsolationStep[] {
  return [
    {
      id: 1,
      actor: "t1",
      sql: "SELECT count FROM view WHERE video_id = 10;",
      t1View: "count = 100",
      t2View: null,
      dbState: "count = 100",
      reveal: false,
      anomaly: false,
      description: "T1 читает текущее число просмотров.",
    },
    {
      id: 2,
      actor: "t2",
      sql: "SELECT count FROM view WHERE video_id = 10;",
      t1View: null,
      t2View: "count = 100",
      dbState: null,
      reveal: false,
      anomaly: false,
      description: "T2 читает то же значение — обе транзакции стартовали от одного count.",
    },
    {
      id: 3,
      actor: "t1",
      sql: "UPDATE view SET count = 101 WHERE video_id = 10; COMMIT;",
      t1View: "count = 101 (после своего обновления)",
      t2View: null,
      dbState: "count = 101",
      reveal: false,
      anomaly: false,
      description: "T1 увеличивает count на основе своего прочитанного значения и коммитит.",
    },
    {
      id: 4,
      actor: "t2",
      sql: "UPDATE view SET count = 101 WHERE video_id = 10; COMMIT;",
      t1View: null,
      t2View: prevented
        ? "count = 102 (пересчитал от актуального значения)"
        : "count = 101 (перезаписал вслепую)",
      dbState: prevented
        ? "count = 102 (T2 пересчитал от актуального значения)"
        : "count = 101 (обновление T1 потеряно!)",
      reveal: true,
      anomaly: !prevented,
      description: prevented
        ? "Уровень изоляции не даёт T2 обновить данные вслепую поверх чужого коммита — T2 либо блокируется и пересчитывает, либо получает ошибку сериализации."
        : "T2 вычислил 101 ещё ДО коммита T1 и просто перезаписал результат — инкремент T1 потерян, на деле просмотров должно быть 102.",
    },
  ];
}

export function buildIsolationScenario(
  anomaly: AnomalyId,
  level: IsolationLevel,
): IsolationStep[] {
  const prevented = isPrevented(anomaly, level);
  switch (anomaly) {
    case "dirty-read":
      return dirtyReadScenario(prevented);
    case "non-repeatable-read":
      return nonRepeatableReadScenario(prevented);
    case "phantom-read":
      return phantomReadScenario(prevented);
    case "lost-update":
      return lostUpdateScenario(prevented);
  }
}
