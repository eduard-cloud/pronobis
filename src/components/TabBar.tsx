import { useEffect, useRef, useState } from 'react';
import { SFCircleGrid2x2, SFMagnifyingglass, SFMapFill, SFPersonCropRectangleStack, SFXmark } from 'sf-symbols-lib/monochrome';
import './TabBar.css';

export type View = 'map' | 'list' | 'grid';

type Props = {
  view: View;
  onViewChange: (view: View) => void;
  query: string;
  onQueryChange: (query: string) => void;
  searchPlaceholder?: string;
};

// Figma codes Map and List as teal (#174c44) and Grid as near-black
// (#1a1a1a) regardless of selection; reproduced literally via data-tint
// rather than substituting a generic active/inactive rule.
const TABS: { key: View; label: string; icon: typeof SFMapFill; tint?: 'teal' }[] = [
  { key: 'map', label: 'Map', icon: SFMapFill, tint: 'teal' },
  { key: 'list', label: 'List', icon: SFPersonCropRectangleStack, tint: 'teal' },
  { key: 'grid', label: 'Grid', icon: SFCircleGrid2x2 },
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
            {TABS.map(({ key, label, icon: Icon, tint }) => (
              <button
                key={key}
                type="button"
                data-tint={tint}
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
