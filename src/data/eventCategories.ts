import type { EventCategory } from '../types';

type CategoryMeta = {
  label: string;
  /** Tile fill color. Values are hue-preserving darkenings of the initial
   * design picks — the originals failed 4.5:1 contrast against their glyph
   * color, verified with a WCAG relative-luminance check. */
  fill: string;
  glyph: string;
  glyphColor: string;
};

// Exactly six categories — more overloads a categorical map legend.
export const EVENT_CATEGORIES: Record<EventCategory, CategoryMeta> = {
  music: { label: 'Music', fill: '#7756ff', glyph: 'SFMusicNote', glyphColor: '#ffffff' },
  food: { label: 'Food & drink', fill: '#f58a33', glyph: 'SFForkKnife', glyphColor: '#0c0f14' },
  sports: { label: 'Sports', fill: '#268457', glyph: 'SFFigureRun', glyphColor: '#ffffff' },
  arts: { label: 'Arts & culture', fill: '#d92b77', glyph: 'SFTheatermasksFill', glyphColor: '#ffffff' },
  outdoors: { label: 'Outdoors', fill: '#237bb4', glyph: 'SFLeafFill', glyphColor: '#ffffff' },
  community: { label: 'Community', fill: '#174c44', glyph: 'SFPerson3Fill', glyphColor: '#ffffff' },
};

export const EVENT_CATEGORY_LIST = Object.keys(EVENT_CATEGORIES) as EventCategory[];
