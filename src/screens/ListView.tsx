import { useMemo } from 'react';
import { usePeople } from '../data/store';
import { Avatar } from '../components/Avatar';
import { getInitials, isGeneratedAvatar } from '../data/avatar';
import { formatAge, formatMemberSinceYear } from '../utils/format';
import type { Household, Person } from '../types';
import './ListView.css';

type Props = {
  query: string;
  onSelectPerson: (id: string) => void;
};

type HouseholdGroup = { household: Household; members: Person[] };
type LetterSection = { letter: string; households: HouseholdGroup[] };

/**
 * Figma's List View treats every no-photo person with one flat neutral
 * circle (#e6eae9 / #4c6b67), not the app-wide multi-color initials
 * palette used elsewhere (e.g. map pins) — so this renders that exact
 * look locally instead of reusing the shared colored-initials avatar.
 */
function PersonAvatar({ person, size }: { person: Person; size: 48 | 24 }) {
  if (!isGeneratedAvatar(person.photo)) {
    return <Avatar src={person.photo} alt={person.firstName} size={size} />;
  }
  return (
    <span
      className="list-view__initials"
      style={{
        width: size,
        height: size,
        fontSize: size === 48 ? 20 : 10,
        letterSpacing: size === 48 ? '-0.86px' : '-0.43px',
        borderWidth: size === 48 ? 2.311 : 1.156,
      }}
    >
      {getInitials(person.firstName, person.lastName)}
    </span>
  );
}

export function ListView({ query, onSelectPerson }: Props) {
  const { people, households } = usePeople();

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();

    const groups: HouseholdGroup[] = households
      .map((h) => {
        const members = h.memberIds
          .map((id) => people.find((p) => p.id === id))
          .filter((p): p is Person => Boolean(p));
        const filtered = q
          ? members.filter(
              (p) =>
                `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
                h.label.toLowerCase().includes(q)
            )
          : members;
        return { household: h, members: filtered };
      })
      .filter((g) => g.members.length > 0)
      .sort((a, b) => a.household.label.localeCompare(b.household.label));

    const byLetter = new Map<string, HouseholdGroup[]>();
    for (const group of groups) {
      const letter = group.household.label[0]?.toUpperCase() ?? '#';
      const bucket = byLetter.get(letter);
      if (bucket) bucket.push(group);
      else byLetter.set(letter, [group]);
    }

    const result: LetterSection[] = Array.from(byLetter.entries()).map(([letter, hs]) => ({
      letter,
      households: hs,
    }));
    result.sort((a, b) => a.letter.localeCompare(b.letter));
    return result;
  }, [people, households, query]);

  return (
    <div className="list-view">
      <div className="list-view__sections">
        {sections.map(({ letter, households: hs }) => (
          <div key={letter} className="list-view__section">
            <p className="list-view__section-label">{letter}</p>
            <div className="list-view__sheet">
              {hs.map(({ household, members }, i) => (
                <div key={household.id} className="list-view__household">
                  {i > 0 && <div className="list-view__separator" />}
                  {members.map((person) => {
                    const others = household.memberIds
                      .filter((id) => id !== person.id)
                      .map((id) => people.find((p) => p.id === id))
                      .filter((p): p is Person => Boolean(p));
                    const isChild = person.relation === 'child';

                    return (
                      <button
                        key={person.id}
                        type="button"
                        className="list-view__row"
                        onClick={() => onSelectPerson(person.id)}
                      >
                        <PersonAvatar person={person} size={48} />
                        <span className="list-view__row-info">
                          <span className="list-view__row-name">
                            {person.firstName} {person.lastName}
                          </span>
                          <span className="list-view__row-subtitle">
                            {isChild ? formatAge(person.birthDate) : formatMemberSinceYear(person.memberSince)}
                          </span>
                        </span>
                        {!isChild && others.length > 0 && (
                          <span className="list-view__row-family">
                            {others.slice(0, 3).map((o) => (
                              <span key={o.id} className="list-view__row-family-avatar">
                                <PersonAvatar person={o} size={24} />
                              </span>
                            ))}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <p className="t-body list-view__empty">No one matches “{query}”.</p>
        )}
      </div>
    </div>
  );
}
