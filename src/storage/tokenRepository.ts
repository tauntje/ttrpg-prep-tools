import type { Token, TokenSizeMm } from "../types/token";
import { getDatabase, isTauriRuntime } from "./database";
import { joinDataUrl, splitDataUrl } from "./imageData";

interface TokenRow {
  id: string;
  name: string;
  mime_type: string;
  image: string;
  size_mm: number;
  ring_colour: string;
  image_aspect: number;
  image_x_mm: number;
  image_y_mm: number;
  image_scale: number;
}

export interface TokenRepository {
  list(): Promise<Token[]>;
  save(token: Token): Promise<void>;
  delete(id: string): Promise<void>;
}

class SqliteTokenRepository implements TokenRepository {
  async list(): Promise<Token[]> {
    const database = await getDatabase();
    const rows = await database.select<TokenRow[]>(
      `SELECT id, name, mime_type, image, size_mm, ring_colour,
              image_aspect, image_x_mm, image_y_mm, image_scale
       FROM token
       ORDER BY created_at`
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      src: joinDataUrl(row.mime_type, row.image),
      sizeMm: row.size_mm as TokenSizeMm,
      ringColour: row.ring_colour,
      imageAspect: row.image_aspect,
      imageXMm: row.image_x_mm,
      imageYMm: row.image_y_mm,
      imageScale: row.image_scale,
    }));
  }

  async save(token: Token): Promise<void> {
    const database = await getDatabase();
    const { mimeType, base64 } = splitDataUrl(token.src);

    await database.execute(
      `INSERT INTO token (
         id, name, mime_type, image, size_mm, ring_colour,
         image_aspect, image_x_mm, image_y_mm, image_scale, created_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         mime_type = excluded.mime_type,
         image = excluded.image,
         size_mm = excluded.size_mm,
         ring_colour = excluded.ring_colour,
         image_aspect = excluded.image_aspect,
         image_x_mm = excluded.image_x_mm,
         image_y_mm = excluded.image_y_mm,
         image_scale = excluded.image_scale`,
      [
        token.id,
        token.name,
        mimeType,
        base64,
        token.sizeMm,
        token.ringColour,
        token.imageAspect,
        token.imageXMm,
        token.imageYMm,
        token.imageScale,
        new Date().toISOString(),
      ]
    );
  }

  async delete(id: string): Promise<void> {
    const database = await getDatabase();
    await database.execute("DELETE FROM token WHERE id = $1", [id]);
  }
}

class MemoryTokenRepository implements TokenRepository {
  private readonly tokens = new Map<string, Token>();
  private readonly order: string[] = [];

  async list(): Promise<Token[]> {
    return this.order.flatMap((id) => {
      const token = this.tokens.get(id);
      return token === undefined ? [] : [token];
    });
  }

  async save(token: Token): Promise<void> {
    if (!this.tokens.has(token.id)) {
      this.order.push(token.id);
    }

    this.tokens.set(token.id, token);
  }

  async delete(id: string): Promise<void> {
    this.tokens.delete(id);
    const index = this.order.indexOf(id);

    if (index >= 0) {
      this.order.splice(index, 1);
    }
  }
}

/**
 * Get the token repository. Use SQLite in Tauri.
 * Use memory in the browser so the web build stays usable.
 */
export const tokenRepository: TokenRepository = isTauriRuntime()
  ? new SqliteTokenRepository()
  : new MemoryTokenRepository();
