import type { ReactNode } from "react";

interface SidebarProps {
  children?: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="sidebar screen-only" aria-label="Design controls">
      <h2>Design</h2>
      {children}
    </aside>
  );
}
