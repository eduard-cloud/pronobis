import { useState } from 'react';
import { AppShell } from './components/AppShell';
import { ProfileSheet } from './components/ProfileSheet';
import { ListView } from './screens/ListView';
import { MapView } from './screens/MapView';
import { GateScreen } from './screens/GateScreen';
import { OnboardingFlow } from './screens/OnboardingFlow';
import { usePeople } from './data/store';
import { GATE_STORAGE_KEY } from './config';

function App() {
  const [gatePassed, setGatePassed] = useState(
    () => localStorage.getItem(GATE_STORAGE_KEY) === 'true'
  );
  const { onboarded } = usePeople();
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  if (!gatePassed) {
    return <GateScreen onSuccess={() => setGatePassed(true)} />;
  }

  if (!onboarded) {
    return <OnboardingFlow onComplete={() => {}} />;
  }

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
