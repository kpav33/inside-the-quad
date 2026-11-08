import { PartExplorer } from '@/features/part-explorer';

export function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>
          Inside the <span className="accent">Quad</span>
        </h1>
        <p>How an FPV drone works, part by part.</p>
      </header>
      <main className="app-main">
        <PartExplorer />
      </main>
    </div>
  );
}
