/**
 * Та же идея "Итератора", но уже встроенная в сам язык — протокол итерации
 * JavaScript. Объект итерируемый, если у него есть метод `[Symbol.iterator]()`,
 * возвращающий итератор с `next()`, который выдаёт `{ value, done }`.
 *
 * На этом протоколе держатся `for...of`, spread `[...x]`, деструктуризация,
 * `Array.from`, `Map`/`Set`. Реализовав его, наш объект "из коробки"
 * работает со всеми этими конструкциями.
 */

/**
 * Числовой диапазон [from, to) с шагом step — собственная, "ручная"
 * реализация протокола итерации (без генераторов), чтобы было видно
 * сам контракт: метод-фабрика итератора + next() с { value, done }.
 */
export class Range implements Iterable<number> {
  constructor(
    private from: number,
    private to: number,
    private step = 1,
  ) {}

  [Symbol.iterator](): Iterator<number> {
    let current = this.from;
    const { to, step } = this;
    return {
      next(): IteratorResult<number> {
        if (current < to) {
          const value = current;
          current += step;
          return { value, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }
}

/**
 * Бесконечный источник натуральных чисел. Сам по себе он ничего не считает —
 * значения появляются ТОЛЬКО когда их запрашивают через next() (лень).
 * Поэтому бесконечность не страшна: мы возьмём ровно столько, сколько нужно.
 */
export function* naturals(): Generator<number> {
  let n = 1;
  while (true) {
    yield n++;
  }
}

/** Ленивое преобразование: пробрасывает значения источника через fn. */
export function* map<T, U>(
  source: Iterable<T>,
  fn: (value: T) => U,
): Generator<U> {
  for (const value of source) {
    yield fn(value);
  }
}

/** Ленивый фильтр: пропускает только значения, прошедшие предикат. */
export function* filter<T>(
  source: Iterable<T>,
  predicate: (value: T) => boolean,
): Generator<T> {
  for (const value of source) {
    if (predicate(value)) {
      yield value;
    }
  }
}

/**
 * Берёт первые `count` элементов из ЛЮБОГО итерируемого — даже бесконечного.
 * Как только набрали нужное число, прекращаем тянуть из источника:
 * именно здесь "ленивый конвейер" обрывается и больше ничего не вычисляется.
 */
export function take<T>(source: Iterable<T>, count: number): T[] {
  const result: T[] = [];
  if (count <= 0) return result;
  for (const value of source) {
    result.push(value);
    if (result.length >= count) break;
  }
  return result;
}
