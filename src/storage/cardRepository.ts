import type { Card } from "../types/card";
import { getDatabase, isTauriRuntime } from "./database";

interface CardRow {
  id: string;
  title: string;
  subtitle: string;
  body: string;
}

export interface CardRepository {
  list(): Promise<Card[]>;
  save(card: Card): Promise<void>;
  delete(id: string): Promise<void>;
}

class SqliteCardRepository implements CardRepository {
  async list(): Promise<Card[]> {
    const database = await getDatabase();
    const rows = await database.select<CardRow[]>(
      "SELECT id, title, subtitle, body FROM card ORDER BY created_at"
    );

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      text: row.body,
    }));
  }

  async save(card: Card): Promise<void> {
    const database = await getDatabase();

    await database.execute(
      `INSERT INTO card (id, title, subtitle, body, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         subtitle = excluded.subtitle,
         body = excluded.body`,
      [card.id, card.title, card.subtitle, card.text, new Date().toISOString()]
    );
  }

  async delete(id: string): Promise<void> {
    const database = await getDatabase();
    await database.execute("DELETE FROM card WHERE id = $1", [id]);
  }
}

class MemoryCardRepository implements CardRepository {
  private readonly cards = new Map<string, Card>();
  private readonly order: string[] = [];

  async list(): Promise<Card[]> {
    return this.order.flatMap((id) => {
      const card = this.cards.get(id);
      return card === undefined ? [] : [card];
    });
  }

  async save(card: Card): Promise<void> {
    if (!this.cards.has(card.id)) {
      this.order.push(card.id);
    }

    this.cards.set(card.id, card);
  }

  async delete(id: string): Promise<void> {
    this.cards.delete(id);
    const index = this.order.indexOf(id);

    if (index >= 0) {
      this.order.splice(index, 1);
    }
  }
}

/**
 * Get the card repository. Use SQLite in Tauri.
 * Use memory in the browser so the web build stays usable.
 */
export const cardRepository: CardRepository = isTauriRuntime()
  ? new SqliteCardRepository()
  : new MemoryCardRepository();
