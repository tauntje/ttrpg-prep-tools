# Save on demand

Date: 2026-10-17.

## Goal

The user saves a card or a token with a clear action. The app writes to SQLite only on that action. The user loads a saved item from a library. The library shows a preview of each item.

## Current behaviour

The tabs save each change. A delayed save writes to SQLite after each edit. The tabs also load all saved items at open.

This behaviour is automatic. The user wants manual control.

## Target behaviour

The sheet holds the items in memory. The library holds the saved items in SQLite. A Save action copies one item from the sheet to the library. A Load action copies one item from the library to the sheet.

### Save

The CardForm and the TokenForm get a Save button. The app marks a new item as unsaved. An edit marks the item as unsaved again. The Save action writes one row.

### Load

The CardList and the TokenList get a Library button. The Library panel lists the saved items. Each row shows a preview and a name.

The row has a Load button and a Delete button. The Load button copies the item to the sheet. The Delete button removes the item from the library.

## Open decisions

Save one item or the full sheet? Recommend one item. Load an item as a copy or with the same id? Recommend a copy with a new id. The library item stays safe.

Does a second save of a loaded item update the row or make a new row? Recommend a new row.

## Storage changes

The repositories keep `list`, `save`, and `delete`. Remove the automatic calls from the tabs.

Keep the saved state in the tab, not in the type. Use a `Set<string>` of unsaved ids. The database rows stay unchanged.

```tsx
const [unsavedIds, setUnsavedIds] = useState<Set<string>>(new Set());
```

The Save action calls `cardRepository.save(card)` or `tokenRepository.save(token)`. Then the action removes the id from the set.

## Preview

Reuse `CardView` and `TokenView`. Put each view in a fixed box. Scale the box with the `zoom` property.

Card preview:

```tsx
<div className="card-preview" style={{ width: "60mm", height: "80mm", zoom: 0.4 }}>
  <CardView card={card} />
</div>
```

Token preview:

```tsx
<div className="token-preview" style={{ zoom: 0.5 }}>
  <TokenView token={token} />
</div>
```

The token holds `src` as a data URL. The `img` element shows the picture at once. The ring colour and the picture offset use the stored values.

## Data flow

The user makes a card. The user clicks Save. The repository writes the row. The app marks the card as saved.

The user clicks Library. The repository reads the rows. The panel shows each row with a preview. The user clicks Load on a row. The app adds a copy to the sheet.

## Risks

A card with much Markdown is slow to render in a long list. Show the title and a short text only.

A token image is large. A long list holds many data URLs in memory. Load the list in pages.

The browser build uses the memory repository. The library does not survive a reload there.

The library and the sheet can hold the same item. Use a copy to stop an accidental overwrite.

## Work items

1. Remove the automatic save and load from the tabs.
2. Add the unsaved state to the tabs.
3. Add the Save action to the forms.
4. Add the Library panel with a preview.
5. Add the Load and Delete actions.
6. Test the flow in the Tauri app.

## Existing data model

The types live in `src/types/`. The tables live in the Tauri migrations. The first build made two tables and two repositories.

### Card type

```ts
export interface Card {
  id: string;
  title: string;
  subtitle: string;
  text: string;
}
```

The table column is `body`. The repository maps `body` to `text`.

### Token type

```ts
export type TokenSizeMm = 25 | 50 | 75;

export interface Token {
  id: string;
  name: string;
  src: string;
  sizeMm: TokenSizeMm;
  ringColour: string;
  imageAspect: number;
  imageXMm: number;
  imageYMm: number;
  imageScale: number;
}
```

### Tables

Two migrations run in `src-tauri/src/lib.rs`. Each migration holds one statement.

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
  image TEXT NOT NULL,
  size_mm REAL NOT NULL,
  ring_colour TEXT NOT NULL,
  image_aspect REAL NOT NULL,
  image_x_mm REAL NOT NULL,
  image_y_mm REAL NOT NULL,
  image_scale REAL NOT NULL,
  created_at TEXT NOT NULL
);
```

The `image` column holds base64 text. The SQL plugin binds a JSON number array as text. A BLOB column cannot keep the picture bytes. The `mime_type` and the `image` text rebuild the data URL.

### Repositories

`src/storage/cardRepository.ts` holds `CardRepository`. The methods are `list`, `save`, and `delete`.

`src/storage/tokenRepository.ts` holds `TokenRepository`. The methods are `list`, `save`, and `delete`.

Each repository has a SQLite class and a memory class. The app uses SQLite in Tauri and memory in the browser.

`src/storage/imageData.ts` splits and joins the data URL. `src/storage/database.ts` opens the connection.

## Existing Tauri app

The app uses Tauri v2. The SQL plugin is `tauri-plugin-sql` 2.6.0 with the `sqlite` feature.

### Packages

```json
"dependencies": {
  "@tauri-apps/api": "^2.12.4",
  "@tauri-apps/plugin-sql": "^2.6.0"
},
"devDependencies": {
  "@tauri-apps/cli": "^2.12.3"
}
```

### Setup

1. Run `npm install -D @tauri-apps/cli@^2`.
2. Run `npm install @tauri-apps/api@^2 @tauri-apps/plugin-sql@^2`.
3. Run `npx tauri init`.
4. Add `tauri-plugin-sql` with the `sqlite` feature to `src-tauri/Cargo.toml`.

### Migrations

`src-tauri/src/lib.rs` registers the two migrations. The plugin runs them at startup.

```rust
tauri_plugin_sql::Builder::default()
    .add_migrations("sqlite:opd-prep.db", sql_migrations())
    .build()
```

### Config

`src-tauri/tauri.conf.json` preloads the connection.

```json
"plugins": {
  "sql": {
    "preload": ["sqlite:opd-prep.db"]
  }
}
```

### Permissions

`src-tauri/capabilities/default.json` holds the permissions. The default set allows a load and a select. The `sql:allow-execute` permission allows a write.

```json
"permissions": ["core:default", "sql:default", "sql:allow-execute"]
```

### Scripts

```json
"tauri": "tauri",
"tauri:dev": "tauri dev",
"tauri:build": "tauri build"
```

### Vite

`vite.config.ts` fixes the port for the Tauri dev server.

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

The branch `feature/sqlite-persistence` holds this first build.
