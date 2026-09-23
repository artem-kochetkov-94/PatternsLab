/**
 * Три способа не дать одному сбойному участку положить всю систему:
 *  - Retries + Backoff — повторяем упавший запрос, но не мгновенно и не
 *    бесконечно (и только если операция идемпотентна — иначе повтор
 *    натворит бед, например, спишет деньги дважды);
 *  - Backpressure — что делать, если один сервис шлёт запросов больше,
 *    чем следующий успевает обработать;
 *  - Graceful Degradation / Fallback — под нагрузкой или при сбое
 *    отключаем необязательное (Degradation) или подменяем ответ заглушкой
 *    (Fallback), лишь бы не упасть целиком.
 */

export type RetryLegKind = "request" | "error" | "success";

export interface RetryStep {
  id: number;
  label: string;
  leg: { kind: RetryLegKind } | null;
  waitMs: number | null;
  description: string;
}

export const RETRY_STEPS: RetryStep[] = [
  {
    id: 1,
    label: "Клиент отправляет запрос",
    leg: { kind: "request" },
    waitMs: null,
    description: "Обычный запрос — пока всё штатно.",
  },
  {
    id: 2,
    label: "Сервер отвечает ошибкой",
    leg: { kind: "error" },
    waitMs: null,
    description: "Таймаут или 5xx — запрос не выполнен. Повторить прямо сейчас — плохая идея: упавший сервис ещё не отдышался.",
  },
  {
    id: 3,
    label: "Backoff: ждём 100мс",
    leg: null,
    waitMs: 100,
    description: "Фиксированная или растущая пауза перед повтором — чтобы не устроить сервису DDoS собственными ретраями.",
  },
  {
    id: 4,
    label: "Повторяем запрос",
    leg: { kind: "request" },
    waitMs: null,
    description: "Тот же запрос уходит снова.",
  },
  {
    id: 5,
    label: "Снова ошибка",
    leg: { kind: "error" },
    waitMs: null,
    description: "Сервис всё ещё не оправился.",
  },
  {
    id: 6,
    label: "Экспоненциальный backoff: ждём 200мс",
    leg: null,
    waitMs: 200,
    description: "При каждой следующей попытке пауза растёт — экспоненциальный backoff снижает нагрузку на и без того страдающий сервис.",
  },
  {
    id: 7,
    label: "Повторяем ещё раз",
    leg: { kind: "request" },
    waitMs: null,
    description: "Третья попытка.",
  },
  {
    id: 8,
    label: "Успех",
    leg: { kind: "success" },
    waitMs: null,
    description:
      "Получилось. Но: повторять безопасно только ИДЕМПОТЕНТНЫЕ операции (GET, PUT, DELETE — результат от повтора не меняется). POST без специальной защиты повторять нельзя — можно списать деньги или создать заказ дважды.",
  },
];

// ---------------------------------------------------------------------------
// Backpressure
// ---------------------------------------------------------------------------

export interface BackpressureStep {
  id: number;
  label: string;
  incomingRate: number;
  processingRate: number;
  backlog: number;
  description: string;
}

export const BACKPRESSURE_STEPS: BackpressureStep[] = [
  {
    id: 1,
    label: "t = 0 сек",
    incomingRate: 150,
    processingRate: 100,
    backlog: 0,
    description: "Service 1 шлёт 150 запросов в секунду, Service 2 успевает обработать только 100.",
  },
  {
    id: 2,
    label: "t = 10 сек",
    incomingRate: 150,
    processingRate: 100,
    backlog: 500,
    description: "Разница в 50 запросов/сек копится в очереди перед Service 2.",
  },
  {
    id: 3,
    label: "t = 60 сек",
    incomingRate: 150,
    processingRate: 100,
    backlog: 3000,
    description: "За минуту накопилось 3000 необработанных запросов — с этим уже нужно что-то делать.",
  },
  {
    id: 4,
    label: "Стратегия: drop",
    incomingRate: 150,
    processingRate: 100,
    backlog: 200,
    description: "Отбрасываем лишнее (например, самые старые запросы) — backlog не растёт бесконечно, но часть работы теряется.",
  },
  {
    id: 5,
    label: "Стратегия: buffer с лимитом",
    incomingRate: 150,
    processingRate: 100,
    backlog: 1000,
    description: "Держим очередь ограниченного размера — как только она заполнена, новые запросы получают ошибку 429 (Too Many Requests) вместо тихой потери.",
  },
  {
    id: 6,
    label: "Стратегия: signal back (настоящий backpressure)",
    incomingRate: 100,
    processingRate: 100,
    backlog: 0,
    description: "Service 2 сигнализирует Service 1 «притормози» — тот сам снижает скорость отправки до 100 запросов/сек, очередь не растёт вообще.",
  },
];

// ---------------------------------------------------------------------------
// Graceful Degradation
// ---------------------------------------------------------------------------

export interface DegradationService {
  id: string;
  label: string;
  critical: boolean;
}

export const DEGRADATION_SERVICES: DegradationService[] = [
  { id: "driver", label: "Driver", critical: true },
  { id: "customer", label: "Customer", critical: true },
  { id: "calculation", label: "Calculation", critical: true },
  { id: "payment", label: "Payment", critical: true },
  { id: "navigator", label: "Navigator", critical: false },
  { id: "load", label: "Load Balancing", critical: false },
  { id: "yplus", label: "YPlus", critical: false },
  { id: "advertisement", label: "Advertisement", critical: false },
];

// ---------------------------------------------------------------------------
// Fallback
// ---------------------------------------------------------------------------

export type RecommendationHealth = "healthy" | "down";
