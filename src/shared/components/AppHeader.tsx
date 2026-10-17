import type { ReactNode } from "react";

interface AppHeaderProps {
  children?: ReactNode;
}

export function AppHeader({ children }: AppHeaderProps) {
  function handlePrint() {
    window.print();
  }

  return (
    <header className="toolbar screen-only">
      <h1>Print Layout App</h1>
      <div className="toolbar-actions">
        {children}
        <button type="button" onClick={handlePrint}>
          Print
        </button>
      </div>
    </header>
  );
}
