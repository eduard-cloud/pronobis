import { useEffect, useRef, useState } from 'react';
import {
  SFMagnifyingglass,
  SFMap,
  SFMapFill,
  SFPerson2,
  SFPerson2Fill,
  SFXmark,
} from 'sf-symbols-lib/monochrome';
import './TabBar.css';

export type View = 'map' | 'list' | 'grid';

type Props = {
  view: View;
  onViewChange: (view: View) => void;
  query: string;
  onQueryChange: (query: string) => void;
  searchPlaceholder?: string;
};

// Grid is hidden for now (Figma tab bar only shows Map/List). Icon swaps
// to the filled variant when its tab is selected, per Figma.
const TABS: { key: View; label: string; icon: typeof SFMapFill; activeIcon: typeof SFMapFill }[] = [
  { key: 'map', label: 'Map', icon: SFMap, activeIcon: SFMapFill },
  { key: 'list', label: 'List', icon: SFPerson2, activeIcon: SFPerson2Fill },
];

export function TabBar({ view, onViewChange, query, onQueryChange, searchPlaceholder = 'Search people' }: Props) {
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searching) inputRef.current?.focus();
  }, [searching]);

  function closeSearch() {
    setSearching(false);
    onQueryChange('');
    inputRef.current?.blur();
  }

  return (
    <div className="tab-bar">
      {searching ? (
        <div className="tab-bar__search">
          <span className="tab-bar__search-icon">
            <SFMagnifyingglass size={17} />
          </span>
          <input
            ref={inputRef}
            className="tab-bar__search-input"
            type="search"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
          <button type="button" className="tab-bar__search-close" onClick={closeSearch} aria-label="Close search">
            <SFXmark size={15} />
          </button>
        </div>
      ) : (
        <>
          <div className="tab-bar__tabs">
            {TABS.map(({ key, label, icon: Icon, activeIcon: ActiveIcon }) => {
              const active = view === key;
              const TabIcon = active ? ActiveIcon : Icon;
              return (
                <button
                  key={key}
                  type="button"
                  className={'tab-bar__tab' + (active ? ' tab-bar__tab--active' : '')}
                  onClick={() => onViewChange(key)}
                >
                  <span className="tab-bar__tab-pill">
                    <TabIcon size={18} />
                    <span className="tab-bar__tab-label">{label}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="tab-bar__search-trigger"
            onClick={() => setSearching(true)}
            aria-label="Search"
          >
            <SFMagnifyingglass size={17} />
          </button>
        </>
      )}
    </div>
  );
}
