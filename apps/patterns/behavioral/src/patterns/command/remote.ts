/**
 * Command (Команда) — пример "очередь и макрос". Чистый TypeScript, без React.
 *
 * Здесь раскрывается другая сторона паттерна: раз действие — это ОБЪЕКТ,
 * команды можно не выполнять сразу, а складывать в очередь, переставлять,
 * сохранять и запускать пачкой. Несколько команд легко объединяются в одну
 * составную команду (MacroCommand) — "сценарий".
 *
 * Интерфейс Command тот же, что и в `editor.ts` — паттерн один, меняется
 * лишь получатель и способ применения команд.
 */

/** Команда: знает, как выполнить действие и как откатить его назад. */
export interface Command {
  /** Человекочитаемое имя для очереди/журнала. */
  readonly label: string;
  /** Выполнить действие над получателем. */
  execute(): void;
  /** Отменить действие. */
  undo(): void;
}

/** Идентификаторы устройств умного дома. */
export type DeviceId = "light" | "door" | "music" | "ac";

/** Получатель (Receiver) — умный дом, хранит состояние устройств. */
export class SmartHome {
  private state: Record<DeviceId, boolean> = {
    light: false,
    door: false,
    music: false,
    ac: false,
  };

  isOn(id: DeviceId): boolean {
    return this.state[id];
  }

  set(id: DeviceId, on: boolean): void {
    this.state[id] = on;
  }
}

/**
 * Команда "перевести устройство в заданное состояние".
 * Перед изменением запоминает прежнее состояние — чтобы уметь откатиться.
 */
export class SetDeviceCommand implements Command {
  private previous = false;

  constructor(
    readonly label: string,
    private readonly home: SmartHome,
    private readonly device: DeviceId,
    private readonly on: boolean,
  ) {}

  execute(): void {
    this.previous = this.home.isOn(this.device);
    this.home.set(this.device, this.on);
  }

  undo(): void {
    this.home.set(this.device, this.previous);
  }
}

/**
 * Составная команда (Macro) — сама является командой, но внутри хранит
 * список других команд. execute() прогоняет их по порядку, undo() —
 * откатывает в обратном порядке. Клиент работает с ней как с одной командой.
 */
export class MacroCommand implements Command {
  constructor(
    readonly label: string,
    private readonly commands: Command[],
  ) {}

  execute(): void {
    this.commands.forEach((command) => command.execute());
  }

  undo(): void {
    // Откатываем в обратном порядке — как разбирают стопку: сверху вниз.
    [...this.commands].reverse().forEach((command) => command.undo());
  }
}
