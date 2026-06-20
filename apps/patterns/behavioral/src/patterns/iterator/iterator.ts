/**
 * Реализация паттерна "Итератор" (Iterator) в классическом виде GoF —
 * чистый TypeScript, без React. Это "ядро", которое крутится в демо.
 *
 * Суть паттерна: дать единый способ последовательно перебирать элементы
 * коллекции, НЕ раскрывая её внутреннее устройство. Бонус — у одной и той же
 * коллекции может быть НЕСКОЛЬКО итераторов с разными стратегиями обхода.
 */

/** Узел двоичного дерева: значение и (необязательно) две ветви. */
export interface TreeNode<T> {
  value: T;
  left?: TreeNode<T>;
  right?: TreeNode<T>;
}

/**
 * Iterator (GoF) — минимальный контракт обхода: "есть ли ещё" + "дай следующий".
 * Тот, кто им пользуется, ничего не знает про устройство коллекции под ним.
 */
export interface Iterator<T> {
  hasNext(): boolean;
  next(): T;
}

/**
 * Aggregate (коллекция) — умеет выдавать итератор для себя.
 * Здесь ключевая мысль паттерна: один метод, но разные `order` дают
 * РАЗНЫЕ итераторы поверх одних и тех же данных.
 */
export interface IterableCollection<T> {
  createIterator(order: TraversalOrder): Iterator<T>;
}

/** Стратегии обхода дерева — каждой соответствует свой ConcreteIterator. */
export type TraversalOrder =
  | "pre-order" // корень → левое → правое
  | "in-order" // левое → корень → правое
  | "post-order" // левое → правое → корень
  | "level-order"; // по уровням сверху вниз (BFS)

/**
 * Прямой обход (pre-order): сначала узел, потом его потомки.
 * Лениво идём с помощью стека: кладём правого раньше левого,
 * чтобы левый вышел первым.
 */
class PreOrderIterator<T> implements Iterator<T> {
  private stack: TreeNode<T>[];

  constructor(root?: TreeNode<T>) {
    this.stack = root ? [root] : [];
  }

  hasNext(): boolean {
    return this.stack.length > 0;
  }

  next(): T {
    const node = this.stack.pop()!;
    if (node.right) this.stack.push(node.right);
    if (node.left) this.stack.push(node.left);
    return node.value;
  }
}

/**
 * Симметричный обход (in-order): левое поддерево → узел → правое.
 * Для дерева поиска (BST) выдаёт элементы в отсортированном порядке.
 */
class InOrderIterator<T> implements Iterator<T> {
  private stack: TreeNode<T>[] = [];

  constructor(root?: TreeNode<T>) {
    this.pushLeftSpine(root);
  }

  /** Спускаемся по левым рёбрам, складывая узлы в стек. */
  private pushLeftSpine(node?: TreeNode<T>): void {
    while (node) {
      this.stack.push(node);
      node = node.left;
    }
  }

  hasNext(): boolean {
    return this.stack.length > 0;
  }

  next(): T {
    const node = this.stack.pop()!;
    // Узел отдан — теперь его правое поддерево по тем же правилам.
    this.pushLeftSpine(node.right);
    return node.value;
  }
}

/**
 * Обратный обход (post-order): сначала оба потомка, потом сам узел.
 * Узел возвращаем, только когда его правое поддерево уже пройдено —
 * для этого помним последний отданный узел (lastVisited).
 */
class PostOrderIterator<T> implements Iterator<T> {
  private stack: TreeNode<T>[] = [];
  private current?: TreeNode<T>;
  private lastVisited?: TreeNode<T>;

  constructor(root?: TreeNode<T>) {
    this.current = root;
  }

  hasNext(): boolean {
    return Boolean(this.current) || this.stack.length > 0;
  }

  next(): T {
    while (this.current || this.stack.length > 0) {
      if (this.current) {
        // Спускаемся максимально влево.
        this.stack.push(this.current);
        this.current = this.current.left;
        continue;
      }
      const peek = this.stack[this.stack.length - 1];
      if (peek.right && this.lastVisited !== peek.right) {
        // Есть непройденное правое поддерево — идём в него.
        this.current = peek.right;
      } else {
        // Оба потомка пройдены — можно отдать сам узел.
        this.lastVisited = this.stack.pop();
        return peek.value;
      }
    }
    throw new Error("Итератор исчерпан: вызов next() без hasNext()");
  }
}

/**
 * Обход по уровням (level-order / BFS): слева направо, сверху вниз.
 * В отличие от трёх предыдущих использует очередь, а не стек.
 */
class LevelOrderIterator<T> implements Iterator<T> {
  private queue: TreeNode<T>[];

  constructor(root?: TreeNode<T>) {
    this.queue = root ? [root] : [];
  }

  hasNext(): boolean {
    return this.queue.length > 0;
  }

  next(): T {
    const node = this.queue.shift()!;
    if (node.left) this.queue.push(node.left);
    if (node.right) this.queue.push(node.right);
    return node.value;
  }
}

/**
 * Конкретная коллекция — двоичное дерево. Снаружи о его устройстве
 * (узлы, ссылки, стек/очередь обхода) знать не нужно: достаточно
 * попросить итератор нужной стратегии и крутить hasNext/next.
 */
export class BinaryTree<T> implements IterableCollection<T> {
  constructor(private root?: TreeNode<T>) {}

  createIterator(order: TraversalOrder): Iterator<T> {
    switch (order) {
      case "pre-order":
        return new PreOrderIterator(this.root);
      case "in-order":
        return new InOrderIterator(this.root);
      case "post-order":
        return new PostOrderIterator(this.root);
      case "level-order":
        return new LevelOrderIterator(this.root);
    }
  }

  /**
   * Утилита для демо: собрать весь обход в массив, пользуясь ТОЛЬКО
   * публичным контрактом итератора (hasNext/next) — как это сделал бы
   * любой внешний код.
   */
  toArray(order: TraversalOrder): T[] {
    const iterator = this.createIterator(order);
    const result: T[] = [];
    while (iterator.hasNext()) {
      result.push(iterator.next());
    }
    return result;
  }
}
