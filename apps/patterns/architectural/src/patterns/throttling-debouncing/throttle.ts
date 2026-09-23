/**
 * Throttling и debouncing решают одну проблему — "события сыпятся чаще,
 * чем имеет смысл на них реагировать" (быстрый ввод в поиске, resize окна,
 * скролл), — но по-разному:
 *  - throttle — реагировать не чаще, чем раз в N миллисекунд, независимо
 *    от того, сколько событий пришло за это время;
 *  - debounce — реагировать только после того, как события ПЕРЕСТАЛИ
 *    приходить хотя бы на N миллисекунд (лучше для «пользователь закончил
 *    печатать»).
 */

export const THROTTLE_MS = 700;
export const DEBOUNCE_MS = 700;

/** Не чаще одного вызова onFire раз в intervalMs — лишние вызовы trigger() просто игнорируются. */
export function createThrottler(intervalMs: number, onFire: () => void) {
  let lastFire = -Infinity;
  return {
    trigger() {
      const now = Date.now();
      if (now - lastFire >= intervalMs) {
        lastFire = now;
        onFire();
      }
    },
    reset() {
      lastFire = -Infinity;
    },
  };
}

/** onFire вызывается один раз, только если trigger() не вызывали ещё delayMs. Каждый новый trigger() сбрасывает таймер. */
export function createDebouncer(delayMs: number, onFire: () => void) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return {
    trigger() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        onFire();
        timer = null;
      }, delayMs);
    },
    cancel() {
      if (timer) clearTimeout(timer);
      timer = null;
    },
  };
}
