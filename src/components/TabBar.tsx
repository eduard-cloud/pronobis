import { useEffect, useRef, useState } from 'react';
import { SFCircleGrid2x2, SFMagnifyingglass, SFMap, SFPersonCropRectangleStackFill, SFXmark } from 'sf-symbols-lib/monochrome';
import './TabBar.css';

export type View = 'map' | 'list' | 'grid';

type Props = {
  view: View;
  onViewChange: (view: View) => void;
  query: string;
  onQueryChange: (query: string) => void;
};

const TABS: { key: View; label: string; icon: typeof SFMap }[] = [
  { key: 'map', label: 'Map', icon: SFMap },
  { key: 'list', label: 'List', icon: SFPersonCropRectangleStackFill },
  { key: 'grid', label: 'Grid', icon: SFCircleGrid2x2 },
];

export function TabBar({ view, onViewChange, query, onQueryChange }: Props) {
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
            placeholder="Search people"
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
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                className={'tab-bar__tab' + (view === key ? ' tab-bar__tab--active' : '')}
                onClick={() => onViewChange(key)}
              >
                <span className="tab-bar__tab-pill">
                  <Icon size={18} />
                  <span className="tab-bar__tab-label">{label}</span>
                </span>
              </button>
            ))}
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
