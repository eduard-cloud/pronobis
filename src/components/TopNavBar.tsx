import { useEffect, useRef, useState } from 'react';
import { AvatarMenu } from './AvatarMenu';
import './TopNavBar.css';

type Props = {
  query: string;
  onQueryChange: (query: string) => void;
  onEditProfile: () => void;
  onReset: () => void;
};

function SearchIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
      <circle cx="8.5" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="2" />
      <line x1="13.4" y1="13.4" x2="17.5" y2="17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
      <path
        d="M9.5 2.5c-2.2 0-4 1.8-4 4v2.3c0 .6-.2 1.2-.6 1.7l-1 1.3c-.6.8 0 1.9 1 1.9h9.2c1 0 1.6-1.1 1-1.9l-1-1.3c-.4-.5-.6-1.1-.6-1.7V6.5c0-2.2-1.8-4-4-4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="4.5" r="2.5" fill="var(--orange)" stroke="white" strokeWidth="1" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <line x1="2" y1="2" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="15" y1="2" x2="2" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function TopNavBar({ query, onQueryChange, onEditProfile, onReset }: Props) {
  const [active, setActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active) inputRef.current?.focus();
  }, [active]);

  function close() {
    setActive(false);
    onQueryChange('');
    inputRef.current?.blur();
  }

  return (
    <div className="top-nav">
      <div className={'top-nav__row' + (active ? ' top-nav__row--hidden' : '')}>
        <button
          type="button"
          className="top-nav__chip top-nav__chip--icon"
          onClick={() => setActive(true)}
          aria-label="Search"
        >
          <SearchIcon />
        </button>

        <div className="top-nav__spacer" />

        <div className="top-nav__chip top-nav__pill">
          <AvatarMenu onEditProfile={onEditProfile} onReset={onReset} size={36} />
          <div className="top-nav__divider" />
          <button type="button" className="top-nav__bell" aria-label="Notifications">
            <BellIcon />
          </button>
        </div>
      </div>

      <div className={'top-nav__row top-nav__row--search' + (active ? '' : ' top-nav__row--hidden')}>
        <div className="top-nav__chip top-nav__search-field">
          <span className="top-nav__search-icon">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            className="top-nav__search-input"
            type="search"
            placeholder="Search people"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
        <button type="button" className="top-nav__chip top-nav__chip--icon" onClick={close} aria-label="Close search">
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
