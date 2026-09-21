/**
 * Кэширование: два способа взаимодействия сервиса с кэшем и базой —
 * Cache-Aside (сервис сам координирует оба похода) и Cache-Through
 * (сервис ходит только в кэш, а кэш сам умеет читать/писать в БД).
 * Разница видна не в результате, а в МАРШРУТЕ запроса — это и рисует Demo.
 * Плюс LRU-вытеснение: кэш ограничен по размеру.
 */

export type CacheStrategyId = "cache-aside" | "cache-through";

export const CACHE_STRATEGIES: {
  id: CacheStrategyId;
  label: string;
  hint: string;
}[] = [
  {
    id: "cache-aside",
    label: "Cache-Aside",
    hint: "Сервис сам решает, когда идти в кэш, а когда в БД — вся координация на его стороне.",
  },
  {
    id: "cache-through",
    label: "Cache-Through (Read/Write Through)",
    hint: "Сервис ходит только в кэш — при промахе кэш сам читает из БД и сохраняет результат; сервис про БД вообще не знает.",
  },
];

/** Узлы диаграммы, между которыми "путешествует" запрос. */
export type CacheNodeId = "service" | "cache" | "db";

export interface CacheOpDef {
  id: number;
  op: "get" | "set";
  key: string;
  value?: string;
}

/** Ёмкость кэша в демо — специально маленькая, чтобы дожить до вытеснения. */
export const CACHE_CAPACITY = 3;

export const DEFAULT_CACHE_TIMELINE: CacheOpDef[] = [
  { id: 1, op: "get", key: "user:1" },
  { id: 2, op: "get", key: "user:2" },
  { id: 3, op: "get", key: "user:1" },
  { id: 4, op: "set", key: "user:2", value: "user:2 (обновлён)" },
  { id: 5, op: "get", key: "user:3" },
  { id: 6, op: "get", key: "user:4" },
  { id: 7, op: "get", key: "user:1" },
  { id: 8, op: "get", key: "user:2" },
];

/**
 * Один "перегон" маршрута:
 *  - read     — полноценный круговой обмен: запрос летит туда, ответ с
 *               данными сразу же летит обратно (адресат уже знает ответ).
 *  - write    — данные едут только вперёд, отвечать нечем.
 *  - request  — вопрос летит вперёд, но ответа СРАЗУ не будет: адресат сам
 *               ещё не знает ответа (например, кэш при промахе).
 *  - response — ответ с данными едет вперёд САМ ПО СЕБЕ, без парного запроса
 *               в этом же перегоне, — доставка результата, добытого раньше
 *               через другой узел (например, кэш относит сервису то, что
 *               перед этим получил из БД).
 */
export interface CacheLeg {
  from: CacheNodeId;
  to: CacheNodeId;
  kind: "read" | "write" | "request" | "response";
}

/** Один кадр симуляции: один операция (GET/SET) целиком, с маршрутом. */
export interface CacheStep {
  id: number;
  op: "get" | "set";
  key: string;
  hit: boolean;
  /** Маршрут запроса как последовательность перегонов service/cache/db. */
  legs: CacheLeg[];
  /** Содержимое кэша ПОСЛЕ операции, от недавно использованного к давнему. */
  cacheEntries: string[];
  evictedKey: string | null;
  description: string;
}

/**
 * Прогоняет таймлайн операций через выбранную стратегию.
 * "База данных" и "кэш" — просто Map в замыкании; кэш хранит порядок
 * использования (MRU в начале списка) для LRU-вытеснения при переполнении.
 */
