/**
 * Одна бизнес-операция иногда должна изменить данные сразу в НЕСКОЛЬКИХ
 * независимых местах (базах, сервисах) — и либо это должно случиться
 * везде, либо нигде. Три способа добиться этого:
 *  - 2PC (Two-Phase Commit) — координатор сначала спрашивает "готовы?"
 *    (Prepare) у всех участников, и только если ВСЕ ответили "да", даёт
 *    команду зафиксировать (Commit); если хоть один против — Rollback
 *    у всех. Строго консистентно, но участники блокируются на время
 *    голосования.
 *  - Saga — вместо одной распределённой транзакции — цепочка ЛОКАЛЬНЫХ
 *    транзакций, каждая публикует событие, запускающее следующую. Если
 *    шаг падает — не откат, а КОМПЕНСИРУЮЩАЯ операция, отменяющая эффект
 *    уже выполненных шагов.
 *  - Transaction Outbox — решает другую, но смежную проблему: как
 *    атомарно записать в БД И опубликовать событие в очередь, если это
 *    два разных ресурса, между которыми нет общей транзакции.
 */

export type TxLegKind = "request" | "response" | "write" | "read" | "error";

export interface TxLeg {
  from: string;
  to: string;
  kind: TxLegKind;
  delayUnits: number;
}

export interface TxStep {
  id: number;
  label: string;
  legs: TxLeg[];
  description: string;
}

export interface TxNode {
  id: string;
  label: string;
}

export interface TxScenario {
  nodes: TxNode[];
  pos: Record<string, { x: number; y: number }>;
  edges: [string, string][];
  steps: TxStep[];
}

// ---------------------------------------------------------------------------
// 2PC
// ---------------------------------------------------------------------------

const TPC_NODES: TxNode[] = [
  { id: "service", label: "Service" },
  { id: "db1", label: "DB #1" },
  { id: "db2", label: "DB #2" },
];
const TPC_POS: Record<string, { x: number; y: number }> = {
  service: { x: 90, y: 130 },
  db1: { x: 400, y: 60 },
  db2: { x: 400, y: 200 },
};
const TPC_EDGES: [string, string][] = [
  ["service", "db1"],
  ["service", "db2"],
];

export type TpcScenarioId = "success" | "prepare-fails";

export const TPC_SCENARIOS: { id: TpcScenarioId; label: string }[] = [
  { id: "success", label: "Успешный сценарий" },
  { id: "prepare-fails", label: "Сбой на Prepare" },
];

const TPC_SUCCESS_STEPS: TxStep[] = [
  {
    id: 1,
    label: "Фаза 1 — Prepare",
    legs: [
      { from: "service", to: "db1", kind: "request", delayUnits: 0 },
      { from: "service", to: "db2", kind: "request", delayUnits: 0 },
    ],
    description: "Координатор спрашивает у ОБЕИХ баз: «готовы зафиксировать?» — но ещё не фиксирует.",
  },
  {
    id: 2,
    label: "Обе базы подтверждают готовность",
    legs: [
      { from: "db1", to: "service", kind: "response", delayUnits: 0 },
      { from: "db2", to: "service", kind: "response", delayUnits: 0 },
    ],
    description: "Каждая база заблокировала нужные строки и готова закоммитить по первому сигналу.",
  },
  {
    id: 3,
    label: "Фаза 2 — Commit",
    legs: [
      { from: "service", to: "db1", kind: "write", delayUnits: 0 },
      { from: "service", to: "db2", kind: "write", delayUnits: 0 },
    ],
    description: "Раз ВСЕ ответили «да» — координатор даёт команду зафиксировать обеим сразу.",
  },
  {
    id: 4,
    label: "Обе базы подтверждают commit",
    legs: [
      { from: "db1", to: "service", kind: "response", delayUnits: 0 },
      { from: "db2", to: "service", kind: "response", delayUnits: 0 },
    ],
    description: "Транзакция зафиксирована на обеих базах — либо обе, либо (как в другом сценарии) ни одна.",
  },
];

