// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import topologiesSource from "./topologies.ts?raw";
import diagramSource from "./ReplicationDiagram.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const replicationTopologies: PatternModule = {
  meta: {
    id: "replication-topologies",
    title: "Репликация: топологии",
    category: "architectural",
    summary:
      "Master-Slave, Master-Master, Master-less — кто пишет, кто читает и что происходит с записью, когда узел падает.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: три топологии, каждая — свой сценарий шагов + позиции узлов.
      filename: "topologies.ts",
      language: "typescript",
      source: topologiesSource,
    },
    {
      // Диаграмма с произвольным графом рёбер (не только цепочка) + состояния узлов.
      filename: "ReplicationDiagram.tsx",
      language: "tsx",
      source: diagramSource,
    },
    {
      // Переключатель топологии + пошаговый плеер сценария.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default replicationTopologies;
