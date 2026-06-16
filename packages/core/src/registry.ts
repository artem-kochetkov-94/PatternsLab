import type { PatternCategory, PatternMeta } from "./types";

/**
 * Одна запись реестра = описание паттерна (meta) + адрес, где его взять.
 * Host читает реестр, строит меню и по этим полям понимает,
 * какой remote и какой модуль внутри него подгружать.
 */
export interface PatternRegistryEntry {
  /** Метаданные паттерна для каталога/меню. */
  meta: PatternMeta;
  /** Имя remote-приложения (микрофронтенда), напр. "behavioral". */
  remote: string;
  /** Какой модуль этот remote отдаёт наружу, напр. "./Observer". */
  exposedModule: string;
}

/**
 * Единый список всех паттернов платформы.
 * Добавить новый паттерн = дописать сюда одну запись.
 */
export const patternRegistry: PatternRegistryEntry[] = [
  {
    meta: {
      id: "observer",
      title: "Observer",
      category: "behavioral",
      summary:
        "Объект-источник уведомляет всех подписчиков об изменениях своего состояния.",
    },
    remote: "behavioral",
    exposedModule: "./Observer",
  },
];

/** Человекочитаемые названия категорий — для заголовков в меню. */
export const categoryLabels: Record<PatternCategory, string> = {
  creational: "Порождающие",
  structural: "Структурные",
  behavioral: "Поведенческие",
  architectural: "Архитектурные",
};

/** Найти запись паттерна по его id. */
export function getPatternById(id: string): PatternRegistryEntry | undefined {
  return patternRegistry.find((entry) => entry.meta.id === id);
}

/** Получить все паттерны одной категории. */
export function getPatternsByCategory(
  category: PatternCategory,
): PatternRegistryEntry[] {
  return patternRegistry.filter((entry) => entry.meta.category === category);
}
