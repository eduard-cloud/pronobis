import { useMemo } from 'react';
import { usePeople } from '../data/store';
import { isGeneratedAvatar } from '../data/avatar';
import type { Person } from '../types';
import './GridView.css';

type Props = {
  query: string;
  onSelectPerson: (id: string) => void;
};

export function GridView({ query, onSelectPerson }: Props) {
  const { people } = usePeople();

  const photos = useMemo(() => {
    const q = query.trim().toLowerCase();
    const withPhoto = people.filter((p): p is Person => !isGeneratedAvatar(p.photo));
    if (!q) return withPhoto;
    return withPhoto.filter((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(q));
  }, [people, query]);

  return (
    <div className="grid-view">
      <div className="grid-view__fade" />
      <div className="grid-view__scroll">
        <div className="grid-view__grid">
          {photos.map((person) => (
            <button
              key={person.id}
              type="button"
              className="grid-view__tile"
              onClick={() => onSelectPerson(person.id)}
            >
              <img src={person.photo} alt={person.firstName} loading="lazy" />
            </button>
          ))}
        </div>

        {photos.length === 0 && (
          <p className="t-body grid-view__empty">No one matches “{query}”.</p>
        )}
      </div>
    </div>
  );
}
