/**
 * Репликация — это не один способ, а выбор: КТО принимает запись и ЧТО
 * происходит, когда этот "кто" падает. Три топологии отвечают на этот
 * вопрос по-разному:
 *  - master-slave — один узел пишет, остальные только читают; при падении
 *    мастера запись недоступна, пока кто-то не станет новым мастером
 *    (downtime на запись).
 *  - master-master — пишут несколько узлов сразу; платим за это
 *    конфликтами (два мастера могли принять разные значения для одного
 *    ключа), но зато при падении одного из них downtime на запись не
 *    возникает — прочие мастера как принимали записи, так и принимают.
 *  - master-less — нет выделенной роли "мастер", пишем/читаем сразу в
 *    несколько узлов и решаем через кворум (W + R против N), гарантирует
 *    ли комбинация строгую согласованность.
 */

export type TopologyId = "master-slave" | "master-master" | "master-less";

export interface ReplicationNode {
  id: string;
  label: string;
}

export type NodeState = "up" | "down" | "promoted";

export type ReplicationLegKind = "write" | "read" | "replicate";

export interface ReplicationLeg {
  from: string;
  to: string;
  kind: ReplicationLegKind;
}

export interface ReplicationStep {
  id: number;
  label: string;
  legs: ReplicationLeg[];
  /** Состояние КАЖДОГО узла на этом шаге (полный снимок, не дельта). */
  nodeStates: Record<string, NodeState>;
  /** Статичная (без анимации) отметка "запись сорвалась" — для downtime-шагов. */
  blockedWrite?: { from: string; to: string };
  description: string;
}

export interface TopologyDef {
  id: TopologyId;
  label: string;
  hint: string;
  nodes: ReplicationNode[];
  pos: Record<string, { x: number; y: number }>;
  edges: [string, string][];
  steps: ReplicationStep[];
}

const ALL_UP = (nodes: ReplicationNode[]): Record<string, NodeState> =>
  Object.fromEntries(nodes.map((n) => [n.id, "up" as NodeState]));

// ---------------------------------------------------------------------------
// Master-Slave
// ---------------------------------------------------------------------------

const MS_NODES: ReplicationNode[] = [
  { id: "client", label: "Client" },
  { id: "master", label: "Master" },
  { id: "slave1", label: "Slave" },
  { id: "slave2", label: "Slave" },
];

const masterSlaveSteps: ReplicationStep[] = [
  {
    id: 1,
    label: "Клиент пишет в мастер",
    legs: [{ from: "client", to: "master", kind: "write" }],
    nodeStates: ALL_UP(MS_NODES),
    description:
      "Все записи идут только в master — единственная точка правды на запись во всей топологии.",
  },
  {
    id: 2,
    label: "Мастер реплицирует на слейвы",
    legs: [
      { from: "master", to: "slave1", kind: "replicate" },
      { from: "master", to: "slave2", kind: "replicate" },
    ],
    nodeStates: ALL_UP(MS_NODES),
    description:
      "Slave-узлы подтягивают изменения асинхронно, с задержкой — это и есть replication lag.",
  },
  {
    id: 3,
    label: "Клиент читает со слейва",
    legs: [{ from: "client", to: "slave2", kind: "read" }],
    nodeStates: ALL_UP(MS_NODES),
    description:
      "Чтение можно развести по слейвам, чтобы разгрузить мастер — ценой риска прочитать не самые свежие данные.",
  },
  {
    id: 4,
    label: "Мастер падает",
    legs: [],
    nodeStates: { ...ALL_UP(MS_NODES), master: "down" },
    description:
      "Мастер недоступен. Слейвы всё ещё отдают данные на чтение, но писать больше некуда.",
  },
  {
    id: 5,
    label: "Запись недоступна — downtime",
    legs: [],
    blockedWrite: { from: "client", to: "master" },
    nodeStates: { ...ALL_UP(MS_NODES), master: "down" },
    description:
      "Любая попытка записи будет падать, пока кто-то не станет новым мастером — это и есть downtime на запись у master-slave.",
  },
  {
    id: 6,
    label: "Failover: Slave повышается до мастера",
    legs: [],
    nodeStates: { ...ALL_UP(MS_NODES), master: "down", slave1: "promoted" },
    description:
      "Slave1 выбран новым мастером — вручную или автоматически, по кворуму живых узлов. С этого момента он принимает записи (Hot Standby).",
  },
  {
    id: 7,
    label: "Клиент пишет в нового мастера",
    legs: [{ from: "client", to: "slave1", kind: "write" }],
    nodeStates: { ...ALL_UP(MS_NODES), master: "down", slave1: "promoted" },
    description:
      "Запись снова доступна — но клиенту (или proxy/DNS перед ним) нужно было узнать адрес нового мастера.",
  },
];

// ---------------------------------------------------------------------------
// Master-Master
// ---------------------------------------------------------------------------

const MM_NODES: ReplicationNode[] = [
  { id: "client", label: "Client" },
  { id: "master1", label: "Master #1" },
  { id: "master2", label: "Master #2" },
];

