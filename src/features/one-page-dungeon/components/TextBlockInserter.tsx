import type { TextBlock } from "../../../types/textBlock";
import { createTextBlock } from "../model/textBlock";

interface TextBlockInserterProps {
  textBlockCount: number;
  onInsert: (textBlock: TextBlock) => void;
}

export function TextBlockInserter({ textBlockCount, onInsert }: TextBlockInserterProps) {
  return (
    <div className="text-block-inserter">
      <h3>Text block</h3>
      <button
        type="button"
        onClick={() => onInsert(createTextBlock("information", textBlockCount))}
      >
        Insert text block
      </button>
    </div>
  );
}
