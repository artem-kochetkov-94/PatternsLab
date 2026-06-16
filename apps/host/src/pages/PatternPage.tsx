import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  categoryLabels,
  getPatternById,
  type PatternModule,
} from "@patterns-lab/core";
import { loadPattern } from "../lib/loadPattern";
import { PatternTabs } from "../components/PatternTabs";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; module: PatternModule };

export function PatternPage() {
  const { id } = useParams<{ id: string }>();
  const entry = id ? getPatternById(id) : undefined;

  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!entry) return;
    let cancelled = false;

    setState({ status: "loading" });
    loadPattern(entry)
      .then((module) => {
        if (!cancelled) setState({ status: "ready", module });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [entry]);

  if (!entry) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white">Паттерн не найден</h1>
        <Link to="/" className="mt-4 inline-block text-indigo-400 hover:underline">
          ← К каталогу
        </Link>
      </div>
    );
  }

  const { meta } = entry;

  return (
    <div>
      <Link to="/" className="text-sm text-indigo-400 hover:underline">
        ← К каталогу
      </Link>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {categoryLabels[meta.category]}
      </p>
      <h1 className="mt-1 text-3xl font-bold text-white">{meta.title}</h1>
      <p className="mt-2 max-w-2xl text-slate-400">{meta.summary}</p>

      <div className="mt-10">
        {state.status === "loading" && (
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-10 text-center text-slate-500">
            Загружаем микрофронтенд…
          </div>
        )}

        {state.status === "error" && (
          <div className="rounded-lg border border-red-900 bg-red-950/40 p-6 text-red-300">
            <p className="font-semibold">Не удалось загрузить демо</p>
            <p className="mt-1 text-sm text-red-400">{state.message}</p>
            <p className="mt-3 text-xs text-red-400/70">
              Запущен ли remote «{entry.remote}» на своём порту?
            </p>
          </div>
        )}

        {state.status === "ready" && <PatternTabs module={state.module} />}
      </div>
    </div>
  );
}
