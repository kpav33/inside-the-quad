import { UI } from '@/content/ui';
import { PartExplorer } from '@/features/part-explorer';
import { PartLink, usePartRoute } from '@/shared/routing';
import { ArrowIcon } from '@/shared/ui/icons';

export function App() {
  const { route } = usePartRoute();
  const onIntro = route.kind === 'intro';
  const onPath = route.kind === 'path' || route.kind === 'moves' || route.kind === 'what-if';
  const onGear = route.kind === 'gear';
  const onCheck = route.kind === 'check';
  return (
    <div className="app">
      <header className="app-header">
        <h1>
          {UI.app.titleLead} <span className="accent">{UI.app.titleAccent}</span>
        </h1>
        <p>{UI.app.tagline}</p>
        <nav className="app-sections" aria-label={UI.app.navLabel}>
          <PartLink to="intro" className="app-section-link" current={onIntro}>
            {UI.app.introLink}
            <ArrowIcon />
          </PartLink>
          <PartLink to="control" className="app-section-link" current={onPath}>
            {UI.app.pathsLink}
            <ArrowIcon />
          </PartLink>
          <PartLink to="radio" className="app-section-link" current={onGear}>
            {UI.app.gearLink}
            <ArrowIcon />
          </PartLink>
          <PartLink to="check" className="app-section-link" current={onCheck}>
            {UI.app.checkLink}
            <ArrowIcon />
          </PartLink>
        </nav>
      </header>
      <main className="app-main">
        <PartExplorer />
      </main>
    </div>
  );
}
