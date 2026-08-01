import { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';
import './AppShell.css';

type View = 'list' | 'map';

type Props = {
  topBar: React.ReactNode;
  children: (view: View) => React.ReactNode;
};

export function AppShell({ topBar, children }: Props) {
  const [view, setView] = useState<View>('list');

  return (
    <div className="app-shell">
      {topBar}

      <main className="app-shell__content">{children(view)}</main>

      <SegmentedControl
        segments={[
          { key: 'list', label: 'List' },
          { key: 'map', label: 'Map' },
        ]}
        value={view}
        onChange={(key) => setView(key as View)}
      />
    </div>
  );
}