export function simulateCaching(
  strategyId: CacheStrategyId,
  ops: CacheOpDef[],
  capacity: number = CACHE_CAPACITY,
): CacheStep[] {
  const db = new Map<string, string>();
  let cacheOrder: string[] = []; // MRU первый

  function touch(key: string) {
    cacheOrder = [key, ...cacheOrder.filter((k) => k !== key)];
  }

  function evictIfNeeded(): string | null {
    if (cacheOrder.length <= capacity) return null;
    const evicted = cacheOrder[cacheOrder.length - 1];
    cacheOrder = cacheOrder.slice(0, capacity);
    return evicted;
  }

  const steps: CacheStep[] = [];

  for (const opDef of ops) {
    const legs: CacheLeg[] = [];
    let evictedKey: string | null = null;
    let description: string;

    if (opDef.op === "get") {
      const hit = cacheOrder.includes(opDef.key);

      if (hit) {
        // Кэш отвечает сразу — обычный круговой обмен "спросил → получил".
        legs.push({ from: "service", to: "cache", kind: "read" });
        touch(opDef.key);
        description =
          strategyId === "cache-aside"
            ? `GET ${opDef.key}: попадание в кэш — сервис получил значение сразу, в БД не ходил.`
            : `GET ${opDef.key}: попадание — кэш отдал значение сам, сервис про БД даже не знает.`;
      } else {
        if (strategyId === "cache-aside") {
          // Кэш сразу отвечает "нет" (свой круговой обмен) — и сервис САМ идёт в БД.
          legs.push({ from: "service", to: "cache", kind: "read" });
          legs.push({ from: "service", to: "db", kind: "read" });
          // Сервис сам кладёт найденное значение в кэш — это запись, ответа с данными тут не будет.
          legs.push({ from: "service", to: "cache", kind: "write" });
        } else {
          // Cache-Through: сервис спрашивает кэш и ЖДЁТ — ответа сразу нет,
          // потому что кэш ещё не знает ответа. Кэш сам идёт в БД (свой
          // круговой обмен), и только получив данные — относит их сервису
          // отдельным перегоном. Без этого последнего перегона выглядело бы
          // так, будто кэш сходил в БД и данные испарились.
          legs.push({ from: "service", to: "cache", kind: "request" });
          legs.push({ from: "cache", to: "db", kind: "read" });
          legs.push({ from: "cache", to: "service", kind: "response" });
        }
        const value = db.get(opDef.key) ?? `значение(${opDef.key})`;
        db.set(opDef.key, value);
        touch(opDef.key);
        evictedKey = evictIfNeeded();
        description =
          (strategyId === "cache-aside"
            ? `GET ${opDef.key}: промах — сервис сам читает БД и сам кладёт результат в кэш.`
            : `GET ${opDef.key}: промах — кэш сам сходил в БД и принёс результат сервису.`) +
          (evictedKey ? ` Кэш переполнен, вытеснили «${evictedKey}» (LRU).` : "");
      }

      steps.push({
        id: opDef.id,
        op: "get",
        key: opDef.key,
        hit,
        legs,
        cacheEntries: [...cacheOrder],
        evictedKey,
        description,
      });
      continue;
    }

    // SET — оба перегона это запись: данные едут только вперёд, читать тут нечего.
    const value = opDef.value ?? `значение(${opDef.key})`;
    if (strategyId === "cache-aside") {
      legs.push({ from: "service", to: "db", kind: "write" });
      legs.push({ from: "service", to: "cache", kind: "write" });
    } else {
      legs.push({ from: "service", to: "cache", kind: "write" });
      legs.push({ from: "cache", to: "db", kind: "write" });
    }
    db.set(opDef.key, value);
    touch(opDef.key);
    evictedKey = evictIfNeeded();
    description =
      (strategyId === "cache-aside"
        ? `SET ${opDef.key}: сервис сам пишет в БД, потом сам обновляет кэш.`
        : `SET ${opDef.key}: сервис пишет только в кэш, а кэш сам синхронно пишет в БД.`) +
      (evictedKey ? ` Кэш переполнен, вытеснили «${evictedKey}» (LRU).` : "");

    steps.push({
      id: opDef.id,
      op: "set",
      key: opDef.key,
      hit: false,
      legs,
      cacheEntries: [...cacheOrder],
      evictedKey,
      description,
    });
  }

  return steps;
}
