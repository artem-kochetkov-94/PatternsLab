import { useRef, useState } from "react";
import {
  MacroCommand,
  SetDeviceCommand,
  SmartHome,
  type Command,
  type DeviceId,
} from "./remote";

/** Описание устройств — только для отрисовки карточек. */
const DEVICES: { id: DeviceId; name: string; icon: string }[] = [
  { id: "light", name: "Свет", icon: "💡" },
  { id: "door", name: "Дверь", icon: "🚪" },
  { id: "music", name: "Музыка", icon: "🎵" },
  { id: "ac", name: "Кондиционер", icon: "❄️" },
];

/** Палитра доступных команд — что можно положить в очередь сценария. */
const PALETTE: { device: DeviceId; on: boolean; label: string }[] = [
  { device: "light", on: true, label: "Включить свет" },
  { device: "light", on: false, label: "Выключить свет" },
  { device: "door", on: true, label: "Открыть дверь" },
  { device: "door", on: false, label: "Закрыть дверь" },
  { device: "music", on: true, label: "Включить музыку" },
  { device: "music", on: false, label: "Выключить музыку" },
  { device: "ac", on: true, label: "Включить кондиционер" },
  { device: "ac", on: false, label: "Выключить кондиционер" },
];

/**
 * Пример "очередь и макрос". Кнопки палитры не управляют домом напрямую —
 * они создают команды и складывают их в очередь. Команды копятся, не
 * выполняясь. По кнопке «Запустить» очередь сворачивается в одну составную
 * команду (MacroCommand) и выполняется целиком; отменить сценарий тоже можно
 * целиком — это и есть выгода от того, что действие стало объектом.
 */
export function RemoteDemo() {
  const homeRef = useRef(new SmartHome());
  const [, setTick] = useState(0);
  const rerender = () => setTick((n) => n + 1);

  // Очередь запланированных команд (ещё не выполнены).
  const [queue, setQueue] = useState<Command[]>([]);
  // Последний выполненный сценарий — его можно отменить.
  const [lastMacro, setLastMacro] = useState<MacroCommand | null>(null);

  const home = homeRef.current;

  const enqueue = (device: DeviceId, on: boolean, label: string) => {
    setQueue((q) => [...q, new SetDeviceCommand(label, home, device, on)]);
  };

  const runScenario = () => {
    if (queue.length === 0) return;
    // Сворачиваем очередь в одну составную команду и выполняем её.
    const macro = new MacroCommand("Сценарий", queue);
    macro.execute();
    setLastMacro(macro);
    setQueue([]);
    rerender();
  };

  const undoScenario = () => {
    if (!lastMacro) return;
    lastMacro.undo();
    setLastMacro(null);
    rerender();
  };

  return (
    <div className="space-y-6">
      {/* Устройства — получатели команд. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {DEVICES.map((device) => {
          const on = home.isOn(device.id);
          return (
            <div
              key={device.id}
              className={[
                "rounded-lg border p-4 text-center transition-colors duration-300",
                on
                  ? "border-emerald-500 bg-emerald-950"
                  : "border-slate-700 bg-slate-900",
              ].join(" ")}
            >
              <div className="text-2xl">{device.icon}</div>
              <p className="mt-1 text-sm font-semibold text-white">
                {device.name}
              </p>
              <p
                className={[
                  "text-xs",
                  on ? "text-emerald-400" : "text-slate-500",
                ].join(" ")}
              >
                {on ? "вкл" : "выкл"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Палитра команд: добавляют команду в очередь, дом пока не трогают. */}
      <div className="space-y-3">
        <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
          Собрать сценарий
        </p>
        <div className="flex flex-wrap gap-2">
          {PALETTE.map((item) => (
            <button
              key={item.label}
              onClick={() => enqueue(item.device, item.on, item.label)}
              className="rounded border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-indigo-500 hover:text-white"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Очередь запланированных команд. */}
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Очередь команд</p>
          <span className="text-xs text-slate-500">
            {queue.length} в очереди
          </span>
        </div>

        {queue.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500">
            пусто — соберите сценарий из команд выше
          </p>
        ) : (
          <ol className="mt-3 space-y-1">
            {queue.map((command, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm text-slate-300"
              >
                <span className="w-5 text-right text-xs text-slate-600">
                  {i + 1}
                </span>
                <span className="rounded bg-slate-800 px-2 py-0.5">
                  {command.label}
                </span>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={runScenario}
            disabled={queue.length === 0}
            className="rounded bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ▶ Запустить сценарий
          </button>
          <button
            onClick={() => setQueue([])}
            disabled={queue.length === 0}
            className="rounded border border-slate-700 px-4 py-1.5 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Очистить очередь
          </button>
          <button
            onClick={undoScenario}
            disabled={!lastMacro}
            className="rounded bg-slate-700 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ↶ Отменить сценарий
          </button>
        </div>
      </div>
    </div>
  );
}
