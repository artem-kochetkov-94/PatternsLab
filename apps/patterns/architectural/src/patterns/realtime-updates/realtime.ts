/**
 * Три способа для клиента узнавать об изменениях на сервере — разница в
 * том, КТО и КОГДА инициирует передачу:
 *  - Polling — клиент сам спрашивает каждые N секунд, есть ли что-то новое
 *    (в большинстве случаев ответ — «нет»);
 *  - Long Polling — клиент спрашивает один раз, но сервер не отвечает
 *    сразу, а держит соединение открытым, пока не появятся данные;
 *  - Streaming — одно долгоживущее соединение, сервер сам решает, когда
 *    что-то прислать, без повторных запросов вообще.
 */

export type RealtimeMode = "polling" | "long-polling" | "streaming";

export const REALTIME_MODES: { id: RealtimeMode; label: string; hint: string }[] = [
  {
    id: "polling",
    label: "Polling",
    hint: "Клиент сам спрашивает каждые N секунд — просто, но чаще всего впустую, а данные могут устареть на целый интервал.",
  },
  {
    id: "long-polling",
    label: "Long Polling",
    hint: "Клиент спрашивает один раз, сервер держит соединение открытым, пока не появятся данные.",
  },
  {
    id: "streaming",
    label: "Streaming",
    hint: "Одно долгоживущее соединение — сервер сам решает, когда что-то прислать, без повторных запросов.",
  },
];

export type RealtimeLegKind = "request" | "response";

export interface RealtimeStep {
  id: number;
  label: string;
  leg: { kind: RealtimeLegKind } | null;
  waiting: boolean;
  description: string;
}

const POLLING_STEPS: RealtimeStep[] = [
  {
    id: 1,
    label: "Клиент запрашивает обновления",
    leg: { kind: "request" },
    waiting: false,
    description: "Обычный запрос — «есть что-то новое?».",
  },
  {
    id: 2,
    label: "Сервер отвечает сразу",
    leg: { kind: "response" },
    waiting: false,
    description: "Чаще всего ответ — «нет, ничего нового» — запрос потрачен впустую.",
  },
  {
    id: 3,
    label: "Клиент ждёт N секунд",
    leg: null,
    waiting: true,
    description: "Всё это время новые данные (если появились) клиенту неизвестны.",
  },
  {
    id: 4,
    label: "Клиент запрашивает снова",
    leg: { kind: "request" },
    waiting: false,
    description: "Цикл повторяется — независимо от того, изменилось что-то или нет.",
  },
  {
    id: 5,
    label: "На этот раз есть данные",
    leg: { kind: "response" },
    waiting: false,
    description: "Данные дошли до клиента с задержкой до N секунд — ровно столько, сколько длится интервал опроса.",
  },
];

const LONG_POLLING_STEPS: RealtimeStep[] = [
  {
    id: 1,
    label: "Клиент запрашивает обновления",
    leg: { kind: "request" },
    waiting: false,
    description: "Запрос уходит один раз.",
  },
  {
    id: 2,
    label: "Сервер НЕ отвечает сразу",
    leg: null,
    waiting: true,
    description: "Соединение остаётся открытым — сервер ждёт, пока появятся новые данные (или таймаут).",
  },
  {
    id: 3,
    label: "Появились новые данные — сервер отвечает",
    leg: { kind: "response" },
    waiting: false,
    description: "Ответ приходит почти сразу, как только событие произошло — а не по расписанию.",
  },
  {
    id: 4,
    label: "Клиент сразу переподключается",
    leg: { kind: "request" },
    waiting: false,
    description: "Новый долгий запрос уходит немедленно — цикл начинается заново.",
  },
];

const STREAMING_STEPS: RealtimeStep[] = [
  {
    id: 1,
    label: "Клиент открывает соединение один раз",
    leg: { kind: "request" },
    waiting: false,
    description: "Единственный запрос за весь сеанс — дальше соединение просто остаётся открытым.",
  },
  {
    id: 2,
    label: "Сервер шлёт событие",
    leg: { kind: "response" },
    waiting: false,
    description: "Никакого нового запроса от клиента не требовалось.",
  },
  {
    id: 3,
    label: "Сервер шлёт ещё одно событие",
    leg: { kind: "response" },
    waiting: false,
    description: "И ещё одно — по тому же самому соединению.",
  },
  {
    id: 4,
    label: "И ещё одно",
    leg: { kind: "response" },
    waiting: false,
    description: "Сервер сам решает, когда и что прислать — клиент только слушает.",
  },
];

export function getRealtimeSteps(mode: RealtimeMode): RealtimeStep[] {
  switch (mode) {
    case "polling":
      return POLLING_STEPS;
    case "long-polling":
      return LONG_POLLING_STEPS;
    case "streaming":
      return STREAMING_STEPS;
  }
}
