import { useEffect, useRef, useState } from 'react';
import { SFPerson2, SFPerson2Fill } from 'sf-symbols-lib/monochrome';
import type { ComponentType } from 'react';
import './MapModeSwitch.css';

export type MapMode = 'people' | 'events';

type Props = {
  mode: MapMode;
  onModeChange: (mode: MapMode) => void;
};

const SEGMENTS: { key: MapMode; icon: ComponentType<{ size?: number }>; activeIcon: ComponentType<{ size?: number }>; label: string; ariaLabel: string }[] = [
  { key: 'people', icon: SFPerson2, label: 'People', activeIcon: SFPerson2Fill, ariaLabel: 'Show people on the map' },
  { key: 'events', icon: SFPerson2, label: 'Events', activeIcon: SFPerson2Fill, ariaLabel: 'Show events on the map' },
];

const SEGMENT_HEIGHT = 56;
const LABEL_VISIBLE_MS = 1200;

export function MapModeSwitch({ mode, onModeChange }: Props) {
  const [transientLabel, setTransientLabel] = useState<string | null>(null);
  const labelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventsIntroShown = useRef(false);

  function showTransientLabel(text: string) {
    setTransientLabel(text);
    if (labelTimeoutRef.current) clearTimeout(labelTimeoutRef.current);
    labelTimeoutRef.current = setTimeout(() => setTransientLabel(null), LABEL_VISIBLE_MS);
  }

  useEffect(() => {
    return () => {
      if (labelTimeoutRef.current) clearTimeout(labelTimeoutRef.current);
    };
  }, []);

  // Teach the icon meaning once, automatically, the first time Events mode
  // is entered — after that the transient label only appears on tap.
  useEffect(() => {
    if (mode === 'events' && !eventsIntroShown.current) {
      eventsIntroShown.current = true;
      showTransientLabel('Events');
    }
  }, [mode]);

  function select(next: MapMode) {
    if (next !== mode) onModeChange(next);
    showTransientLabel(SEGMENTS.find((s) => s.key === next)!.label);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const currentIndex = SEGMENTS.findIndex((s) => s.key === mode);
    const nextIndex =
      e.key === 'ArrowDown'
        ? (currentIndex + 1) % SEGMENTS.length
        : (currentIndex - 1 + SEGMENTS.length) % SEGMENTS.length;
    select(SEGMENTS[nextIndex].key);
  }

  const activeIndex = SEGMENTS.findIndex((s) => s.key === mode);

  return (
    <div className="map-mode-switch-wrap">
      <div
        className="map-mode-switch"
        role="radiogroup"
        aria-label="Map mode"
        onKeyDown={handleKeyDown}
      >
        {transientLabel && (
          <div className="map-mode-switch__label" key={transientLabel}>
            {transientLabel}
          </div>
        )}
        <div
          className="map-mode-switch__thumb"
          aria-hidden="true"
          style={{ transform: `translateY(${activeIndex * SEGMENT_HEIGHT}px)` }}
        />
        {SEGMENTS.map(({ key, icon: Icon, activeIcon: ActiveIcon, ariaLabel }) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={mode === key}
            aria-label={ariaLabel}
            className={'map-mode-switch__segment' + (mode === key ? ' map-mode-switch__segment--active' : '')}
            onClick={() => select(key)}
          >
            {mode === key ? <ActiveIcon size={20} /> : <Icon size={20} />}
          </button>
        ))}
      </div>
    </div>
  );
}
