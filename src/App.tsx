import { useState } from 'react';
import { AppShell } from './components/AppShell';
import { ProfileSheet } from './components/ProfileSheet';
import { TopNavBar } from './components/TopNavBar';
import { ListView } from './screens/ListView';
import { MapView } from './screens/MapView';
import { GateScreen } from './screens/GateScreen';
import { OnboardingFlow } from './screens/OnboardingFlow';
import { EditProfileForm } from './screens/EditProfileForm';
import { usePeople } from './data/store';
import { GATE_STORAGE_KEY } from './config';

function App() {
  const [gatePassed, setGatePassed] = useState(
    () => localStorage.getItem(GATE_STORAGE_KEY) === 'true'
  );
  const { onboarded, currentUserId, resetDemo } = usePeople();
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  if (!gatePassed) {
    return <GateScreen onSuccess={() => setGatePassed(true)} />;
  }

  if (!onboarded) {
    return <OnboardingFlow onComplete={() => {}} />;
  }

  return (
    <>
      <AppShell
        topBar={
          <TopNavBar
            query={query}
            onQueryChange={setQuery}
            onEditProfile={() => currentUserId && setEditingPersonId(currentUserId)}
            onReset={resetDemo}
          />
        }
      >
        {(view) =>
          view === 'list' ? (
            <ListView query={query} onSelectPerson={setSelectedPersonId} />
          ) : (
            <MapView query={query} onSelectPerson={setSelectedPersonId} />
          )
        }
      </AppShell>

      <ProfileSheet
        personId={selectedPersonId}
        onClose={() => setSelectedPersonId(null)}
        onSelectPerson={setSelectedPersonId}
        onEdit={(id) => setEditingPersonId(id)}
      />

      {editingPersonId && (
        <EditProfileForm personId={editingPersonId} onClose={() => setEditingPersonId(null)} />
      )}
    </>
  );
}

export default App;
