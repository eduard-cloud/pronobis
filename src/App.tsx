import { useState } from 'react';
import { AppShell } from './components/AppShell';
import { ProfileSheet } from './components/ProfileSheet';
import { EventSheet } from './components/EventSheet';
import { SettingsModal } from './components/SettingsModal';
import { TopNavBar } from './components/TopNavBar';
import { ListView } from './screens/ListView';
import { MapView } from './screens/MapView';
import { GridView } from './screens/GridView';
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
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
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
        topBar={<TopNavBar onOpenSettings={() => setSettingsOpen(true)} />}
        query={query}
        onQueryChange={setQuery}
      >
        {(view, mapMode, onMapModeChange) => {
          if (view === 'map')
            return (
              <MapView
                query={query}
                onSelectPerson={setSelectedPersonId}
                onSelectEvent={setSelectedEventId}
                mode={mapMode}
                onModeChange={onMapModeChange}
              />
            );
          if (view === 'grid') return <GridView query={query} onSelectPerson={setSelectedPersonId} />;
          return <ListView query={query} onSelectPerson={setSelectedPersonId} />;
        }}
      </AppShell>

      <EventSheet
        eventId={selectedEventId}
        onClose={() => setSelectedEventId(null)}
        onSelectPerson={setSelectedPersonId}
      />

      {/* Rendered after EventSheet so tapping an attendee there stacks
          ProfileSheet on top — both overlays share z-index: 60, so DOM
          order is what decides who wins. */}
      <ProfileSheet
        personId={selectedPersonId}
        onClose={() => setSelectedPersonId(null)}
        onSelectPerson={setSelectedPersonId}
        onEdit={(id) => setEditingPersonId(id)}
      />

      {editingPersonId && (
        <EditProfileForm personId={editingPersonId} onClose={() => setEditingPersonId(null)} />
      )}

      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          onEditProfile={() => {
            setSettingsOpen(false);
            if (currentUserId) setEditingPersonId(currentUserId);
          }}
          onReset={resetDemo}
        />
      )}
    </>
  );
}

export default App;
