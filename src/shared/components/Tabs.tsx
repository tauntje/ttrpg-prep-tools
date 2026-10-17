export type TabId = "one-page-dungeon" | "cards" | "tokens";

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "one-page-dungeon", label: "One page dungeon" },
  { id: "cards", label: "Cards" },
  { id: "tokens", label: "Tokens" },
];

interface TabsProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function Tabs({ activeTab, onChange }: TabsProps) {
  return (
    <div className="tabs" role="tablist" aria-label="Maker">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === activeTab}
          className={tab.id === activeTab ? "is-active" : undefined}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
