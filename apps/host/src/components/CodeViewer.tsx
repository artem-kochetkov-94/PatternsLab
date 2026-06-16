import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import type { CodeSample } from "@patterns-lab/core";

/**
 * Просмотрщик исходников паттерна. Получает массив файлов (CodeSample[]),
 * рисует вкладки и подсвечивает выбранный файл через Prism.
 *
 * Живёт в host (а не в remote) намеренно: подсветка тянет свой CSS, а через
 * Module Federation стили не федерируются. Раз компонент в host — проблемы нет.
 */
export function CodeViewer({ files }: { files: CodeSample[] }) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  if (files.length === 0) return null;

  const file = files[active];

  const copy = async () => {
    await navigator.clipboard.writeText(file.source);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
      {/* Шапка: вкладки-файлы слева, кнопка копирования справа */}
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800/50 pr-2">
        <div className="flex overflow-x-auto">
          {files.map((f, i) => (
            <button
              key={f.filename}
              onClick={() => setActive(i)}
              className={
                "whitespace-nowrap border-b-2 px-4 py-2.5 font-mono text-xs transition-colors " +
                (i === active
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200")
              }
            >
              {f.filename}
            </button>
          ))}
        </div>
        <button
          onClick={copy}
          className="shrink-0 rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-700 hover:text-white"
        >
          {copied ? "Скопировано ✓" : "Копировать"}
        </button>
      </div>

      {/* Сам код с подсветкой */}
      <Highlight
        theme={themes.vsDark}
        code={file.source.replace(/\n$/, "")}
        language={file.language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} overflow-x-auto p-4 text-sm leading-relaxed`}
            style={{ ...style, background: "transparent" }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className="table-row">
                <span className="table-cell select-none pr-4 text-right text-slate-600">
                  {i + 1}
                </span>
                <span className="table-cell">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