const masterMasterSteps: ReplicationStep[] = [
  {
    id: 1,
    label: "Клиент пишет в Master #1",
    legs: [{ from: "client", to: "master1", kind: "write" }],
    nodeStates: ALL_UP(MM_NODES),
    description: "Запись пришла в Master #1 — для ключа user_1 значение 500.",
  },
  {
    id: 2,
    label: "Master #1 реплицирует на Master #2",
    legs: [{ from: "master1", to: "master2", kind: "replicate" }],
    nodeStates: ALL_UP(MM_NODES),
    description: "Изменение уезжает на второй мастер — тоже асинхронно.",
  },
  {
    id: 3,
    label: "Параллельно клиент пишет в Master #2",
    legs: [{ from: "client", to: "master2", kind: "write" }],
    nodeStates: ALL_UP(MM_NODES),
    description:
      "Почти одновременно кто-то записал в Master #2 другое значение для того же ключа user_1 — конфликт.",
  },
  {
    id: 4,
    label: "Master #2 реплицирует на Master #1",
    legs: [{ from: "master2", to: "master1", kind: "replicate" }],
    nodeStates: ALL_UP(MM_NODES),
    description: "Обе версии расходятся по кластеру — у каждого мастера была своя правда.",
  },
  {
    id: 5,
    label: "Конфликт разрешается",
    legs: [],
    nodeStates: ALL_UP(MM_NODES),
    description:
      "Кластер выбирает победителя одним из способов: last write wins (по времени), ранг реплики, разрешение на клиенте, либо CRDT — структура данных, которая умеет сливаться сама, без выбора «победителя».",
  },
  {
    id: 6,
    label: "Master #1 падает",
    legs: [],
    nodeStates: { ...ALL_UP(MM_NODES), master1: "down" },
    description:
      "В отличие от master-slave, второй мастер как был готов принимать запись, так и остался.",
  },
  {
    id: 7,
    label: "Клиент пишет в Master #2 — без downtime",
    legs: [{ from: "client", to: "master2", kind: "write" }],
    nodeStates: { ...ALL_UP(MM_NODES), master1: "down" },
    description:
      "Downtime на запись не возникает — цена за это уже была заплачена раньше, в виде риска конфликтов.",
  },
];

// ---------------------------------------------------------------------------
// Master-less
// ---------------------------------------------------------------------------

const ML_NODES: ReplicationNode[] = [
  { id: "client", label: "Client" },
  { id: "node1", label: "Node #1" },
  { id: "node2", label: "Node #2" },
  { id: "node3", label: "Node #3" },
];

const masterLessSteps: ReplicationStep[] = [
  {
    id: 1,
    label: "Запись с W = 2: пишем в Node #1 и Node #2",
    legs: [
      { from: "client", to: "node1", kind: "write" },
      { from: "client", to: "node2", kind: "write" },
    ],
    nodeStates: ALL_UP(ML_NODES),
    description:
      "W = 2 — клиент ждёт подтверждения от двух узлов из трёх (N = 3). Node #3 запись пока не получил.",
  },
  {
    id: 2,
    label: "Чтение с R = 2: читаем с Node #2 и Node #3",
    legs: [
      { from: "client", to: "node2", kind: "read" },
      { from: "client", to: "node3", kind: "read" },
    ],
    nodeStates: ALL_UP(ML_NODES),
    description:
      "R = 2 — читаем с двух узлов. Node #2 уже знает новое значение, Node #3 — ещё нет.",
  },
  {
    id: 3,
    label: "W + R = 4 > N = 3 — пересечение гарантировано",
    legs: [],
    nodeStates: ALL_UP(ML_NODES),
    description:
      "Сравнив версии двух ответов, клиент берёт свежую — хотя бы один из отвеченных узлов точно видел последнюю запись. Это и есть строгая согласованность через кворум.",
  },
  {
    id: 4,
    label: "Тот же пример, но W = 1",
    legs: [{ from: "client", to: "node1", kind: "write" }],
    nodeStates: ALL_UP(ML_NODES),
    description: "Теперь пишем только в Node #1 — быстрая запись, но более рискованная.",
  },
  {
    id: 5,
    label: "Читаем с R = 1: Node #3",
    legs: [{ from: "client", to: "node3", kind: "read" }],
    nodeStates: ALL_UP(ML_NODES),
    description:
      "W + R = 2 ≤ N = 3 — пересечение уже не гарантировано. Node #3 мог не получить репликацию — клиент рискует прочитать устаревшее значение.",
  },
];

export const TOPOLOGIES: TopologyDef[] = [
  {
    id: "master-slave",
    label: "Master – Slave",
    hint: "Один узел пишет, остальные читают. Просто и предсказуемо — но при падении мастера запись встаёт (downtime).",
    nodes: MS_NODES,
    pos: {
      client: { x: 90, y: 130 },
      master: { x: 330, y: 130 },
      slave1: { x: 560, y: 60 },
      slave2: { x: 560, y: 200 },
    },
    edges: [
      ["client", "master"],
      ["master", "slave1"],
      ["master", "slave2"],
    ],
    steps: masterSlaveSteps,
  },
  {
    id: "master-master",
    label: "Master – Master",
    hint: "Пишут несколько узлов сразу. Downtime на запись не грозит — но появляются конфликты, которые нужно разрешать.",
    nodes: MM_NODES,
    pos: {
      client: { x: 90, y: 130 },
      master1: { x: 400, y: 60 },
      master2: { x: 400, y: 200 },
    },
    edges: [
      ["client", "master1"],
      ["client", "master2"],
      ["master1", "master2"],
    ],
    steps: masterMasterSteps,
  },
  {
    id: "master-less",
    label: "Master-less",
    hint: "Нет выделенной роли «мастер» — пишем и читаем сразу в несколько узлов, а гарантии определяет кворум W + R против N.",
    nodes: ML_NODES,
    pos: {
      client: { x: 110, y: 130 },
      node1: { x: 430, y: 50 },
      node2: { x: 520, y: 130 },
      node3: { x: 430, y: 210 },
    },
    edges: [
      ["client", "node1"],
      ["client", "node2"],
      ["client", "node3"],
    ],
    steps: masterLessSteps,
  },
];

export function getTopology(id: TopologyId): TopologyDef {
  return TOPOLOGIES.find((t) => t.id === id)!;
}
