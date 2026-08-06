import { useEffect, useRef, useState } from 'react';
import { usePeople } from '../data/store';
import { events } from '../data/events';
import { EVENT_CATEGORIES } from '../data/eventCategories';
import { formatEventTime, isLive } from '../utils/eventTime';
import { Avatar } from './Avatar';
import { Chip } from './Chip';
import './EventSheet.css';

type Props = {
  eventId: string | null;
  onClose: () => void;
  onSelectPerson: (id: string) => void;
};

export function EventSheet({ eventId, onClose, onSelectPerson }: Props) {
  const { people } = usePeople();
  const [dragY, setDragY] = useState(0);
  const dragState = useRef<{ startY: number; dragging: boolean } | null>(null);

  const event = eventId ? events.find((e) => e.id === eventId) ?? null : null;

  useEffect(() => {
    setDragY(0);
  }, [eventId]);

  if (!event) return null;

  const meta = EVENT_CATEGORIES[event.category];
  const attendees = event.attendeeIds
    .map((id) => people.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

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
    <div className="event-sheet-overlay" onClick={onClose}>
      <div
        className="event-sheet"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragState.current?.dragging ? 'none' : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="event-sheet__handle-area"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="event-sheet__handle" />
        </div>

        <div className="event-sheet__scroll">
          <div className="event-sheet__cover-wrap">
            <img src={event.cover} alt="" className="event-sheet__cover" />
          </div>

          <h2 className="t-large-title event-sheet__title">{event.title}</h2>

          <div className="event-sheet__chips">
            <span
              className="event-sheet__category-chip"
              style={{ background: meta.fill, color: meta.glyphColor }}
            >
              {meta.label}
            </span>
            <Chip variant={isLive(event) ? 'orange' : 'cyan'}>{formatEventTime(event)}</Chip>
          </div>

          <p className="t-caption event-sheet__location">
            {event.venue} · {event.area}
          </p>

          <p className="t-body event-sheet__description">{event.description}</p>

          {attendees.length > 0 && (
            <div className="event-sheet__attendees">
              <h3 className="t-caption event-sheet__attendees-title">Who's going</h3>
              <div className="event-sheet__attendees-row">
                {attendees.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="event-sheet__attendee"
                    onClick={() => onSelectPerson(p.id)}
                  >
                    <Avatar src={p.photo} alt={`${p.firstName} ${p.lastName}`} size={52} />
                    <span className="event-sheet__attendee-name">{p.firstName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
