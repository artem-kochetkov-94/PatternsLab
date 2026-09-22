// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import capSource from "./cap.ts?raw";
import diagramSource from "./CapDiagram.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const capTheorem: PatternModule = {
  meta: {
    id: "cap-theorem",
    title: "CAP-теорема",
    category: "architectural",
    summary:
      "Разорви связь между узлами, выбери CP или AP и попробуй прочитать с отрезанного узла — теорема не про формулу, а про то, чем жертвовать во время разрыва сети.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Чистые функции: запись/чтение/переключение партиции — без React.
      filename: "cap.ts",
      language: "typescript",
      source: capSource,
    },
    {
      // Диаграмма двух узлов и связи между ними.
      filename: "CapDiagram.tsx",
      language: "tsx",
      source: diagramSource,
    },
    {
      // Интерактивное состояние: не пошаговый сценарий, а свободные действия пользователя.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default capTheorem;
