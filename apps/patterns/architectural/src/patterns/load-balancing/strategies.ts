/**
 * Балансировщик нагрузки: три стратегии выбора инстанса для запроса.
 * Логика полностью отделена от UI — на вход список инстансов и запросов,
 * на выход трасса событий (кто когда пришёл/ушёл), которую уже рисует Demo.
 */

export interface LbInstance {
  /** Уникальный id инстанса. */
  id: string;
  /** Название для отображения, напр. "Instance #1". */
  label: string;
  /** Вес — используется только Weighted Round Robin. */
  weight: number;
}

export interface LbRequestDef {
  /** Порядковый номер запроса (для отображения). */
  id: number;
  /** Условный "тик" времени, на котором запрос приходит. */
  arrivalTick: number;
  /** Сколько тиков запрос держит соединение открытым (имитация обработки). */
  duration: number;
}

export type LbStrategyId =
  | "round-robin"
  | "weighted-round-robin"
  | "least-connections";

export const LB_STRATEGIES: {
  id: LbStrategyId;
  label: string;
  hint: string;
}[] = [
  {
    id: "round-robin",
    label: "Round Robin",
    hint: "Каждый следующий запрос уходит следующему инстансу по кругу — без учёта их текущей нагрузки.",
  },
  {
    id: "weighted-round-robin",
    label: "Weighted Round Robin",
    hint: "Тот же круг, но инстансы с большим весом получают запросы чаще — учитывается их «мощность», а не текущая нагрузка.",
  },
  {
    id: "least-connections",
    label: "Least Connections",
    hint: "Запрос уходит инстансу с наименьшим числом активных соединений — балансировщик реагирует на реальную нагрузку.",
  },
];

/** Один кадр симуляции: запрос либо пришёл, либо завершился. */
export interface LbStep {
  kind: "arrive" | "finish";
  tick: number;
  requestId: number;
  instanceId: string;
  /** Снимок активных соединений по всем инстансам ПОСЛЕ этого события. */
  connections: Record<string, number>;
  description: string;
}

interface FinishEvent {
  tick: number;
  requestId: number;
  instanceId: string;
}

function labelOf(instances: LbInstance[], id: string): string {
  return instances.find((inst) => inst.id === id)?.label ?? id;
}

/** Round Robin: тупо следующий по кругу, без памяти о нагрузке. */
function pickRoundRobin(
  instances: LbInstance[],
  cursor: { i: number },
): LbInstance {
  const chosen = instances[cursor.i % instances.length];
  cursor.i += 1;
  return chosen;
}

/**
 * Smooth Weighted Round Robin — тот же алгоритм, что использует nginx.
 * У каждого инстанса растёт "текущий вес" на величину его "номинального";
 * выбираем максимум и тут же уменьшаем его на сумму всех весов.
 * Так инстансы с большим весом получают запросы чаще, но распределение
 * остаётся равномерным внутри цикла, а не пачками подряд.
 */
function makeWeightedPicker(instances: LbInstance[]) {
  const current = new Map(instances.map((inst) => [inst.id, 0]));
  const totalWeight = instances.reduce((sum, inst) => sum + inst.weight, 0);

  return function pick(): LbInstance {
    for (const inst of instances) {
      current.set(inst.id, (current.get(inst.id) ?? 0) + inst.weight);
    }
    let best = instances[0];
    for (const inst of instances) {
      if ((current.get(inst.id) ?? 0) > (current.get(best.id) ?? 0)) {
        best = inst;
      }
    }
    current.set(best.id, (current.get(best.id) ?? 0) - totalWeight);
    return best;
  };
}

/**
 * Least Connections: выбираем инстанс с минимумом активных соединений.
 * Простаивающие инстансы часто набирают одинаковый минимум (0) — без
 * тай-брейка выбор всегда падал бы на первый по списку, и остальные
 * простаивали бы незаслуженно. Поэтому среди инстансов с равным минимумом
 * дополнительно крутим свой Round Robin.
 */
function makeLeastConnectionsPicker(instances: LbInstance[]) {
  const tieCursor = { i: 0 };

  return function pick(connections: Record<string, number>): LbInstance {
    const min = Math.min(...instances.map((inst) => connections[inst.id]));
    const candidates = instances.filter((inst) => connections[inst.id] === min);
    const chosen = candidates[tieCursor.i % candidates.length];
    tieCursor.i += 1;
    return chosen;
  };
}

