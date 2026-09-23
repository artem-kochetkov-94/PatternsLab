/**
 * Четыре способа организовать общение между сервисами, когда одного
 * запроса клиента недостаточно — ответ собирается из нескольких мест:
 *  - Агрегатор — один сервис дёргает несколько других ПАРАЛЛЕЛЬНО и сам
 *    склеивает ответ;
 *  - Цепочка — сервисы вызывают друг друга ПОСЛЕДОВАТЕЛЬНО, каждый решает
 *    свою часть и передаёт эстафету дальше;
 *  - Событийно-ориентированная — сервисы не вызывают друг друга напрямую,
 *    а обмениваются событиями через шину/очередь (три разновидности: кто
 *    и что публикует — от «просто уведомил» до «сам решаю, что делать»);
 *  - Отложенное выполнение задач — синхронный вызов превращается в
 *    постановку в очередь, чтобы не держать клиента, пока идёт долгая
 *    обработка.
 */

export interface MsNode {
  id: string;
  label: string;
}

export type MsLegKind = "write" | "read" | "request" | "response";

export interface MsLeg {
  from: string;
  to: string;
  kind: MsLegKind;
  /** В каких "юнитах" (длительностях перегона) стартует импульс — 0 = сразу, вместе с другими. */
  delayUnits: number;
}

export interface MsStep {
  id: number;
  label: string;
  legs: MsLeg[];
  description: string;
}

export interface MsScenario {
  id: string;
  label: string;
  hint: string;
  nodes: MsNode[];
  pos: Record<string, { x: number; y: number }>;
  edges: [string, string][];
  steps: MsStep[];
}

// ---------------------------------------------------------------------------
// Агрегатор
// ---------------------------------------------------------------------------

const AGGREGATOR_NODES: MsNode[] = [
  { id: "lb", label: "LB" },
  { id: "agg", label: "Aggregator" },
  { id: "info", label: "User Info" },
  { id: "score", label: "User Score" },
  { id: "history", label: "User History" },
];

