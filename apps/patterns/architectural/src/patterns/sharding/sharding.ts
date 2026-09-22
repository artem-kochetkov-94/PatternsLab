/**
 * Партиционирование — режем большие таблицы на маленькие куски (секции).
 * Пока эти секции лежат на одном инстансе БД — это "просто" партиционирование
 * (вертикальное — по столбцам, горизонтальное — по строкам). Как только
 * каждый кусок переезжает на СВОЙ ОТДЕЛЬНЫЙ инстанс — это уже шардирование:
 * горизонтальное партиционирование, разнесённое по независимым базам.
 *
 * Вопрос "как распределить строки между шардами" решается тремя разными
 * способами — ниже они применены к ОДНОМУ И ТОМУ ЖЕ набору строк, чтобы
 * было видно: это не синонимы, а самостоятельные, независимые стратегии,
 * которые для одной и той же строки могут дать разные ответы.
 */

export interface ShardRow {
  id: number;
  price: number;
  zone: number;
}

export const ROWS: ShardRow[] = [
  { id: 10, price: 30, zone: 101 },
  { id: 20, price: 57, zone: 202 },
  { id: 30, price: 64, zone: 101 },
  { id: 50, price: 123, zone: 303 },
];

/** Range-based: диапазон значения определяет шард — границы совпадают со слайдом. */
export function rangeShard(row: ShardRow): string {
  if (row.price < 50) return "Shard #1 (0…50)";
  if (row.price < 100) return "Shard #2 (50…100)";
  return "Shard #3 (100+)";
}

/** Key-based: результат hash(id) — независим от значения price или zone. */
const KEY_HASH_SHARD: Record<number, string> = {
  10: "Shard #1",
  20: "Shard #2",
  30: "Shard #1",
  50: "Shard #2",
};
export function keyShard(row: ShardRow): string {
  return KEY_HASH_SHARD[row.id];
}

/** Directory-based: явная таблица "зона → шард", строки одной зоны всегда вместе. */
const DIRECTORY: Record<number, string> = {
  101: "Shard #1",
  202: "Shard #2",
  303: "Shard #3",
};
export function directoryShard(row: ShardRow): string {
  return DIRECTORY[row.zone];
}

// ---------------------------------------------------------------------------
// Hashing vs Consistent Hashing — кольцо
// ---------------------------------------------------------------------------

export interface RingShard {
  id: string;
  label: string;
  /** Позиция на кольце в градусах — используется и в consistent hashing, и как "хэш" для mod-N. */
  angle: number;
}

export const RING_SHARDS: RingShard[] = [
  { id: "s1", label: "Shard #1", angle: 40 },
  { id: "s2", label: "Shard #2", angle: 130 },
  { id: "s3", label: "Shard #3", angle: 230 },
  { id: "s4", label: "Shard #4", angle: 320 },
];

export interface RingKey {
  id: string;
  angle: number;
}

export const RING_KEYS: RingKey[] = [
  { id: "key-A", angle: 10 },
  { id: "key-B", angle: 65 },
  { id: "key-C", angle: 100 },
  { id: "key-D", angle: 160 },
  { id: "key-E", angle: 200 },
  { id: "key-F", angle: 265 },
  { id: "key-G", angle: 300 },
  { id: "key-H", angle: 345 },
];

/**
 * Consistent hashing: ключ достаётся ПЕРВОМУ активному шарду по часовой
 * стрелке от своей позиции на кольце (с переносом через 360°). Добавление
 * или удаление шарда двигает границу только у его ближайших соседей —
 * остальные ключи не замечают изменений.
 */
export function assignConsistentHashing(
  activeShardIds: ReadonlySet<string>,
): Record<string, string> {
  const active = RING_SHARDS.filter((s) => activeShardIds.has(s.id)).sort(
    (a, b) => a.angle - b.angle,
  );
  const result: Record<string, string> = {};
  for (const key of RING_KEYS) {
    const target = active.find((s) => s.angle >= key.angle) ?? active[0];
    result[key.id] = target?.id ?? "—";
  }
  return result;
}

/**
 * Обычный hash % N: у каждого ключа есть псевдо-хэш (его позиция на
 * кольце), и бакет — это остаток от деления на ЧИСЛО шардов. Как только N
 * меняется, у подавляющего большинства ключей меняется и остаток —
 * переезжает почти всё, а не только соседи изменённого шарда.
 */
export function assignModHashing(shardCount: number): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of RING_KEYS) {
    const bucket = key.angle % shardCount;
    result[key.id] = `mod-${bucket}`;
  }
  return result;
}
