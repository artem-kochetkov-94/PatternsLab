// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import brokersSource from "./brokers.ts?raw";
import diagramSource from "./BrokerDiagram.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const messageBrokers: PatternModule = {
  meta: {
    id: "message-brokers",
    title: "Брокеры сообщений",
    category: "architectural",
    summary:
      "Kafka (pull, consumer сам забирает из лога партиции) vs RabbitMQ (push, брокер сам толкает сообщение в consumer'а) — разница в том, кто инициирует доставку.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: два готовых сценария (Kafka pull / RabbitMQ push) — не алгоритм.
      filename: "brokers.ts",
      language: "typescript",
      source: brokersSource,
    },
    {
      // Диаграмма с произвольным числом узлов в ряд + состояние брокера.
      filename: "BrokerDiagram.tsx",
      language: "tsx",
      source: diagramSource,
    },
    {
      // Плеер: переключатель брокера + пошаговая прокрутка сценария.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default messageBrokers;
