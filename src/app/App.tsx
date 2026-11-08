import { UI } from '@/content/ui';
import { PartExplorer } from '@/features/part-explorer';

export function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>
          {UI.app.titleLead} <span className="accent">{UI.app.titleAccent}</span>
        </h1>
        <p>{UI.app.tagline}</p>
      </header>
      <main className="app-main">
        <PartExplorer />
      </main>
    </div>
  );
}
