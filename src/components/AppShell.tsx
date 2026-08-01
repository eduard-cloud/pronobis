import { useState } from 'react';
import { TabBar, type View } from './TabBar';
import './AppShell.css';

type Props = {
  topBar: React.ReactNode;
  query: string;
  onQueryChange: (query: string) => void;
  children: (view: View) => React.ReactNode;
};

export function AppShell({ topBar, query, onQueryChange, children }: Props) {
  const [view, setView] = useState<View>('list');

  return (
    <div className="app-shell">
      {topBar}

      <main className="app-shell__content">{children(view)}</main>

      <TabBar view={view} onViewChange={setView} query={query} onQueryChange={onQueryChange} />
    </div>
  );
}
