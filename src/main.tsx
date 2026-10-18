import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { AppStateProvider } from "./app/store";
import { stopNativeContextMenu } from "./shared/model/contextMenu";
import "./shared/styles/reset.css";
import "./shared/styles/tokens.css";
import "./main.css";
import "./shared/styles/page.css";
import "./features/one-page-dungeon/styles/editor.css";
import "./features/one-page-dungeon/styles/images.css";
import "./features/one-page-dungeon/styles/textBlocks.css";
import "./features/one-page-dungeon/styles/pins.css";
import "./features/cards/styles/cards.css";
import "./features/tokens/styles/tokens.css";
import "./shared/styles/print.css";

const container = document.getElementById("root");

if (container === null) {
  throw new Error("Root element not found");
}

stopNativeContextMenu();

createRoot(container).render(
  <StrictMode>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </StrictMode>
);
