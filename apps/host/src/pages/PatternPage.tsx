import { Link, useParams } from "react-router-dom";
import { categoryLabels, getPatternById } from "@patterns-lab/core";

export function PatternPage() {
  const { id } = useParams<{ id: string }>();
  const entry = id ? getPatternById(id) : undefined;

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

      {/* Сюда на Шаге 4 будет подгружаться live-demo из remote-микрофронтенда. */}
      <div className="mt-10 rounded-lg border border-dashed border-slate-700 bg-slate-900 p-10 text-center text-slate-500">
        Здесь появится live-demo паттерна
        <br />
        <span className="text-xs">
          (подключим через Module Federation на следующем шаге)
        </span>
      </div>
    </div>
  );
}