export const aggregatorScenario: MsScenario = {
  id: "aggregator",
  label: "Агрегатор",
  hint: "Один сервис параллельно дёргает несколько других и сам склеивает единый ответ клиенту.",
  nodes: AGGREGATOR_NODES,
  pos: {
    lb: { x: 90, y: 130 },
    agg: { x: 300, y: 130 },
    info: { x: 540, y: 40 },
    score: { x: 540, y: 130 },
    history: { x: 540, y: 220 },
  },
  edges: [
    ["lb", "agg"],
    ["agg", "info"],
    ["agg", "score"],
    ["agg", "history"],
  ],
  steps: [
    {
      id: 1,
      label: "Клиент запрашивает агрегированные данные",
      legs: [{ from: "lb", to: "agg", kind: "write", delayUnits: 0 }],
      description: "Один запрос — но клиенту не важно, из скольких источников он будет собран.",
    },
    {
      id: 2,
      label: "Агрегатор параллельно запрашивает три сервиса",
      legs: [
        { from: "agg", to: "info", kind: "request", delayUnits: 0 },
        { from: "agg", to: "score", kind: "request", delayUnits: 0 },
        { from: "agg", to: "history", kind: "request", delayUnits: 0 },
      ],
      description: "Все три запроса летят ОДНОВРЕМЕННО — не по очереди, иначе ответ ждали бы втрое дольше.",
    },
    {
      id: 3,
      label: "Каждый сервис отвечает агрегатору",
      legs: [
        { from: "info", to: "agg", kind: "response", delayUnits: 0 },
        { from: "score", to: "agg", kind: "response", delayUnits: 0 },
        { from: "history", to: "agg", kind: "response", delayUnits: 0 },
      ],
      description: "Агрегатор ждёт ответа от всех трёх (или таймаутит того, кто не успел).",
    },
    {
      id: 4,
      label: "Агрегатор возвращает единый ответ",
      legs: [{ from: "agg", to: "lb", kind: "response", delayUnits: 0 }],
      description: "Клиент получает один цельный объект — и не знает, что за ним стояло три сервиса.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Цепочка
// ---------------------------------------------------------------------------

const CHAIN_NODES: MsNode[] = [
  { id: "lb", label: "LB" },
  { id: "orders", label: "Orders" },
  { id: "ordersDb", label: "DB" },
  { id: "payments", label: "Payments" },
  { id: "paymentsDb", label: "DB" },
];

export const chainScenario: MsScenario = {
  id: "chain",
  label: "Цепочка",
  hint: "Сервисы вызывают друг друга последовательно — каждый решает свою часть и передаёт эстафету дальше.",
  nodes: CHAIN_NODES,
  pos: {
    lb: { x: 80, y: 130 },
    orders: { x: 280, y: 130 },
    ordersDb: { x: 280, y: 220 },
    payments: { x: 500, y: 130 },
    paymentsDb: { x: 500, y: 220 },
  },
  edges: [
    ["lb", "orders"],
    ["orders", "ordersDb"],
    ["orders", "payments"],
    ["payments", "paymentsDb"],
  ],
  steps: [
    {
      id: 1,
      label: "Клиент создаёт заказ",
      legs: [{ from: "lb", to: "orders", kind: "write", delayUnits: 0 }],
      description: "Запрос попадает в первое звено цепочки — Orders.",
    },
    {
      id: 2,
      label: "Orders пишет в свою БД",
      legs: [{ from: "orders", to: "ordersDb", kind: "write", delayUnits: 0 }],
      description: "Orders фиксирует у себя факт создания заказа.",
    },
    {
      id: 3,
      label: "Orders вызывает Payments",
      legs: [{ from: "orders", to: "payments", kind: "request", delayUnits: 0 }],
      description: "Эстафета передаётся следующему звену — Orders не отвечает клиенту, пока не получит результат от Payments.",
    },
    {
      id: 4,
      label: "Payments пишет в свою БД",
      legs: [{ from: "payments", to: "paymentsDb", kind: "write", delayUnits: 0 }],
      description: "Payments фиксирует у себя факт списания.",
    },
    {
      id: 5,
      label: "Ответ идёт обратно по цепочке",
      legs: [
        { from: "payments", to: "orders", kind: "response", delayUnits: 0 },
        { from: "orders", to: "lb", kind: "response", delayUnits: 1 },
      ],
      description: "Payments отвечает Orders, а тот — клиенту. Вся цепочка синхронна: каждое звено ждёт ответа следующего.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Событийно-ориентированная (3 разновидности)
// ---------------------------------------------------------------------------

const EVENT_NODES: MsNode[] = [
  { id: "client", label: "Client" },
  { id: "orders", label: "Orders" },
  { id: "queue", label: "Queue" },
  { id: "cafe", label: "Cafe" },
  { id: "delivery", label: "Delivery" },
];
const EVENT_POS: Record<string, { x: number; y: number }> = {
  client: { x: 70, y: 50 },
  orders: { x: 230, y: 130 },
  queue: { x: 400, y: 130 },
  cafe: { x: 560, y: 60 },
  delivery: { x: 560, y: 200 },
};
const EVENT_EDGES: [string, string][] = [
  ["client", "orders"],
  ["orders", "queue"],
  ["queue", "cafe"],
  ["cafe", "delivery"],
  ["delivery", "queue"],
];

export type EventDrivenMode = "notification" | "state-transfer" | "collaboration";

export const EVENT_MODES: { id: EventDrivenMode; label: string; hint: string }[] = [
  {
    id: "notification",
    label: "Event Notification",
    hint: "Сервисы уведомляют друг друга о ФАКТЕ события, но не передают данные — за деталями получатель идёт к источнику сам.",
  },
  {
    id: "state-transfer",
    label: "State Transfer",
    hint: "Событие несёт с собой ДАННЫЕ — получателю не нужно ничего дополнительно спрашивать у источника.",
  },
  {
    id: "collaboration",
    label: "Event Collaboration",
    hint: "Нет центрального дирижёра — каждый сервис сам решает, на какие события реагировать и что публиковать дальше.",
  },
];

const NOTIFICATION_STEPS: MsStep[] = [
  {
    id: 1,
    label: "Клиент создаёт заказ",
    legs: [{ from: "client", to: "orders", kind: "write", delayUnits: 0 }],
    description: "Orders принимает запрос.",
  },
  {
    id: 2,
    label: "Orders публикует событие и СРАЗУ отпускает клиента",
    legs: [{ from: "orders", to: "queue", kind: "write", delayUnits: 0 }],
    description:
      "Клиент уже получил ответ («заказ принят») — дальше всё происходит асинхронно, клиент об этом не знает и не ждёт.",
  },
  {
    id: 3,
    label: "Очередь доставляет событие в Cafe",
    legs: [{ from: "queue", to: "cafe", kind: "response", delayUnits: 0 }],
    description: "Cafe узнаёт лишь ФАКТ «заказ создан» — самих деталей заказа в событии нет.",
  },
  {
    id: 4,
    label: "Cafe вызывает Delivery напрямую",
    legs: [{ from: "cafe", to: "delivery", kind: "request", delayUnits: 0 }],
    description: "Раз событие не принесло нужных данных, Cafe вынуждена сходить за ними сама — прямым вызовом.",
  },
];

const STATE_TRANSFER_STEPS: MsStep[] = [
  {
    id: 1,
    label: "Клиент создаёт заказ",
    legs: [{ from: "client", to: "orders", kind: "write", delayUnits: 0 }],
    description: "Orders принимает запрос.",
  },
  {
    id: 2,
    label: "Orders публикует событие С ДАННЫМИ и отпускает клиента",
    legs: [{ from: "orders", to: "queue", kind: "write", delayUnits: 0 }],
    description: "В отличие от Event Notification, событие несёт с собой сами данные заказа.",
  },
  {
    id: 3,
    label: "Очередь доставляет событие с данными в Cafe",
    legs: [{ from: "queue", to: "cafe", kind: "response", delayUnits: 0 }],
    description: "Cafe сразу получает всё необходимое — ходить за деталями отдельно не нужно.",
  },
  {
    id: 4,
    label: "Cafe публикует СВОИ данные обратно в очередь",
    legs: [{ from: "cafe", to: "queue", kind: "write", delayUnits: 0 }],
    description: "Теперь Delivery сможет забрать нужные данные из очереди сам, не дёргая Cafe напрямую.",
  },
  {
    id: 5,
    label: "Delivery читает данные из очереди",
    legs: [{ from: "delivery", to: "queue", kind: "read", delayUnits: 0 }],
    description: "Прямых вызовов между сервисами нет вообще — только чтение из общего потока событий.",
  },
];

const COLLABORATION_STEPS: MsStep[] = [
  {
    id: 1,
    label: "Orders публикует Order Requested",
    legs: [{ from: "orders", to: "queue", kind: "write", delayUnits: 0 }],
    description: "Orders не знает и не решает, что будет дальше — просто сообщает о своём событии.",
  },
  {
    id: 2,
    label: "Cafe слушает шину и реагирует",
    legs: [{ from: "queue", to: "cafe", kind: "response", delayUnits: 0 }],
    description: "Cafe сама подписалась на это событие и сама решает, что с ним делать.",
  },
  {
    id: 3,
    label: "Cafe публикует Order Prepared",
    legs: [{ from: "cafe", to: "queue", kind: "write", delayUnits: 0 }],
    description: "Cafe публикует своё событие — снова не зная и не заботясь, кто на него подпишется.",
  },
  {
    id: 4,
    label: "Delivery слушает шину и подхватывает заказ",
    legs: [{ from: "queue", to: "delivery", kind: "response", delayUnits: 0 }],
    description:
      "Никто не дирижирует процессом централизованно — в этом ключевое отличие от Event Notification и State Transfer, где Orders явно инициирует каждый следующий шаг.",
  },
];

export function getEventSteps(mode: EventDrivenMode): MsStep[] {
  switch (mode) {
    case "notification":
      return NOTIFICATION_STEPS;
    case "state-transfer":
      return STATE_TRANSFER_STEPS;
    case "collaboration":
      return COLLABORATION_STEPS;
  }
}

export const eventDrivenScenario: MsScenario = {
  id: "event-driven",
  label: "Событийно-ориентированная",
  hint: "Сервисы не вызывают друг друга напрямую, а обмениваются событиями через общую шину/очередь.",
  nodes: EVENT_NODES,
  pos: EVENT_POS,
  edges: EVENT_EDGES,
  steps: NOTIFICATION_STEPS,
};

// ---------------------------------------------------------------------------
// Отложенное выполнение задач
// ---------------------------------------------------------------------------

const DEFERRED_NODES: MsNode[] = [
  { id: "client", label: "Client" },
  { id: "proxy", label: "Proxy" },
  { id: "queue", label: "Queue" },
  { id: "uploader", label: "Video Uploader" },
];
const DEFERRED_POS: Record<string, { x: number; y: number }> = {
  client: { x: 80, y: 130 },
  proxy: { x: 280, y: 130 },
  queue: { x: 480, y: 210 },
  uploader: { x: 560, y: 60 },
};

export type DeferredMode = "sync" | "async";

export const DEFERRED_MODES: { id: DeferredMode; label: string; hint: string }[] = [
  {
    id: "sync",
    label: "Синхронно",
    hint: "Клиент держит соединение открытым, пока Video Uploader полностью не обработает файл.",
  },
  {
    id: "async",
    label: "Через очередь",
    hint: "Proxy сразу отпускает клиента, задача обрабатывается в фоне — когда Video Uploader освободится.",
  },
];

const SYNC_STEPS: MsStep[] = [
  {
    id: 1,
    label: "Клиент → Proxy → Video Uploader",
    legs: [
      { from: "client", to: "proxy", kind: "write", delayUnits: 0 },
      { from: "proxy", to: "uploader", kind: "request", delayUnits: 1 },
    ],
    description: "Запрос идёт напрямую до конечного обработчика.",
  },
  {
    id: 2,
    label: "Клиент ждёт, пока видео полностью обработается",
    legs: [
      { from: "uploader", to: "proxy", kind: "response", delayUnits: 0 },
      { from: "proxy", to: "client", kind: "response", delayUnits: 1 },
    ],
    description:
      "Соединение держится открытым всё время обработки — долго, а обрыв связи на середине означает потерянную работу.",
  },
];

const ASYNC_STEPS: MsStep[] = [
  {
    id: 1,
    label: "Клиент → Proxy",
    legs: [{ from: "client", to: "proxy", kind: "write", delayUnits: 0 }],
    description: "Proxy принимает запрос на загрузку.",
  },
  {
    id: 2,
    label: "Proxy кладёт задачу в очередь и сразу отвечает клиенту",
    legs: [
      { from: "proxy", to: "queue", kind: "write", delayUnits: 0 },
      { from: "proxy", to: "client", kind: "response", delayUnits: 1 },
    ],
    description: "Клиент отпущен почти мгновенно — ему не нужно ждать реальной обработки видео.",
  },
  {
    id: 3,
    label: "Video Uploader сам забирает задачу, когда освобождается",
    legs: [{ from: "uploader", to: "queue", kind: "read", delayUnits: 0 }],
    description:
      "Если Video Uploader упадёт, задача останется в очереди и будет обработана позже, когда он восстановится — работа не теряется.",
  },
];

export function getDeferredSteps(mode: DeferredMode): MsStep[] {
  return mode === "sync" ? SYNC_STEPS : ASYNC_STEPS;
}

export const deferredScenario: MsScenario = {
  id: "deferred",
  label: "Отложенное выполнение задач",
  hint: "Синхронный вызов превращается в постановку в очередь, чтобы не держать клиента во время долгой обработки.",
  nodes: DEFERRED_NODES,
  pos: DEFERRED_POS,
  edges: [
    ["client", "proxy"],
    ["proxy", "uploader"],
    ["proxy", "queue"],
    ["uploader", "queue"],
  ],
  steps: SYNC_STEPS,
};
