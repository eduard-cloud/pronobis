import { useEffect, useState } from 'react';
import { SFXmark, SFChevronRight, SFBellFill } from 'sf-symbols-lib/monochrome';
import { usePeople } from '../data/store';
import { Avatar } from './Avatar';
import { formatMemberSince } from '../utils/format';
import './SettingsModal.css';

const SETTINGS_STORAGE_KEY = 'pronobis.settings.v1';

type StoredSettings = {
  notifications: boolean;
};

function loadSettings(): StoredSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredSettings;
  } catch {
    // fall through to defaults
  }
  return { notifications: true };
}

type Props = {
  onClose: () => void;
  onEditProfile: () => void;
};

export function SettingsModal({ onClose, onEditProfile }: Props) {
  const { people, households, currentUserId } = usePeople();
  const [settings, setSettings] = useState<StoredSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const currentUser = people.find((p) => p.id === currentUserId);
  const household = households.find((h) => h.id === currentUser?.householdId);
  const familyMembers = (household?.memberIds ?? [])
    .filter((id) => id !== currentUserId)
    .map((id) => people.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (!currentUser) return null;

  function toggle(key: keyof StoredSettings) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal__scroll">
          <div className="settings-modal__header">
            <h1 className="settings-modal__title">Settings</h1>
            <button
              type="button"
              className="settings-modal__close"
              aria-label="Close"
              onClick={onClose}
            >
              <SFXmark size={17} />
            </button>
          </div>

          <div className="settings-modal__card">
            <button type="button" className="settings-row settings-row--profile" onClick={onEditProfile}>
              <Avatar src={currentUser.photo} alt={currentUser.firstName} size={68} ring={false} />
              <div className="settings-row__content">
                <div className="settings-row__title-group">
                  <span className="settings-row__title">
                    {currentUser.firstName} {currentUser.lastName}
                  </span>
                  <span className="settings-row__subtitle">
                    {formatMemberSince(currentUser.memberSince)}
                  </span>
                </div>
                <span className="settings-row__trailing">
                  <span className="settings-row__trailing-label">Edit</span>
                  <SFChevronRight size={13} />
                </span>
              </div>
            </button>

            {familyMembers.length > 0 && (
              <div className="settings-row settings-row--family">
                <div className="settings-row__stack">
                  {familyMembers.slice(0, 3).map((m) => (
                    <span key={m.id} className="settings-row__stack-avatar">
                      <img src={m.photo} alt={m.firstName} />
                    </span>
                  ))}
                </div>
                <span className="settings-row__family-label">{household?.label ?? 'Family'}</span>
              </div>
            )}
          </div>

          <div className="settings-modal__card">
            <button type="button" className="settings-row settings-row--toggle" onClick={() => toggle('notifications')}>
              <span className="settings-row__icon settings-row__icon--orange">
                <SFBellFill size={16} />
              </span>
              <span className="settings-row__label">Notifications</span>
              <span
                className={
                  'settings-toggle' + (settings.notifications ? ' settings-toggle--on' : '')
                }
              >
                <span className="settings-toggle__knob" />
              </span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
