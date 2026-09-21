// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import scenariosSource from "./scenarios.ts?raw";
import diagramSource from "./ProxyDiagram.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const proxy: PatternModule = {
  meta: {
    id: "proxy",
    title: "Reverse / Forward Proxy",
    category: "architectural",
    summary:
      "Разница не в технологии, а в направлении: Forward Proxy скрывает клиента от сервера, Reverse Proxy скрывает сервер от клиента.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: два готовых сценария запросов (не алгоритм — тут нечего "решать").
      filename: "scenarios.ts",
      language: "typescript",
      source: scenariosSource,
    },
    {
      // Диаграмма Client — Proxy — Target с барьером и анимацией на framer-motion.
      filename: "ProxyDiagram.tsx",
      language: "tsx",
      source: diagramSource,
    },
    {
      // Плеер: переключатель режима + пошаговая прокрутка сценария.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default proxy;
