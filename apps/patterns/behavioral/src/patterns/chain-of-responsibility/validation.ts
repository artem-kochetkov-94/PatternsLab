/**
 * Chain of Responsibility — стратегия "pipeline" (цепочка проверок).
 * Чистый TypeScript, без привязки к React. Это "ядро" примера.
 *
 * Та же механика, что и в `approval.ts` (звенья связаны через setNext,
 * запрос обрабатывается в handle), но звено НЕ "забирает" запрос себе —
 * каждый валидатор проверяет форму и передаёт её дальше по цепочке.
 *
 * Один и тот же набор валидаторов работает в двух режимах — разница
 * ровно в одном решении "когда остановиться":
 *  - "fail-fast"   — прерываемся на ПЕРВОЙ непройденной проверке;
 *  - "collect-all" — проходим цепочку до конца и собираем ВСЕ ошибки.
 */

/** Форма, которую проверяем. */
export interface Form {
  name: string;
  email: string;
  age: number;
}

/** Режим прохождения цепочки. */
export type Mode = "fail-fast" | "collect-all";

/** Что произошло на конкретном звене (для визуализации). */
export interface CheckStep {
  title: string;
  /** ok — проверка пройдена, error — провалена, skipped — не дошли (fail-fast). */
  status: "ok" | "error" | "skipped";
  /** Текст ошибки, если status === "error". */
  message: string | null;
}

/** Итог прохождения цепочки. */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  steps: CheckStep[];
}

/**
 * Звено цепочки — валидатор. Концептуально то же, что Approver:
 * хранит ссылку на следующее звено и решает в handle, передавать ли дальше.
 */
export class Validator {
  private next: Validator | null = null;

  constructor(
    /** Что проверяем, напр. "Имя заполнено". */
    public readonly title: string,
    /** Проверка: вернёт текст ошибки или null, если всё хорошо. */
    private readonly check: (form: Form) => string | null,
  ) {}

  /** Назначить следующее звено. Возвращает его — для fluent-сборки цепочки. */
  setNext(next: Validator): Validator {
    this.next = next;
    return next;
  }

  /**
   * Прогнать форму через это звено и (в зависимости от режима) дальше.
   * `result` копит маршрут и ошибки по мере прохождения цепочки.
   */
  handle(form: Form, mode: Mode, result: ValidationResult): ValidationResult {
    const message = this.check(form);

    if (message) {
      result.errors.push(message);
      result.steps.push({ title: this.title, status: "error", message });

      // Вот всё различие между стратегиями: в fail-fast обрываем цепочку
      // прямо здесь — следующие звенья просто не вызываются.
      if (mode === "fail-fast") {
        result.valid = false;
        return result;
      }
    } else {
      result.steps.push({ title: this.title, status: "ok", message: null });
    }

    // Передаём дальше по цепочке.
    if (this.next) {
      return this.next.handle(form, mode, result);
    }

    // Дошли до конца: форма валидна, если ни одно звено не дало ошибку.
    result.valid = result.errors.length === 0;
    return result;
  }
}

/** Собрать цепочку валидаторов по порядку и вернуть её начало. */
export function buildChain(validators: Validator[]): Validator {
  validators.reduce((prev, curr) => prev.setNext(curr));
  return validators[0];
}

/** Запустить проверку формы по цепочке в выбранном режиме. */
export function validate(
  head: Validator,
  form: Form,
  mode: Mode,
): ValidationResult {
  return head.handle(form, mode, { valid: true, errors: [], steps: [] });
}
