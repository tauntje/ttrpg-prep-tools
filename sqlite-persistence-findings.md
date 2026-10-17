# Persist created cards and tokens

Date: 2026-10-17.

## Goal

Persist the cards and the tokens that the user makes. Use the data to reprint them later. Do not persist the dungeon.

## Answer to the main question

Yes, the current stack works with Tauri. The machine has Rust 1.91.0, Cargo 1.91.0, the Xcode Command Line Tools, and Node.js 26.3.0. The SQL plugin needs Rust 1.90 or later. The frontend is React, TypeScript and Vite. Tauri v2 uses any frontend.

## State of the app now

The app is a Vite and React app. It runs in the browser. There is no server and no database.

The current code makes one A4 page with imported images. This is the dungeon part. It stays in memory only. A page reload removes it.

The card maker and the token maker are empty folders in `src/features/`. The plan in `plan.md` defines them.

`src/storage/designRepository.ts` holds the `DesignRepository` interface. The interface saves and loads a whole `Design`. This shape does not fit the new goal. Replace it with a repository for cards and a repository for tokens.

## What to persist

Persist two things: cards and tokens.

A card holds a title, a subtitle and a body. The card size is 60 mm by 80 mm. The size needs no column.

A token holds the imported picture, the token size, the picture position and scale, and the ring colour. Persist the picture. The user wants a reprint later.

## Option A: Tauri SQL plugin (recommended)

Use `tauri-plugin-sql`, version 2.6.0, with the `sqlite` feature. The frontend uses `@tauri-apps/plugin-sql`, version 2.6.0.

Advantages:

- The plugin uses a native SQLite file. There is no WebAssembly and no OPFS.
- The plugin runs SQLite through `sqlx` in Rust.
- The frontend gets a simple API, `Database.load`.
- The plugin supports migrations. Define them in Rust.
- The plugin needs no COOP or COEP headers.
- The database is one file. A backup is easy.

Disadvantages:

- The app must run as a Tauri build. A plain web page cannot use this plugin.
- The first Rust build is slow.
- You must set the plugin permissions in `src-tauri/capabilities/default.json`.

## Option B: SQLite WASM in the browser (fallback)

Keep this option if you need the web build. The SQLite team publishes the official build as `@sqlite.org/sqlite-wasm`, version 3.53.4-build2. A Web Worker loads the module. The `opfs-sahpool` VFS stores the database in the Origin Private File System.

`sql.js` and `wa-sqlite` are not a good fit here. The Tauri target gives a native SQLite file.

## Setup steps for Tauri

1. Add the CLI. Run `npm install -D @tauri-apps/cli@^2`.
2. Start Tauri. Run `npx tauri init`.
3. Add the plugin. Run `npm run tauri add sql`.
4. Enable the SQLite driver. Run `cargo add tauri-plugin-sql --features sqlite` in `src-tauri`.
5. Add the migrations in `src-tauri/src/lib.rs`.
6. Register the connection in `tauri.conf.json`.
7. Add the permissions to `src-tauri/capabilities/default.json`.
8. Add `src/storage/cardRepository.ts` and `src/storage/tokenRepository.ts`.

Set these values in `src-tauri/tauri.conf.json`:

```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../dist"
  }
}
```

Update `vite.config.ts` for the Tauri dev server:

```ts
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
});
```

Add these permissions to `src-tauri/capabilities/default.json`:

```json
{
  "permissions": ["sql:default", "sql:allow-execute"]
}
```

## Schema

Two tables hold the data.

```sql
CREATE TABLE IF NOT EXISTS card (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS token (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  image BLOB NOT NULL,
  size_mm REAL NOT NULL,
  image_x_mm REAL NOT NULL,
  image_y_mm REAL NOT NULL,
  image_width_mm REAL NOT NULL,
  ring_colour TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

The `image` column holds the token picture. The code rebuilds the data URL from `mime_type` and the bytes. In Tauri, you can save the picture as a file instead. Then replace `image BLOB` with `file_path TEXT`.

## Integration steps

1. Implement `CardRepository` and `TokenRepository` in `src/storage/`. Both classes use `Database.load`.
2. Add a library view. The user selects a saved card or token and prints it again.
3. Call `saveCard`, `saveToken`, `deleteCard` and `deleteToken` from the card maker and the token maker.
4. Add a delayed save. A save on each pointer move is too much.

## Risks and limits

- `AGENTS.md` forbids a database. Change the rule.
- The Tauri CLI is not on the machine. Add it as a development dependency.
- The first Rust build is slow.
- The `DesignRepository` interface does not fit. Add a card repository and a token repository.
- A plain web build cannot use the Tauri plugin.
- The token images can grow. Store them as BLOBs in the database. Keep one file for backup.

## Open questions

- Does a card hold an image? The plan says text only.
- Does a card need a colour?
- Do you want one library, or a library for each dungeon?

## Sources

- Tauri, "SQL", <https://v2.tauri.app/plugin/sql/>, checked 2026-10-17.
- Tauri, "Vite", <https://v2.tauri.app/start/frontend/vite/>, checked 2026-10-17.
- Tauri, "Prerequisites", <https://v2.tauri.app/start/prerequisites/>, checked 2026-10-17.
- SQLite, "Persistent Storage Options", <https://sqlite.org/wasm/doc/trunk/persistence.md>, checked 2026-10-17.
- npm and crates.io registry versions, checked 2026-10-17.
