import { Link } from "react-router-dom";
import { categoryOrder, getPatternsByCategory } from "@patterns-lab/core";

export function CatalogPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Каталог паттернов</h1>
      <p className="mt-2 max-w-2xl text-slate-400">
        Интерактивная платформа для изучения паттернов проектирования.
        Каждый паттерн — отдельный микрофронтенд со своим демо и разбором.
      </p>

      <div className="mt-10 space-y-12">
        {categoryOrder.map(({ id, label }) => {
          const patterns = getPatternsByCategory(id);
          if (patterns.length === 0) return null;

          return (
            <section key={id}>
              <h2 className="mb-4 text-xl font-semibold text-white">
                {label}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {patterns.map((entry) => (
                  <Link
                    key={entry.meta.id}
                    to={`/pattern/${entry.meta.id}`}
                    className="group rounded-lg border border-slate-800 bg-slate-900 p-5 transition hover:border-indigo-500 hover:bg-slate-800"
                  >
                    <h3 className="font-semibold text-white group-hover:text-indigo-400">
                      {entry.meta.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {entry.meta.summary}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
