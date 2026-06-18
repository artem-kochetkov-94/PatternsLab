/**
 * Command (Команда) — пример с Undo/Redo. Чистый TypeScript, без React.
 * Это "ядро" примера.
 *
 * Идея: каждое действие над документом упаковано в объект-команду с двумя
 * методами — execute() и undo(). Раз действие — это объект, его можно
 * сложить в историю, а значит отменить и повторить.
 *
 * Получатель (TextDocument) не знает про историю, а отправитель (кнопки UI)
 * не знает, как именно меняется документ — он лишь отдаёт команду Invoker'у.
 */

/**
 * Команда: знает, как выполнить действие и как откатить его назад.
 * `label` нужен только для наглядной истории в демо.
 */
export interface Command {
  /** Человекочитаемое имя для журнала истории. */
  readonly label: string;
  /** Выполнить действие над получателем. */
  execute(): void;
  /** Отменить действие — вернуть получателя в состояние до execute(). */
  undo(): void;
}

/**
 * Получатель (Receiver) — документ, который хранит текст.
 * Сам по себе ничего не знает о командах: умеет лишь менять свой текст.
 */
export class TextDocument {
  text = "";
}

/**
 * Команда "дописать текст в конец".
 * Для отмены достаточно отрезать ровно столько символов, сколько добавили.
 */
export class AppendText implements Command {
  readonly label: string;

  constructor(
    private readonly doc: TextDocument,
    private readonly chunk: string,
  ) {
    this.label = `Ввод «${chunk}»`;
  }

  execute(): void {
    this.doc.text += this.chunk;
  }

  undo(): void {
    this.doc.text = this.doc.text.slice(0, -this.chunk.length);
  }
}

/**
 * Команда "стереть последний символ".
 * Чтобы уметь отменить удаление, команда ЗАПОМИНАЕТ стёртый символ —
 * это и есть состояние, нужное для отката.
 */
export class DeleteLast implements Command {
  readonly label = "Стереть символ";
  private removed = "";

  constructor(private readonly doc: TextDocument) {}

  execute(): void {
    this.removed = this.doc.text.slice(-1);
    this.doc.text = this.doc.text.slice(0, -1);
  }

  undo(): void {
    this.doc.text += this.removed;
  }
}

/**
 * Команда "очистить документ".
 * Запоминает весь прежний текст, чтобы восстановить его при отмене.
 */
export class ClearAll implements Command {
  readonly label = "Очистить всё";
  private previous = "";

  constructor(private readonly doc: TextDocument) {}

  execute(): void {
    this.previous = this.doc.text;
    this.doc.text = "";
  }

  undo(): void {
    this.doc.text = this.previous;
  }
}

/**
 * Invoker (отправитель + история). Он один знает о порядке действий и
 * умеет откатывать/повторять их. О деталях команд он ничего не знает —
 * работает только через интерфейс execute()/undo().
 *
 * Две стопки:
 *  - done   — выполненные команды (их можно отменить);
 *  - undone — отменённые команды (их можно повторить).
 * Новая команда очищает стопку undone — повторять стало нечего.
 */
export class History {
  private done: Command[] = [];
  private undone: Command[] = [];

  /** Выполнить новую команду и положить её в историю. */
  execute(command: Command): void {
    command.execute();
    this.done.push(command);
    this.undone = [];
  }

  /** Отменить последнюю выполненную команду. */
  undo(): void {
    const command = this.done.pop();
    if (!command) return;
    command.undo();
    this.undone.push(command);
  }

  /** Повторить последнюю отменённую команду. */
  redo(): void {
    const command = this.undone.pop();
    if (!command) return;
    command.execute();
    this.done.push(command);
  }

  get canUndo(): boolean {
    return this.done.length > 0;
  }

  get canRedo(): boolean {
    return this.undone.length > 0;
  }

  /** Список названий выполненных команд по порядку — для журнала в демо. */
  get log(): string[] {
    return this.done.map((command) => command.label);
  }
}
