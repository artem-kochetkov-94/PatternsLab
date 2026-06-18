import { useRef, useState } from "react";
import {
  AppendText,
  ClearAll,
  DeleteLast,
  History,
  TextDocument,
  type Command,
} from "./editor";

/**
 * Пример с Undo/Redo. Каждая кнопка не меняет текст напрямую — она
 * создаёт команду и отдаёт её Invoker'у (History). Поэтому любое действие
 * можно отменить и повторить, а история сама ведёт журнал.
 *
 * Документ и история живут в ref (это изменяемые объекты из "ядра"),
 * а перерисовку запускаем счётчиком `tick` после каждого действия.
 */
const WORDS = ["React", "паттерн", "команда", "undo", "история", "👍"];

export function EditorDemo() {
  // Получатель и Invoker создаются один раз и переживают перерисовки.
  const docRef = useRef(new TextDocument());
  const historyRef = useRef(new History());
  const [, setTick] = useState(0);
  const rerender = () => setTick((n) => n + 1);

  const doc = docRef.current;
  const history = historyRef.current;

  /** Выполнить команду через Invoker и обновить экран. */
  const run = (command: Command) => {
    history.execute(command);
    rerender();
  };

  const undo = () => {
    history.undo();
    rerender();
  };

  const redo = () => {
    history.redo();
    rerender();
  };

  return (
    <div className="space-y-6">
      {/* Документ — получатель команд. */}
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-5">
        <p className="text-sm font-semibold text-white">Документ</p>
        <p className="text-xs text-slate-500">
          получатель команд — сам не знает ни про историю, ни про кнопки
        </p>
        <div className="mt-3 min-h-16 rounded border border-slate-700 bg-slate-950 p-3 font-mono text-sm break-words text-emerald-200">
          {doc.text || (
            <span className="text-slate-600">пусто — введите что-нибудь…</span>
          )}
          <span className="animate-pulse text-emerald-400">▍</span>
        </div>
      </div>

      {/* Пульт: каждая кнопка отправляет команду, не трогая документ напрямую. */}
      <div className="space-y-3">
        <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
          Команды
        </p>
        <div className="flex flex-wrap gap-2">
          {WORDS.map((word) => (
            <button
              key={word}
              onClick={() => run(new AppendText(doc, word + " "))}
              className="rounded border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-indigo-500 hover:text-white"
            >
              + {word}
            </button>
          ))}
          <button
            onClick={() => run(new DeleteLast(doc))}
            disabled={doc.text.length === 0}
            className="rounded border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-amber-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            ⌫ стереть
          </button>
          <button
            onClick={() => run(new ClearAll(doc))}
            disabled={doc.text.length === 0}
            className="rounded border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            🗑 очистить
          </button>
        </div>

        {/* Управление историей — здесь и раскрывается сила паттерна. */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={undo}
            disabled={!history.canUndo}
            className="rounded bg-slate-700 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ↶ Отменить
          </button>
          <button
            onClick={redo}
            disabled={!history.canRedo}
            className="rounded bg-slate-700 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ↷ Повторить
          </button>
        </div>
      </div>

      {/* Журнал истории — список выполненных команд по порядку. */}
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-5">
        <p className="text-sm font-semibold text-white">История команд</p>
        {history.log.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500">
            пока пусто — каждая команда добавит сюда запись
          </p>
        ) : (
          <ol className="mt-3 space-y-1">
            {history.log.map((label, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm text-slate-300"
              >
                <span className="w-5 text-right text-xs text-slate-600">
                  {i + 1}
                </span>
                <span className="rounded bg-slate-800 px-2 py-0.5">{label}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
