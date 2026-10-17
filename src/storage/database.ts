import Database from "@tauri-apps/plugin-sql";

export const DATABASE_URL = "sqlite:opd-prep.db";

let database: Database | null = null;

/**
 * Check if the app runs in Tauri. The SQL plugin needs the Tauri runtime.
 */
export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Get the SQLite database. The Rust setup preloads this connection and runs
 * the migrations. Reuse the same handle for each call.
 */
export function getDatabase(): Promise<Database> {
  if (!isTauriRuntime()) {
    return Promise.reject(new Error("The SQLite database needs the Tauri app."));
  }

  database ??= Database.get(DATABASE_URL);
  return Promise.resolve(database);
}
