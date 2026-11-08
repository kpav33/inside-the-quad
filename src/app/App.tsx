import { PartExplorer } from '@/features/part-explorer';

export function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Inside the Quad</h1>
        <p>How an FPV drone works, part by part.</p>
      </header>
      <main className="app-main">
        <PartExplorer />
      </main>
    </div>
  );
}
