import { useMemo } from 'react';
import { usePeople } from '../data/store';
import { Avatar } from '../components/Avatar';
import { formatMemberSinceYear } from '../utils/format';
import './ListView.css';

type Props = {
  query: string;
  onSelectPerson: (id: string) => void;
};

export function ListView({ query, onSelectPerson }: Props) {
  const { people, households } = usePeople();

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return households
      .map((h) => {
        const members = h.memberIds
          .map((id) => people.find((p) => p.id === id))
          .filter((p): p is NonNullable<typeof p> => Boolean(p));
        const filtered = q
          ? members.filter(
              (p) =>
                `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
                h.label.toLowerCase().includes(q)
            )
          : members;
        return { household: h, members: filtered };
      })
      .filter((g) => g.members.length > 0);
  }, [people, households, query]);

  return (
    <div className="list-view">
      <div className="list-view__groups">
        {groups.map(({ household, members }) => (
          <div key={household.id} className="list-view__group">
            <p className="t-section-header list-view__group-label">{household.label}</p>
            {members.map((person) => {
              const others = household.memberIds
                .filter((id) => id !== person.id)
                .map((id) => people.find((p) => p.id === id))
                .filter((p): p is NonNullable<typeof p> => Boolean(p));
              return (
                <button
                  key={person.id}
                  type="button"
                  className="list-view__row"
                  onClick={() => onSelectPerson(person.id)}
                >
                  <Avatar src={person.photo} alt={person.firstName} size={48} />
                  <span className="list-view__row-info">
                    <span className="list-view__row-name">
                      {person.firstName} {person.lastName}
                    </span>
                    <span className="t-caption list-view__row-since">
                      {formatMemberSinceYear(person.memberSince)}
                    </span>
                  </span>
                  {others.length > 0 && (
                    <span className="list-view__row-family">
                      {others.slice(0, 4).map((o, i) => (
                        <Avatar
                          key={o.id}
                          src={o.photo}
                          alt={o.firstName}
                          size={28}
                          className="list-view__row-family-avatar"
                          style={{ marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i }}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {groups.length === 0 && (
          <p className="t-body list-view__empty">No one matches “{query}”.</p>
        )}
      </div>
    </div>
  );
}
