import { useState } from 'react';
import { TabBar, type View } from './TabBar';
import type { MapMode } from './MapModeSwitch';
import './AppShell.css';

type Props = {
  topBar: React.ReactNode;
  query: string;
  onQueryChange: (query: string) => void;
  children: (view: View, mapMode: MapMode, onMapModeChange: (mode: MapMode) => void) => React.ReactNode;
};

export function AppShell({ topBar, query, onQueryChange, children }: Props) {
  const [view, setView] = useState<View>('list');
  const [mapMode, setMapMode] = useState<MapMode>('people');

  return (
    <div className="app-shell">
      {topBar}

      <main className="app-shell__content">{children(view, mapMode, setMapMode)}</main>

      <TabBar
        view={view}
        onViewChange={setView}
        query={query}
        onQueryChange={onQueryChange}
        searchPlaceholder={view === 'map' && mapMode === 'events' ? 'Search events' : 'Search people'}
      />
    </div>
  );
}
