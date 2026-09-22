import { useEffect, useRef, useState } from "react";
import {
  ROWS,
  RING_KEYS,
  RING_SHARDS,
  assignConsistentHashing,
  assignModHashing,
  directoryShard,
  keyShard,
  rangeShard,
} from "./sharding";
import { ShardRing } from "./ShardRing";

type Tab = "methods" | "hashing";

const TABS: { id: Tab; label: string }[] = [
  { id: "methods", label: "Способы шардирования" },
  { id: "hashing", label: "Hashing vs Consistent Hashing" },
];

export function Demo() {
  const [tab, setTab] = useState<Tab>("methods");

  return (
    <div className="space-y-6">
      <div className="inline-flex flex-wrap rounded-lg border border-slate-700 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              t.id === tab ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "methods" ? <MethodsPanel /> : <HashingPanel />}
    </div>
  );
}

function MethodsPanel() {
  const [rowId, setRowId] = useState<number>(ROWS[0].id);
  const row = ROWS.find((r) => r.id === rowId)!;

  const results: { label: string; hint: string; value: string; basedOn: string }[] = [
    {
      label: "Range-based",
      hint: "по диапазону значения",
      value: rangeShard(row),
      basedOn: `price = ${row.price}`,
    },
    {
      label: "Key-based",
      hint: "по hash(id)",
      value: keyShard(row),
      basedOn: `id = ${row.id}`,
    },
    {
      label: "Directory-based",
      hint: "по справочнику zone → shard",
      value: directoryShard(row),
      basedOn: `zone = ${row.zone}`,
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Одна и та же строка — три независимых способа решить, в каком шарде ей место. Выбери
        строку и посмотри: способы не синонимы, для одной строки они вполне могут разойтись.
      </p>

      <div className="flex flex-wrap gap-2">
        {ROWS.map((r) => (
          <button
            key={r.id}
            onClick={() => setRowId(r.id)}
            className={[
              "rounded-full border px-3 py-1.5 font-mono text-xs transition-colors",
              r.id === rowId
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
            ].join(" ")}
          >
            id={r.id} price={r.price} zone={r.zone}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {results.map((res) => (
          <div key={res.label} className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
            <p className="font-semibold text-white">{res.label}</p>
            <p className="mt-1 text-xs text-slate-500">{res.hint}</p>
            <p className="mt-3 font-mono text-xs text-slate-400">{res.basedOn}</p>
            <p className="mt-1 rounded-md bg-indigo-950/40 px-3 py-1.5 text-center font-mono text-sm text-indigo-300">
              → {res.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HashingPanel() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ModHashingCard />
      <ConsistentHashingCard />
    </div>
  );
}

function ModHashingCard() {
  const [shardCount, setShardCount] = useState(3);
  const prevCountRef = useRef(3);
  const [moved, setMoved] = useState<Set<string>>(new Set());

  useEffect(() => {
    const prev = assignModHashing(prevCountRef.current);
    const next = assignModHashing(shardCount);
    setMoved(
      new Set(RING_KEYS.filter((k) => prev[k.id] !== next[k.id]).map((k) => k.id)),
    );
    prevCountRef.current = shardCount;
  }, [shardCount]);

  const assignment = assignModHashing(shardCount);

  return (
    <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <p className="font-semibold text-white">Hashing: F(key) = hash(key) % N</p>
      <p className="text-xs text-slate-500">
        Бакет ключа зависит от ЧИСЛА шардов N. Меняем N — у почти всех ключей меняется остаток.
      </p>

      <div className="flex gap-2">
        {[3, 4].map((n) => (
          <button
            key={n}
            onClick={() => setShardCount(n)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              n === shardCount
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
            ].join(" ")}
          >
            N = {n}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {RING_KEYS.map((key) => (
          <span
            key={key.id}
            className={[
              "rounded-md border px-2 py-1 font-mono text-xs transition-colors",
              moved.has(key.id)
                ? "border-rose-500 bg-rose-950/40 text-rose-300"
                : "border-slate-700 bg-slate-800/60 text-slate-400",
            ].join(" ")}
          >
            {key.id} → {assignment[key.id]}
          </span>
        ))}
      </div>

      <p className="font-mono text-xs text-slate-500">
        переехало: <span className="text-rose-400">{moved.size}</span> / {RING_KEYS.length}
      </p>
    </div>
  );
}

function ConsistentHashingCard() {
  const [activeShardIds, setActiveShardIds] = useState<Set<string>>(
    () => new Set(RING_SHARDS.map((s) => s.id)),
  );
  const prevActiveRef = useRef<Set<string>>(new Set(RING_SHARDS.map((s) => s.id)));
  const [moved, setMoved] = useState<Set<string>>(new Set());

  useEffect(() => {
    const prev = assignConsistentHashing(prevActiveRef.current);
    const next = assignConsistentHashing(activeShardIds);
    setMoved(
      new Set(RING_KEYS.filter((k) => prev[k.id] !== next[k.id]).map((k) => k.id)),
    );
    prevActiveRef.current = new Set(activeShardIds);
  }, [activeShardIds]);

  const assignment = assignConsistentHashing(activeShardIds);

  const toggleShard = (id: string) => {
    setActiveShardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) return prev; // хотя бы один шард должен остаться
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <p className="font-semibold text-white">Consistent Hashing</p>
      <p className="text-xs text-slate-500">
        Ключ достаётся первому активному шарду по часовой стрелке. Добавление/удаление шарда
        задевает только его соседей по кольцу.
      </p>

      <ShardRing
        activeShardIds={activeShardIds}
        assignment={assignment}
        movedKeys={moved}
        onToggleShard={toggleShard}
      />

      <p className="font-mono text-xs text-slate-500">
        переехало: <span className="text-rose-400">{moved.size}</span> / {RING_KEYS.length}
      </p>
    </div>
  );
}
