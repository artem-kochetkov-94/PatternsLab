import { Link, NavLink, Outlet } from "react-router-dom";
import { categoryOrder, getPatternsByCategory } from "@patterns-lab/core";

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl">
        {/* Боковое меню */}
        <aside className="sticky top-0 h-screen w-64 shrink-0 overflow-y-auto border-r border-slate-800 p-6">
          <Link to="/" className="block text-lg font-bold text-white">
            Patterns&nbsp;Lab
          </Link>
          <p className="mt-1 text-xs text-slate-500">
            Паттерны проектирования
          </p>

          <nav className="mt-8 space-y-6">
            {categoryOrder.map(({ id, label }) => {
              const patterns = getPatternsByCategory(id);
              return (
                <div key={id}>
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {label}
                  </h2>
                  {patterns.length === 0 ? (
                    <p className="text-sm text-slate-600">— пока пусто</p>
                  ) : (
                    <ul className="space-y-1">
                      {patterns.map((entry) => (
                        <li key={entry.meta.id}>
                          <NavLink
                            to={`/pattern/${entry.meta.id}`}
                            className={({ isActive }) =>
                              [
                                "block rounded px-2 py-1 text-sm transition",
                                isActive
                                  ? "bg-indigo-600 text-white"
                                  : "text-slate-300 hover:bg-slate-800",
                              ].join(" ")
                            }
                          >
                            {entry.meta.title}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Контент текущей страницы */}
        <main className="flex-1 p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
