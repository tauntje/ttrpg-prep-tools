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
