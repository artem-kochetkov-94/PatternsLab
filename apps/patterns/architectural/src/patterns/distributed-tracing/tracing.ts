/**
 * Распределённый трейсинг: один запрос проходит через несколько сервисов,
 * каждый "спан" — операция с началом и длительностью, вложенная в спан
 * родителя. Главная польза трейса — не в том, что он показывает путь
 * запроса (это умеют и логи), а в том, что он показывает ВРЕМЯ каждого
 * шага относительно других, включая параллельные — и сразу видно, кто из
 * параллельных вызовов реально определяет итоговую задержку.
 */

export interface TraceSpan {
  id: string;
  parentId: string | null;
  service: string;
  operation: string;
  startMs: number;
  durationMs: number;
}

export const SERVICE_LABELS: Record<string, string> = {
  gateway: "API Gateway",
  auth: "Auth",
  orders: "Orders",
  db: "DB",
};

export const SERVICE_TONE: Record<string, "indigo" | "sky" | "amber" | "rose"> = {
  gateway: "indigo",
  auth: "sky",
  orders: "amber",
  db: "rose",
};

/**
 * Gateway параллельно дёргает Auth и Orders. Auth укладывается в 40мс — не
 * узкое место. А вот Orders сам идёт в БД, и именно этот вложенный запрос
 * (25→155мс) оказывается самым долгим звеном всей цепочки в 180мс.
 */
export const TRACE_SPANS: TraceSpan[] = [
  {
    id: "root",
    parentId: null,
    service: "gateway",
    operation: "GET /checkout",
    startMs: 0,
    durationMs: 180,
  },
  {
    id: "auth",
    parentId: "root",
    service: "auth",
    operation: "POST /verify-token",
    startMs: 10,
    durationMs: 40,
  },
  {
    id: "orders",
    parentId: "root",
    service: "orders",
    operation: "GET /orders/:id",
    startMs: 15,
    durationMs: 150,
  },
  {
    id: "orders-db",
    parentId: "orders",
    service: "db",
    operation: "SELECT * FROM orders WHERE id = ?",
    startMs: 25,
    durationMs: 130,
  },
];

export const TRACE_TOTAL_MS = Math.max(
  ...TRACE_SPANS.map((s) => s.startMs + s.durationMs),
);

/** Глубина вложенности спана — для отступа строки в waterfall. */
export function spanDepth(span: TraceSpan): number {
  let depth = 0;
  let current = span;
  while (current.parentId) {
    const parent = TRACE_SPANS.find((s) => s.id === current.parentId);
    if (!parent) break;
    depth += 1;
    current = parent;
  }
  return depth;
}

export interface TraceStep {
  id: number;
  spanId: string;
  description: string;
}

export const TRACE_STEPS: TraceStep[] = [
  {
    id: 1,
    spanId: "root",
    description:
      "Запрос GET /checkout приходит на API Gateway — открывается корневой спан трейса.",
  },
  {
    id: 2,
    spanId: "auth",
    description: "Gateway параллельно вызывает Auth-сервис, чтобы проверить токен запроса.",
  },
  {
    id: 3,
    spanId: "orders",
    description: "И одновременно, не дожидаясь ответа Auth, вызывает Orders-сервис за составом заказа.",
  },
  {
    id: 4,
    spanId: "orders-db",
    description:
      "Orders-сервис идёт в базу за данными. Auth уже давно ответил за 40мс — а этот вложенный запрос к БД растягивается на 130мс и оказывается настоящим узким местом всей цепочки в 180мс.",
  },
];

export function getSpan(spanId: string): TraceSpan {
  const span = TRACE_SPANS.find((s) => s.id === spanId);
  if (!span) throw new Error(`Unknown span: ${spanId}`);
  return span;
}
