import type { ComponentType } from "react";

/**
 * Категория паттерна. Совпадает с разбиением remote-приложений:
 * на каждую категорию — свой микрофронтенд (remote).
 */
export type PatternCategory =
  | "creational" // порождающие
  | "structural" // структурные
  | "behavioral" // поведенческие
  | "architectural"; // архитектурные подходы

/**
 * Описание паттерна как ДАННЫЕ (без React-компонентов).
 * Важно: это сериализуемо — host использует это для меню и каталога,
 * не загружая при этом код самого паттерна.
 */
export interface PatternMeta {
  /** Уникальный id в kebab-case, напр. "observer". */
  id: string;
  /** Человекочитаемое название, напр. "Observer". */
  title: string;
  /** Категория паттерна. */
  category: PatternCategory;
  /** Короткое описание для карточки в каталоге. */
  summary: string;
}

/**
 * "Разъём" паттерна — то, что ОБЯЗАН экспортировать каждый модуль паттерна
 * внутри remote-приложения. Host грузит этот объект и рисует его части.
 */
export interface PatternModule {
  /** Метаданные паттерна. */
  meta: PatternMeta;
  /** Живое интерактивное демо паттерна. */
  Demo: ComponentType;
  /** Теоретический разбор: что за паттерн, когда применять. */
  Explanation: ComponentType;
}