const TPC_PREPARE_FAILS_STEPS: TxStep[] = [
  {
    id: 1,
    label: "Фаза 1 — Prepare",
    legs: [
      { from: "service", to: "db1", kind: "request", delayUnits: 0 },
      { from: "service", to: "db2", kind: "request", delayUnits: 0 },
    ],
    description: "Координатор спрашивает у обеих баз, готовы ли они зафиксировать транзакцию.",
  },
  {
    id: 2,
    label: "DB #1 — ОК, DB #2 — отказ",
    legs: [
      { from: "db1", to: "service", kind: "response", delayUnits: 0 },
      { from: "db2", to: "service", kind: "error", delayUnits: 0 },
    ],
    description: "DB #2 не может гарантировать фиксацию (например, конфликт блокировок) и отвечает отказом.",
  },
  {
    id: 3,
    label: "Координатор шлёт Rollback ОБЕИМ",
    legs: [
      { from: "service", to: "db1", kind: "error", delayUnits: 0 },
      { from: "service", to: "db2", kind: "error", delayUnits: 0 },
    ],
    description: "Раз хотя бы одна база не готова — откатываются ОБЕ. Частичная фиксация недопустима, даже если DB #1 была готова.",
  },
];

export function getTpcSteps(scenario: TpcScenarioId): TxStep[] {
  return scenario === "success" ? TPC_SUCCESS_STEPS : TPC_PREPARE_FAILS_STEPS;
}

export const tpcScenario: TxScenario = {
  nodes: TPC_NODES,
  pos: TPC_POS,
  edges: TPC_EDGES,
  steps: TPC_SUCCESS_STEPS,
};

// ---------------------------------------------------------------------------
// Saga
// ---------------------------------------------------------------------------

const SAGA_NODES: TxNode[] = [
  { id: "orders", label: "Order Service" },
  { id: "bus", label: "Event Bus" },
  { id: "customer", label: "Customer Service" },
];
const SAGA_POS: Record<string, { x: number; y: number }> = {
  orders: { x: 90, y: 130 },
  bus: { x: 300, y: 130 },
  customer: { x: 510, y: 130 },
};
const SAGA_EDGES: [string, string][] = [
  ["orders", "bus"],
  ["bus", "customer"],
];

export type SagaScenarioId = "success" | "compensation";

export const SAGA_SCENARIOS: { id: SagaScenarioId; label: string }[] = [
  { id: "success", label: "Успех" },
  { id: "compensation", label: "Сбой → компенсация" },
];

const SAGA_SUCCESS_STEPS: TxStep[] = [
  {
    id: 1,
    label: "Create Order → публикует Order Created",
    legs: [{ from: "orders", to: "bus", kind: "write", delayUnits: 0 }],
    description: "Order Service выполняет свою ЛОКАЛЬНУЮ транзакцию и публикует событие о результате.",
  },
  {
    id: 2,
    label: "Customer Service реагирует на событие",
    legs: [{ from: "bus", to: "customer", kind: "response", delayUnits: 0 }],
    description: "Customer Service сам подписан на Order Created — никто его не вызывал напрямую.",
  },
  {
    id: 3,
    label: "Update Customer → публикует Customer Updated",
    legs: [{ from: "customer", to: "bus", kind: "write", delayUnits: 0 }],
    description: "Ещё одна локальная транзакция, ещё одно событие о результате.",
  },
  {
    id: 4,
    label: "Order Service завершает сагу",
    legs: [{ from: "bus", to: "orders", kind: "response", delayUnits: 0 }],
    description: "Finish — все локальные шаги выполнены успешно, распределённая операция завершена.",
  },
];

