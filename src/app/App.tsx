import { useState } from "react";
import { CardsTab } from "../features/cards/components/CardsTab";
import { OnePageDungeonTab } from "../features/one-page-dungeon/components/OnePageDungeonTab";
import { TokensTab } from "../features/tokens/components/TokensTab";
import { AppHeader } from "../shared/components/AppHeader";
import { Tabs, type TabId } from "../shared/components/Tabs";

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>("one-page-dungeon");

  return (
    <div className="app">
      <AppHeader>
        <Tabs activeTab={activeTab} onChange={setActiveTab} />
      </AppHeader>
      {activeTab === "one-page-dungeon" && <OnePageDungeonTab />}
      {activeTab === "cards" && <CardsTab />}
      {activeTab === "tokens" && <TokensTab />}
    </div>
  );
}
