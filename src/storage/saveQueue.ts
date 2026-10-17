const DEFAULT_DELAY_MS = 400;

interface PendingSave {
  timer: number;
  save: () => Promise<void>;
}

/**
 * Delay a save for each key. A new save for the same key replaces the old save.
 * The delay stops a save on each keystroke or pointer move.
 */
export class SaveQueue {
  private readonly pending = new Map<string, PendingSave>();

  constructor(private readonly delayMs: number = DEFAULT_DELAY_MS) {}

  /**
   * Schedule a save. A later call for the same key cancels the first save.
   */
  add(key: string, save: () => Promise<void>): void {
    this.cancel(key);

    const timer = window.setTimeout(() => {
      this.pending.delete(key);
      void runSave(save);
    }, this.delayMs);

    this.pending.set(key, { timer, save });
  }

  /**
   * Stop the scheduled save for one key.
   */
  cancel(key: string): void {
    const pending = this.pending.get(key);

    if (pending !== undefined) {
      window.clearTimeout(pending.timer);
      this.pending.delete(key);
    }
  }

  /**
   * Run all scheduled saves at once. Call this before the tab unmounts.
   */
  async flushAll(): Promise<void> {
    const saves = [...this.pending.values()].map((pending) => {
      window.clearTimeout(pending.timer);
      return pending.save;
    });

    this.pending.clear();
    await Promise.all(saves.map((save) => runSave(save)));
  }
}

async function runSave(save: () => Promise<void>): Promise<void> {
  try {
    await save();
  } catch (error) {
    console.error("The app cannot save the item.", error);
  }
}

/**
 * Run one save at once. Log an error when the save fails.
 */
export function saveNow(save: () => Promise<void>): void {
  void runSave(save);
}
