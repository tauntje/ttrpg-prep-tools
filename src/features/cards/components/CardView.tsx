import Markdown from "react-markdown";
import type { Card } from "../../../types/card";

interface CardViewProps {
  card: Card;
}

/**
 * Show one card. The title and the subtitle sit above a rule.
 * The text uses Markdown for paragraphs and lists.
 */
export function CardView({ card }: CardViewProps) {
  return (
    <article className="card card-view">
      <header className="card-header">
        <h2>{card.title}</h2>
        {card.subtitle !== "" && <p className="card-subtitle">{card.subtitle}</p>}
      </header>
      {card.text !== "" && (
        <div className="card-body">
          <Markdown>{card.text}</Markdown>
        </div>
      )}
    </article>
  );
}
