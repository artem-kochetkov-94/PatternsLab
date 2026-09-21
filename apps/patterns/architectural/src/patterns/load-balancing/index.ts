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
import diagramSource from "./LoadBalancerDiagram.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const loadBalancing: PatternModule = {
  meta: {
    id: "load-balancing",
    title: "Балансировка нагрузки",
    category: "architectural",
    summary:
      "Round Robin, Weighted Round Robin и Least Connections — как балансировщик распределяет запросы между инстансами и почему это не одно и то же.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Ядро: событийная симуляция трёх стратегий, без React.
      filename: "strategies.ts",
      language: "typescript",
      source: strategiesSource,
    },
    {
      // Диаграмма client → LB → инстансы с анимацией на framer-motion.
      filename: "LoadBalancerDiagram.tsx",
      language: "tsx",
      source: diagramSource,
    },
    {
      // Плеер: переключатель стратегий + пошаговая прокрутка событий.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default loadBalancing;
