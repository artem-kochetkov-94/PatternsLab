/**
 * Реализация паттерна "Наблюдатель" (Observer) — чистый TypeScript,
 * без привязки к React. Это "ядро" паттерна, которое мы потом покажем в демо.
 */

/** Наблюдатель: умеет принимать обновлённое значение от субъекта. */
export interface Observer<T> {
  update(value: T): void;
}

/**
 * Субъект (источник событий). Хранит состояние и список подписчиков.
 * При изменении состояния уведомляет всех наблюдателей.
 */
export class Subject<T> {
  private observers = new Set<Observer<T>>();

  constructor(private value: T) {}

  /**
   * Подписать наблюдателя. Сразу отдаёт ему текущее состояние.
   * Возвращает функцию отписки (удобно для useEffect-cleanup).
   */
  subscribe(observer: Observer<T>): () => void {
    this.observers.add(observer);
    observer.update(this.value);
    return () => {
      this.observers.delete(observer);
    };
  }

  /** Изменить состояние и уведомить ВСЕХ подписчиков. */
  setValue(value: T): void {
    this.value = value;
    this.observers.forEach((observer) => observer.update(value));
  }

  /** Текущее состояние. */
  getValue(): T {
    return this.value;
  }

  /** Сколько сейчас активных подписчиков. */
  get observerCount(): number {
    return this.observers.size;
  }
}