function describeChoice(
  strategyId: LbStrategyId,
  chosen: LbInstance,
  instances: LbInstance[],
  connections: Record<string, number>,
  req: LbRequestDef,
): string {
  if (strategyId === "round-robin") {
    return `Запрос #${req.id} → «${chosen.label}» — просто следующий по кругу.`;
  }
  if (strategyId === "weighted-round-robin") {
    return `Запрос #${req.id} → «${chosen.label}» (вес ${chosen.weight}) — с бо́льшим весом инстанс получает запросы чаще остальных.`;
  }
  const load = instances
    .map((inst) => `${inst.label}=${connections[inst.id]}`)
    .join(", ");
  return `Запрос #${req.id} → «${chosen.label}» — у него сейчас меньше всего активных соединений (${load}).`;
}

/**
 * Прогоняет все запросы через выбранную стратегию как дискретное
 * событийное моделирование: на каждом тике сначала освобождаются
 * соединения от завершившихся запросов, потом распределяются новые —
 * это гарантирует, что Least Connections видит актуальную нагрузку.
 */
export function simulateLoadBalancing(
  strategyId: LbStrategyId,
  instances: LbInstance[],
  requests: LbRequestDef[],
): LbStep[] {
  const connections: Record<string, number> = Object.fromEntries(
    instances.map((inst) => [inst.id, 0]),
  );
  const rrCursor = { i: 0 };
  const pickWeighted = makeWeightedPicker(instances);
  const pickLeastConnections = makeLeastConnectionsPicker(instances);

  const pendingFinishes: FinishEvent[] = [];
  const steps: LbStep[] = [];

  const lastTick = Math.max(
    ...requests.map((req) => req.arrivalTick + req.duration),
  );

  for (let tick = 0; tick <= lastTick; tick++) {
    const finishesNow = pendingFinishes
      .filter((fin) => fin.tick === tick)
      .sort((a, b) => a.requestId - b.requestId);

    for (const fin of finishesNow) {
      connections[fin.instanceId] -= 1;
      steps.push({
        kind: "finish",
        tick,
        requestId: fin.requestId,
        instanceId: fin.instanceId,
        connections: { ...connections },
        description: `Запрос #${fin.requestId} завершён — освобождаем соединение на «${labelOf(instances, fin.instanceId)}».`,
      });
    }

    const arrivalsNow = requests
      .filter((req) => req.arrivalTick === tick)
      .sort((a, b) => a.id - b.id);

    for (const req of arrivalsNow) {
      const chosen =
        strategyId === "round-robin"
          ? pickRoundRobin(instances, rrCursor)
          : strategyId === "weighted-round-robin"
            ? pickWeighted()
            : pickLeastConnections(connections);

      connections[chosen.id] += 1;
      pendingFinishes.push({
        tick: tick + req.duration,
        requestId: req.id,
        instanceId: chosen.id,
      });

      steps.push({
        kind: "arrive",
        tick,
        requestId: req.id,
        instanceId: chosen.id,
        connections: { ...connections },
        description: describeChoice(
          strategyId,
          chosen,
          instances,
          connections,
          req,
        ),
      });
    }
  }

  return steps;
}

/** Три инстанса с разными весами — веса заметны только в Weighted RR. */
export const DEFAULT_INSTANCES: LbInstance[] = [
  { id: "i1", label: "Instance #1", weight: 3 },
  { id: "i2", label: "Instance #2", weight: 1 },
  { id: "i3", label: "Instance #3", weight: 1 },
];

/**
 * Таймлайн запросов: длительности подобраны так, чтобы было видно разницу
 * подходов — часть запросов "тяжёлые" (держат соединение дольше), и на
 * Round Robin / Weighted RR это может перегрузить один инстанс, пока
 * Least Connections уводит новые запросы от занятого.
 */
export const DEFAULT_REQUESTS: LbRequestDef[] = [
  { id: 1, arrivalTick: 0, duration: 5 },
  { id: 2, arrivalTick: 1, duration: 1 },
  { id: 3, arrivalTick: 2, duration: 1 },
  { id: 4, arrivalTick: 3, duration: 1 },
  { id: 5, arrivalTick: 4, duration: 1 },
  { id: 6, arrivalTick: 5, duration: 3 },
  { id: 7, arrivalTick: 6, duration: 1 },
  { id: 8, arrivalTick: 7, duration: 1 },
  { id: 9, arrivalTick: 8, duration: 1 },
];
