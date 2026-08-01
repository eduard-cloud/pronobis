import { useEffect, useRef, useState } from 'react';
import { usePeople } from '../data/store';
import { Avatar } from './Avatar';
import './AvatarMenu.css';

type Props = {
  onEditProfile: () => void;
  onReset: () => void;
};

export function AvatarMenu({ onEditProfile, onReset }: Props) {
  const { people, currentUserId } = usePeople();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const currentUser = people.find((p) => p.id === currentUserId);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function handleReset() {
    if (window.confirm('Reset demo data? This clears everyone added during this session.')) {
      onReset();
      setOpen(false);
    }
  }

  if (!currentUser) return null;

  return (
    <div className="avatar-menu" ref={rootRef}>
      <Avatar
        src={currentUser.photo}
        alt={currentUser.firstName}
        size={40}
        onClick={() => setOpen((v) => !v)}
      />
      {open && (
        <div className="avatar-menu__panel">
          <button
            type="button"
            className="avatar-menu__item"
            onClick={() => {
              onEditProfile();
              setOpen(false);
            }}
          >
            Edit profile
          </button>
          <button
            type="button"
            className="avatar-menu__item avatar-menu__item--danger"
            onClick={handleReset}
          >
            Reset demo data
          </button>
        </div>
      )}
    </div>
  );
}
