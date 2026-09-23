// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import strategiesSource from "./strategies.ts?raw";
import diagramSource from "./ReleaseDiagram.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const releaseStrategies: PatternModule = {
  meta: {
    id: "release-strategies",
    title: "Стратегии релизов",
    category: "architectural",
    summary:
      "Rolling / Blue-Green / Canary — что происходит с трафиком, пока новая версия раскатывается, и чем платим за скорость или безопасность выкатки.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: три стратегии, каждая — свой сценарий шагов (состояние инстансов + трафик).
      filename: "strategies.ts",
      language: "typescript",
      source: strategiesSource,
    },
    {
      // Диаграмма без анимации пакетов: router + инстансы, состояние трафика меняется по шагам.
      filename: "ReleaseDiagram.tsx",
      language: "tsx",
      source: diagramSource,
    },
    {
      // Переключатель стратегии + пошаговый плеер сценария раскатки.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default releaseStrategies;
