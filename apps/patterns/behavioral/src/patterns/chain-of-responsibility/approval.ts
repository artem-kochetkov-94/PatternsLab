/**
 * Chain of Responsibility — стратегия "first-match" (первый, кто справился).
 * Чистый TypeScript, без привязки к React. Это "ядро" примера.
 *
 * Идея: запрос идёт по цепочке обработчиков. Первое звено, которое может
 * его обработать, делает это и ОСТАНАВЛИВАЕТ цепочку — дальше не передаём.
 * Отправитель не знает, кто именно справится с запросом.
 *
 * Сравните с `validation.ts`: там цепочка собрана так же (setNext + handle),
 * но звено передаёт запрос дальше иначе — отсюда другое поведение.
 */

/** Запрос на согласование расхода. */
export interface ExpenseRequest {
  /** Сумма расхода. */
  amount: number;
  /** На что просят денег (для наглядности в демо). */
  purpose: string;
}

/** Что сделал конкретный обработчик с запросом. */
export type StepAction = "approved" | "passed";

/** Один шаг прохождения запроса по цепочке (для визуализации). */
export interface ChainStep {
  /** Имя обработчика. */
  handler: string;
  /** Лимит, в рамках которого он может одобрять. */
  limit: number;
  /** Согласовал сам или передал дальше. */
  action: StepAction;
}

/** Итог прохождения запроса по всей цепочке. */
export interface Resolution {
  /** Кто согласовал; null — никто в цепочке не смог. */
  approvedBy: string | null;
  /** Путь запроса: через кого прошёл и что каждый сделал, по порядку. */
  steps: ChainStep[];
}

/**
 * Звено цепочки — согласующий с собственным лимитом.
 *
 * Ключевая механика паттерна — два метода:
 *  - setNext: связывает звено со следующим (и возвращает его, чтобы
 *    цепочку можно было собирать "по-цепочке": a.setNext(b).setNext(c));
 *  - handle: либо обрабатывает запрос сам, либо делегирует следующему.
 */
export class Approver {
  private next: Approver | null = null;

  constructor(
    /** Имя согласующего, напр. "Тимлид". */
    public readonly title: string,
    /** Максимальная сумма, которую он вправе одобрить. */
    public readonly limit: number,
  ) {}

  /** Назначить следующее звено. Возвращает его — для fluent-сборки цепочки. */
  setNext(next: Approver): Approver {
    this.next = next;
    return next;
  }

  /**
   * Обработать запрос. Если сумма в пределах лимита — согласовываем здесь.
   * Иначе передаём дальше по цепочке. Если следующего нет — запрос отклонён.
   *
   * `steps` накапливает маршрут запроса — это нужно только демо для анимации,
   * к самому паттерну отношения не имеет.
   */
  handle(request: ExpenseRequest, steps: ChainStep[] = []): Resolution {
    const canApprove = request.amount <= this.limit;

    steps.push({
      handler: this.title,
      limit: this.limit,
      action: canApprove ? "approved" : "passed",
    });

    if (canApprove) {
      return { approvedBy: this.title, steps };
    }

    if (this.next) {
      return this.next.handle(request, steps);
    }

    // Дошли до конца цепочки, но никто не справился.
    return { approvedBy: null, steps };
  }
}

/**
 * Собрать цепочку из списка согласующих по порядку и вернуть её начало
 * (первое звено), которому и отдаётся запрос.
 */
export function buildChain(approvers: Approver[]): Approver {
  approvers.reduce((prev, curr) => prev.setNext(curr));
  return approvers[0];
}
