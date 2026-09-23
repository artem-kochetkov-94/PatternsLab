/**
 * Два разных вопроса, которые распределённой системе нужно уметь решать
 * без единой точки правды:
 *  - Распределённые блокировки — как гарантировать, что ресурс в моменте
 *    занят только ОДНИМ клиентом, если клиентов и узлов несколько;
 *  - Выбор лидера — как узлам самим, без внешнего арбитра, договориться,
 *    кто из них теперь главный, если прежний лидер пропал.
 */

// ---------------------------------------------------------------------------
// Распределённые блокировки
// ---------------------------------------------------------------------------

export type LockLegKind = "write" | "error";

export interface LockLeg {
  from: string;
  to: string;
  kind: LockLegKind;
}

export interface LockStep {
  id: number;
  label: string;
  leg: LockLeg | null;
  description: string;
}

export type LockScenarioId = "unsafe" | "safe";

export const LOCK_SCENARIOS: { id: LockScenarioId; label: string }[] = [
  { id: "unsafe", label: "Без защиты (race condition)" },
  { id: "safe", label: "SET NX PX (правильно)" },
];

const UNSAFE_STEPS: LockStep[] = [
  {
    id: 1,
    label: "Client A: SET file_1 = A",
    leg: { from: "clientA", to: "redis", kind: "write" },
    description: "Client A считает, что теперь владеет блокировкой на file_1.",
  },
  {
    id: 2,
    label: "Client B: SET file_1 = B (перезаписывает!)",
    leg: { from: "clientB", to: "redis", kind: "write" },
    description:
      "Ничто не помешало Client B перезаписать значение — обычный SET ничего не проверяет. Теперь ОБА клиента уверены, что владеют блокировкой, — гонка (race condition).",
  },
];

const SAFE_STEPS: LockStep[] = [
  {
    id: 1,
    label: "Client A: SET file_1 A NX PX 30000 → true",
    leg: { from: "clientA", to: "redis", kind: "write" },
    description: "NX — установить, только если ключа ещё нет. PX — авто-истечение через 30 секунд на случай, если Client A упадёт, не сняв блокировку. Client A получает лок.",
  },
  {
    id: 2,
    label: "Client B: SET file_1 B NX PX 30000 → false",
    leg: { from: "clientB", to: "redis", kind: "error" },
    description: "Ключ уже существует — NX не даёт перезаписать. Client B не получает блокировку и должен подождать или повторить позже.",
  },
  {
    id: 3,
    label: "Client A безопасно снимает блокировку",
    leg: { from: "clientA", to: "redis", kind: "write" },
    description:
      "DEL выполняется Lua-скриптом, который СНАЧАЛА проверяет: значение по ключу всё ещё равно A? Если да — удаляет. Без этой проверки можно было бы случайно удалить чужую (уже новую) блокировку, если наша истекла по PX прямо перед этим.",
  },
];

export function getLockSteps(scenario: LockScenarioId): LockStep[] {
  return scenario === "unsafe" ? UNSAFE_STEPS : SAFE_STEPS;
}

// ---------------------------------------------------------------------------
// Выбор лидера — Bully algorithm
// ---------------------------------------------------------------------------

export type NodeRole = "alive" | "dead" | "leader";

export interface BullyStep {
  id: number;
  label: string;
  legs: { from: number; to: number; delayUnits: number }[];
  nodeRoles: Record<number, NodeRole>;
  description: string;
}

const ALL_ALIVE: Record<number, NodeRole> = { 0: "alive", 1: "alive", 2: "alive", 3: "alive", 4: "alive", 5: "dead" };

export const BULLY_STEPS: BullyStep[] = [
  {
    id: 1,
    label: "Узел #5 (лидер) падает",
    legs: [],
    nodeRoles: ALL_ALIVE,
    description: "Прежний лидер (узел с наибольшим id) недоступен — остальные узлы об этом пока не знают.",
  },
  {
    id: 2,
    label: "Узел #2 замечает это и начинает выборы",
    legs: [
      { from: 2, to: 3, delayUnits: 0 },
      { from: 2, to: 4, delayUnits: 0 },
      { from: 2, to: 5, delayUnits: 0 },
    ],
    nodeRoles: ALL_ALIVE,
    description: "Election рассылается ВСЕМ узлам с БОЛЬШИМ id — вдруг кто-то из них жив и должен возглавить.",
  },
  {
    id: 3,
    label: "Узлы #3 и #4 отвечают: «я живой, дальше сам»",
    legs: [
      { from: 3, to: 2, delayUnits: 0 },
      { from: 4, to: 2, delayUnits: 0 },
    ],
    nodeRoles: ALL_ALIVE,
    description: "Узел #5 не отвечает (мёртв). Узлы #3 и #4 подтверждают получение и сами включаются в выборы — узел #2 в них больше не участвует.",
  },
  {
    id: 4,
    label: "Узел #4 (старший из отозвавшихся) запускает свои выборы",
    legs: [{ from: 4, to: 5, delayUnits: 0 }],
    nodeRoles: ALL_ALIVE,
    description: "По тому же правилу — Election всем, кто старше него. Единственный такой узел — мёртвый #5.",
  },
  {
    id: 5,
    label: "Узел #5 молчит — таймаут. Узел #4 объявляет себя лидером",
    legs: [],
    nodeRoles: { ...ALL_ALIVE, 4: "leader" },
    description: "Никто старше не отозвался — значит, узел #4 и есть самый старший из живых.",
  },
  {
    id: 6,
    label: "Узел #4 рассылает Leader всем остальным",
    legs: [
      { from: 4, to: 0, delayUnits: 0 },
      { from: 4, to: 1, delayUnits: 0 },
      { from: 4, to: 2, delayUnits: 0 },
      { from: 4, to: 3, delayUnits: 0 },
    ],
    nodeRoles: { ...ALL_ALIVE, 4: "leader" },
    description: "Все живые узлы теперь знают нового лидера — выборы завершены без единого внешнего арбитра.",
  },
];
