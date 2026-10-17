import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./main.css";
import "./features/page-editor/styles/editor.css";
import "./features/images/styles/images.css";
import "./print.css";

const container = document.getElementById("root");

if (container === null) {
  throw new Error("Root element not found");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
