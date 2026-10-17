import { PageCanvas } from "../features/page-editor/components/PageCanvas";
import { PageToolbar } from "../shared/components/PageToolbar";
import { Sidebar } from "../shared/components/Sidebar";

export function App() {
  return (
    <div className="app">
      <PageToolbar />
      <div className="workspace">
        <Sidebar />
        <main className="preview">
          <PageCanvas />
        </main>
      </div>
    </div>
  );
}
