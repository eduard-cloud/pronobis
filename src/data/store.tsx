import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Household, Person } from '../types';
import { CURRENT_USER_ID, seedHouseholds, seedPeople } from './seed';

const STORAGE_KEY = 'pronobis.v1';

type StoredState = {
  people: Person[];
  households: Household[];
  currentUserId: string;
};

function loadState(): StoredState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as StoredState;
    } catch {
      // fall through to seed
    }
  }
  return {
    people: seedPeople,
    households: seedHouseholds,
    currentUserId: CURRENT_USER_ID,
  };
}

function saveState(state: StoredState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

type PeopleContextValue = {
  people: Person[];
  households: Household[];
  currentUserId: string;
  upsertPerson: (person: Person) => void;
  addHouseholdMember: (householdId: string, person: Person) => void;
  resetDemo: () => void;
};

const PeopleContext = createContext<PeopleContextValue | null>(null);

export function PeopleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(loadState);

  const upsertPerson = useCallback((person: Person) => {
    setState((prev) => {
      const exists = prev.people.some((p) => p.id === person.id);
      const people = exists
        ? prev.people.map((p) => (p.id === person.id ? person : p))
        : [...prev.people, person];
      const next = { ...prev, people };
      saveState(next);
      return next;
    });
  }, []);

  const addHouseholdMember = useCallback(
    (householdId: string, person: Person) => {
      setState((prev) => {
        const people = [...prev.people, person];
        const households = prev.households.map((h) =>
          h.id === householdId
            ? { ...h, memberIds: [...h.memberIds, person.id] }
            : h
        );
        const next = { ...prev, people, households };
        saveState(next);
        return next;
      });
    },
    []
  );

  const resetDemo = useCallback(() => {
    const fresh: StoredState = {
      people: seedPeople,
      households: seedHouseholds,
      currentUserId: CURRENT_USER_ID,
    };
    setState(fresh);
    saveState(fresh);
  }, []);

  const value = useMemo<PeopleContextValue>(
    () => ({
      people: state.people,
      households: state.households,
      currentUserId: state.currentUserId,
      upsertPerson,
      addHouseholdMember,
      resetDemo,
    }),
    [state, upsertPerson, addHouseholdMember, resetDemo]
  );

  return (
    <PeopleContext.Provider value={value}>{children}</PeopleContext.Provider>
  );
}

export function usePeople(): PeopleContextValue {
  const ctx = useContext(PeopleContext);
  if (!ctx) throw new Error('usePeople must be used within PeopleProvider');
  return ctx;
}
