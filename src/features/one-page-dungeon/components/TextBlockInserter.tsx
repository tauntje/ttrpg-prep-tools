import type { TextBlock } from "../../../types/textBlock";
import { createTextBlock } from "../model/textBlock";

interface TextBlockInserterProps {
  onInsert: (textBlock: TextBlock) => void;
}

export function TextBlockInserter({ onInsert }: TextBlockInserterProps) {
  return (
    <div className="text-block-inserter">
      <h3>Text block</h3>
      <button type="button" onClick={() => onInsert(createTextBlock("context"))}>
        Add context
      </button>
      <button type="button" onClick={() => onInsert(createTextBlock("dwellers"))}>
        Add dwellers
      </button>
    </div>
  );
}
