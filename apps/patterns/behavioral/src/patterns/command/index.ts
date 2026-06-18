// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import editorSource from "./editor.ts?raw";
import editorDemoSource from "./EditorDemo.tsx?raw";
import remoteSource from "./remote.ts?raw";
import remoteDemoSource from "./RemoteDemo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const command: PatternModule = {
  meta: {
    id: "command",
    title: "Command",
    category: "behavioral",
    summary:
      "Превращает действие в объект — его можно отменить, поставить в очередь и логировать.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Ядро примера Undo/Redo — чистый TypeScript. С него и стоит начать.
      filename: "editor.ts",
      language: "typescript",
      source: editorSource,
    },
    {
      // Как это ядро используется в UI (редактор с историей).
      filename: "EditorDemo.tsx",
      language: "tsx",
      source: editorDemoSource,
    },
    {
      // Ядро примера "очередь и макрос" — тот же интерфейс Command.
      filename: "remote.ts",
      language: "typescript",
      source: remoteSource,
    },
    {
      // Демо умного дома (очередь команд + сценарий-макрос).
      filename: "RemoteDemo.tsx",
      language: "tsx",
      source: remoteDemoSource,
    },
  ],
};

export default command;
