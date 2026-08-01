import { AppShell } from './components/AppShell';
import { ListView } from './screens/ListView';
import { MapView } from './screens/MapView';

function App() {
  return (
    <AppShell title="People">
      {(view) => (view === 'list' ? <ListView /> : <MapView />)}
    </AppShell>
  );
}

export default App;
