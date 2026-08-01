import { useState } from 'react';
import { AppShell } from './components/AppShell';
import { ProfileSheet } from './components/ProfileSheet';
import { ListView } from './screens/ListView';
import { MapView } from './screens/MapView';

function App() {
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  return (
    <>
      <AppShell title="People">
        {(view) =>
          view === 'list' ? (
            <ListView onSelectPerson={setSelectedPersonId} />
          ) : (
            <MapView onSelectPerson={setSelectedPersonId} />
          )
        }
      </AppShell>

      <ProfileSheet
        personId={selectedPersonId}
        onClose={() => setSelectedPersonId(null)}
        onSelectPerson={setSelectedPersonId}
        onEdit={() => {}}
      />
    </>
  );
}

export default App;
