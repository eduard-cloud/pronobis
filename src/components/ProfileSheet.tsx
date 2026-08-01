import { useEffect, useRef, useState } from 'react';
import { usePeople } from '../data/store';
import { Avatar } from './Avatar';
import { Chip } from './Chip';
import { deriveRelationLabel } from '../utils/relations';
import { formatAge, formatBirthDate, formatMemberSince } from '../utils/format';
import './ProfileSheet.css';

type Props = {
  personId: string | null;
  onClose: () => void;
  onSelectPerson: (id: string) => void;
  onEdit: (id: string) => void;
};

export function ProfileSheet({ personId, onClose, onSelectPerson, onEdit }: Props) {
  const { people, households, currentUserId } = usePeople();
  const [dragY, setDragY] = useState(0);
  const dragState = useRef<{ startY: number; dragging: boolean } | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const person = personId ? people.find((p) => p.id === personId) ?? null : null;

  useEffect(() => {
    setDragY(0);
  }, [personId]);

  if (!person) return null;

  const household = households.find((h) => h.id === person.householdId);
  const connections = (household?.memberIds ?? [])
    .filter((id) => id !== person.id)
    .map((id) => people.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const currentUser = people.find((p) => p.id === currentUserId);
  const canEdit = person.id === currentUserId || person.householdId === currentUser?.householdId;

  function handlePointerDown(e: React.PointerEvent) {
    dragState.current = { startY: e.clientY, dragging: true };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragState.current?.dragging) return;
    const delta = e.clientY - dragState.current.startY;
    setDragY(Math.max(0, delta));
  }

  function handlePointerUp() {
    if (!dragState.current) return;
    dragState.current.dragging = false;
    if (dragY > 120) {
      onClose();
    } else {
      setDragY(0);
    }
  }

  return (
    <div className="profile-sheet-overlay" onClick={onClose}>
      <div
        ref={sheetRef}
        className="profile-sheet"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragState.current?.dragging ? 'none' : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="profile-sheet__handle-area"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="profile-sheet__handle" />
        </div>

        <div className="profile-sheet__scroll">
          <div className="profile-sheet__photo-wrap">
            <img
              src={person.photo}
              alt={`${person.firstName} ${person.lastName}`}
              className="profile-sheet__photo"
            />
          </div>

          <h2 className="t-large-title profile-sheet__name">
            {person.firstName}
            <br />
            {person.lastName}
          </h2>

          <div className="profile-sheet__chips">
            <Chip variant="cyan">
              {formatAge(person.birthDate)} · {formatBirthDate(person.birthDate)}
            </Chip>
            <Chip variant="cyan">{formatMemberSince(person.memberSince)}</Chip>
          </div>

          {connections.length > 0 && (
            <div className="profile-sheet__connections">
              {connections.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="profile-sheet__connection"
                  onClick={() => onSelectPerson(c.id)}
                >
                  <Avatar src={c.photo} alt={`${c.firstName} ${c.lastName}`} size={52} />
                  <span className="t-caption profile-sheet__connection-label">
                    {deriveRelationLabel(person, c)}
                  </span>
                  <span className="profile-sheet__connection-name">{c.firstName}</span>
                </button>
              ))}
            </div>
          )}

          {person.location && (
            <p className="t-caption profile-sheet__location">{person.location.label}</p>
          )}

          <p className="t-body profile-sheet__bio">{person.bio}</p>

          {person.interests.length > 0 && (
            <div className="profile-sheet__interests">
              {person.interests.map((i) => (
                <Chip key={i} variant="outline">
                  {i}
                </Chip>
              ))}
            </div>
          )}

          {canEdit && (
            <button
              type="button"
              className="profile-sheet__edit-pill"
              onClick={() => onEdit(person.id)}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
