# Agent guide

## Stack

- Use React with TypeScript.
- Use Vite to run and build the app.
- Do not add a server.
- Use the local SQLite database in the Tauri app to save cards and tokens.

## Structure

- Put the code for one feature in `src/features/<feature>/`.
- Use `components/`, `model/`, and `styles/` inside a feature.
- Put shared code in `src/shared/`.
- Put the save and load code in `src/storage/`.
- Do not put all components in one folder.

## Types

- Put the design types in `src/types/`.
- Put one concern in each file. Name the file after the concern.
- Put the page types in `page.ts`.
- Put the image types in `image.ts`.
- Put the composed types, such as `Design`, in `design.ts`.
- Order the fields from the identifier to the measurements.

## Styles

- Keep the shell styles in `src/main.css`.
- Put the CSS variables in `src/shared/styles/tokens.css`.
- Put the reset rules in `src/shared/styles/reset.css`.
- Import the CSS files in `src/main.tsx`.
- Keep the `print.css` import last.

## Page and print

- Set the A4 size to 210 mm by 297 mm.
- Store all measurements in millimetres.
- Set the screen zoom with the `--page-zoom` variable.
- Use the `zoom` property. Do not use `transform: scale`.
- Set `zoom` to 1 in the `@media print` block.
- Hide the screen controls in print with the `screen-only` class.

## Commands

- `npm run dev` — start the app in the browser.
- `npm run build` — check the types and build the web app.
- `npm run tauri:dev` — start the Tauri app. The SQLite database is active.
- `npm run tauri:build` — build the Tauri app.

## Writing

- Write comments and commit messages in Simplified Technical English.
- Use short sentences and the active voice.
