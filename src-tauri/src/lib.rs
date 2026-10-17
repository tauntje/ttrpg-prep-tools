use tauri_plugin_sql::{Migration, MigrationKind};

const DATABASE_URL: &str = "sqlite:opd-prep.db";

const CARD_TABLE_SQL: &str = "
CREATE TABLE IF NOT EXISTS card (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);
";

// SQLite stores the picture as base64 text. The SQL plugin decodes a JSON
// number array as text, so a BLOB column cannot keep the picture bytes.
const TOKEN_TABLE_SQL: &str = "
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
";

fn sql_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create the card table",
            sql: CARD_TABLE_SQL,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create the token table",
            sql: TOKEN_TABLE_SQL,
            kind: MigrationKind::Up,
        },
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(DATABASE_URL, sql_migrations())
                .build(),
        )
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
