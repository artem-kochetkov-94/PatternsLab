// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import discoverySource from "./discovery.ts?raw";
import diagramSource from "./DiscoveryDiagram.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const serviceDiscovery: PatternModule = {
  meta: {
    id: "service-discovery",
    title: "Service Discovery и Heartbeat",
    category: "architectural",
    summary:
      "Как LB узнаёт о новых бэкендах (регистрация) и о падении старых (пропущенный heartbeat) без ручного редактирования конфига.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: сценарий регистрации нового бэкенда и обнаружения падения по heartbeat.
      filename: "discovery.ts",
      language: "typescript",
      source: discoverySource,
    },
    {
      // Диаграмма LB + Service Discovery + бэкенды с изменяемым состоянием.
      filename: "DiscoveryDiagram.tsx",
      language: "tsx",
      source: diagramSource,
    },
    {
      // Пошаговый плеер сценария.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default serviceDiscovery;
