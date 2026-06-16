import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import observer from "./patterns/observer";
import "./index.css";

const { Demo, Explanation, meta } = observer;

// Автономный режим: этот микрофронтенд можно открыть отдельно на :3001
// и разрабатывать независимо от host. То же демо потом покажет host.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="min-h-screen bg-slate-950 p-10 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-10">
        <header>
          <p className="text-xs uppercase tracking-wider text-slate-500">
            remote: behavioral (автономный режим)
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white">{meta.title}</h1>
        </header>
        <section>
          <Demo />
        </section>
        <section>
          <Explanation />
        </section>
      </div>
    </div>
  </StrictMode>,
);
