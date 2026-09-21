/**
 * Circuit Breaker — защищает вызывающего от бесполезных походов к упавшему
 * сервису. Три состояния:
 *  - closed     — всё как обычно, запросы идут к backend, считаем отказы.
 *  - open       — backend признан недоступным, запросы отбиваются сразу
 *                 (fast fail), backend не трогаем вообще.
 *  - half-open  — после паузы пускаем ОДИН пробный запрос: получилось —
 *                 закрываем цепь, снова упал — опять открываем и ждём ещё.
 */

export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitConfig {
  /** Сколько отказов подряд в closed-состоянии размыкают цепь. */
  failureThreshold: number;
  /** Сколько "тиков" цепь остаётся разомкнутой, прежде чем дать пробный запрос. */
  openDurationTicks: number;
}

export const DEFAULT_CONFIG: CircuitConfig = {
  failureThreshold: 3,
  openDurationTicks: 3,
};

/** Заранее известный (авторский) исход запроса — что случится, ЕСЛИ он дойдёт до backend. */
export interface RequestOutcomeDef {
  id: number;
  tick: number;
  willSucceed: boolean;
}

export type RequestOutcome = "success" | "failure" | "short-circuited";

export interface CircuitStep {
  id: number;
  tick: number;
  stateBefore: CircuitState;
  stateAfter: CircuitState;
  /** true — запрос реально дошёл до backend (closed или пробный half-open). */
  attempted: boolean;
  outcome: RequestOutcome;
  consecutiveFailures: number;
  description: string;
}

/**
 * Прогоняет таймлайн запросов через state machine автомата защиты.
 * Переход open → half-open происходит "лениво": проверяется перед
 * обработкой ближайшего запроса, а не по таймеру в реальном времени —
 * этого достаточно для дискретной модели.
 */
export function simulateCircuitBreaker(
  requests: RequestOutcomeDef[],
  config: CircuitConfig = DEFAULT_CONFIG,
): CircuitStep[] {
  let state: CircuitState = "closed";
  let consecutiveFailures = 0;
  let openSinceTick = -Infinity;

  const steps: CircuitStep[] = [];

  for (const req of requests) {
    // "Ленивый" переход open → half-open — проверяем ДО фиксации stateBefore,
    // иначе пробный запрос в UI будет подписан как "open", а не "half-open".
    if (
      state === "open" &&
      req.tick - openSinceTick >= config.openDurationTicks
    ) {
      state = "half-open";
    }
    const stateBefore = state;

    let attempted: boolean;
    let outcome: RequestOutcome;
    let description: string;

    if (state === "open") {
      attempted = false;
      outcome = "short-circuited";
      description = `Запрос #${req.id}: цепь разомкнута — мгновенный отказ, backend даже не потревожили.`;
    } else if (state === "half-open") {
      attempted = true;
      if (req.willSucceed) {
        outcome = "success";
        state = "closed";
        consecutiveFailures = 0;
        description = `Запрос #${req.id}: пробный запрос в half-open прошёл — цепь снова замкнута.`;
      } else {
        outcome = "failure";
        state = "open";
        openSinceTick = req.tick;
        description = `Запрос #${req.id}: пробный запрос в half-open снова упал — backend ещё не восстановился, опять размыкаем.`;
      }
    } else {
      attempted = true;
      if (req.willSucceed) {
        outcome = "success";
        consecutiveFailures = 0;
        description = `Запрос #${req.id}: успех, счётчик отказов сброшен.`;
      } else {
        outcome = "failure";
        consecutiveFailures += 1;
        if (consecutiveFailures >= config.failureThreshold) {
          state = "open";
          openSinceTick = req.tick;
          description = `Запрос #${req.id}: отказ №${consecutiveFailures} подряд — порог (${config.failureThreshold}) достигнут, размыкаем цепь.`;
        } else {
          description = `Запрос #${req.id}: отказ №${consecutiveFailures} подряд из ${config.failureThreshold} — цепь пока замкнута.`;
        }
      }
    }

    steps.push({
      id: req.id,
      tick: req.tick,
      stateBefore,
      stateAfter: state,
      attempted,
      outcome,
      consecutiveFailures,
      description,
    });
  }

  return steps;
}

/**
 * Сценарий: сервис работает → начинает отказывать → цепь размыкается →
 * первая попытка восстановления удаётся → сервис снова ломается → цепь
 * размыкается ещё раз → первая пробная попытка не удаётся (ещё не готов) →
 * вторая пробная попытка удаётся → всё стабильно.
 */
export const DEFAULT_REQUESTS: RequestOutcomeDef[] = [
  { id: 1, tick: 0, willSucceed: true },
  { id: 2, tick: 1, willSucceed: true },
  { id: 3, tick: 2, willSucceed: false },
  { id: 4, tick: 3, willSucceed: false },
  { id: 5, tick: 4, willSucceed: false },
  { id: 6, tick: 5, willSucceed: false },
  { id: 7, tick: 6, willSucceed: false },
  { id: 8, tick: 7, willSucceed: true },
  { id: 9, tick: 8, willSucceed: true },
  { id: 10, tick: 9, willSucceed: false },
  { id: 11, tick: 10, willSucceed: false },
  { id: 12, tick: 11, willSucceed: false },
  { id: 13, tick: 12, willSucceed: false },
  { id: 14, tick: 13, willSucceed: false },
  { id: 15, tick: 14, willSucceed: false },
  { id: 16, tick: 15, willSucceed: true },
  { id: 17, tick: 16, willSucceed: true },
  { id: 18, tick: 17, willSucceed: true },
  { id: 19, tick: 18, willSucceed: true },
];
