// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import consensusSource from "./consensus.ts?raw";
import bullyDiagramSource from "./BullyDiagram.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const locksLeaderElection: PatternModule = {
  meta: {
    id: "locks-leader-election",
    title: "Консенсус: блокировки и выбор лидера",
    category: "architectural",
    summary:
      "Redis SET NX PX против гонки за блокировку + Bully algorithm: как узлы сами выбирают нового лидера без внешнего арбитра, когда прежний пропал.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: сценарии блокировок (unsafe/safe) + пошаговый Bully algorithm.
      filename: "consensus.ts",
      language: "typescript",
      source: consensusSource,
    },
    {
      // Диаграмма выборов лидера — 6 узлов по кругу.
      filename: "BullyDiagram.tsx",
      language: "tsx",
      source: bullyDiagramSource,
    },
    {
      // Две вкладки, каждая — свой пошаговый плеер.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default locksLeaderElection;