const SAGA_COMPENSATION_STEPS: TxStep[] = [
  {
    id: 1,
    label: "Create Order → публикует Order Created",
    legs: [{ from: "orders", to: "bus", kind: "write", delayUnits: 0 }],
    description: "Первый локальный шаг прошёл успешно.",
  },
  {
    id: 2,
    label: "Customer Service реагирует — и падает",
    legs: [{ from: "bus", to: "customer", kind: "response", delayUnits: 0 }],
    description: "Например, у клиента не хватает лимита — обновить его данные не получилось.",
  },
  {
    id: 3,
    label: "Customer Service публикует Customer Failed",
    legs: [{ from: "customer", to: "bus", kind: "error", delayUnits: 0 }],
    description: "Событие о неудаче — такое же событие, как и об успехе, просто другого типа.",
  },
  {
    id: 4,
    label: "Order Service запускает компенсацию",
    legs: [{ from: "bus", to: "orders", kind: "error", delayUnits: 0 }],
    description:
      "Вместо отката единой распределённой транзакции (её просто не существует) — запускается КОМПЕНСИРУЮЩАЯ операция, отменяющая эффект уже выполненного шага (например, отменяет заказ).",
  },
];

export function getSagaSteps(scenario: SagaScenarioId): TxStep[] {
  return scenario === "success" ? SAGA_SUCCESS_STEPS : SAGA_COMPENSATION_STEPS;
}

export const sagaScenario: TxScenario = {
  nodes: SAGA_NODES,
  pos: SAGA_POS,
  edges: SAGA_EDGES,
  steps: SAGA_SUCCESS_STEPS,
};

// ---------------------------------------------------------------------------
// Transaction Outbox
// ---------------------------------------------------------------------------

const OUTBOX_NODES: TxNode[] = [
  { id: "user", label: "User" },
  { id: "controller", label: "Controller" },
  { id: "entity", label: "Entity" },
  { id: "outbox", label: "Outbox" },
  { id: "publisher", label: "Publisher" },
  { id: "mq", label: "MQ" },
];
const OUTBOX_POS: Record<string, { x: number; y: number }> = {
  user: { x: 60, y: 130 },
  controller: { x: 220, y: 130 },
  entity: { x: 400, y: 70 },
  outbox: { x: 400, y: 190 },
  publisher: { x: 560, y: 190 },
  mq: { x: 560, y: 70 },
};
const OUTBOX_EDGES: [string, string][] = [
  ["user", "controller"],
  ["controller", "entity"],
  ["controller", "outbox"],
  ["publisher", "outbox"],
  ["publisher", "mq"],
];

export const OUTBOX_STEPS: TxStep[] = [
  {
    id: 1,
    label: "User → Controller: создать заказ",
    legs: [{ from: "user", to: "controller", kind: "write", delayUnits: 0 }],
    description: "Обычный запрос на создание сущности.",
  },
  {
    id: 2,
    label: "Controller пишет Entity и Outbox ОДНОЙ транзакцией",
    legs: [
      { from: "controller", to: "entity", kind: "write", delayUnits: 0 },
      { from: "controller", to: "outbox", kind: "write", delayUnits: 0 },
    ],
    description:
      "Ключевой момент: запись в Entity (бизнес-данные) и в Outbox (\"нужно опубликовать это событие\") происходят в ОДНОЙ локальной транзакции БД — либо обе, либо ни одна.",
  },
  {
    id: 3,
    label: "Publisher опрашивает таблицу Outbox",
    legs: [{ from: "publisher", to: "outbox", kind: "read", delayUnits: 0 }],
    description: "Отдельный процесс регулярно вычитывает ещё не отправленные строки из Outbox.",
  },
  {
    id: 4,
    label: "Publisher публикует событие в MQ",
    legs: [{ from: "publisher", to: "mq", kind: "write", delayUnits: 0 }],
    description:
      "Только теперь событие реально уходит в очередь. Если Publisher упадёт до этого шага — строка останется в Outbox и будет отправлена повторно при перезапуске (at-least-once).",
  },
];

export const outboxScenario: TxScenario = {
  nodes: OUTBOX_NODES,
  pos: OUTBOX_POS,
  edges: OUTBOX_EDGES,
  steps: OUTBOX_STEPS,
};
