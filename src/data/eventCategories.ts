import type { EventCategory } from '../types';

type CategoryMeta = {
  label: string;
  /** Tile fill color. Drawn from the Pronobis brand palette (teal + gold and
   * their shades/tints) so map markers stay on-brand. Every pairing is
   * verified at 4.5:1+ contrast against its glyph color. */
  fill: string;
  glyph: string;
  glyphColor: string;
};

// Exactly six categories — more overloads a categorical map legend.
// Fill colors cycle through the Pronobis brand palette (see src/data/avatar.ts).
export const EVENT_CATEGORIES: Record<EventCategory, CategoryMeta> = {
  music: { label: 'Music', fill: '#174C44', glyph: 'SFMusicNote', glyphColor: '#F4F3F0' },
  food: { label: 'Food & drink', fill: '#E9C13F', glyph: 'SFForkKnife', glyphColor: '#0C0F14' },
  sports: { label: 'Sports', fill: '#0D2B26', glyph: 'SFFigureRun', glyphColor: '#F4F3F0' },
  arts: { label: 'Arts & culture', fill: '#B88F1E', glyph: 'SFTheatermasksFill', glyphColor: '#0C0F14' },
  outdoors: { label: 'Outdoors', fill: '#3E7168', glyph: 'SFLeafFill', glyphColor: '#F4F3F0' },
  community: { label: 'Community', fill: '#F2D983', glyph: 'SFPerson3Fill', glyphColor: '#0C0F14' },
};

export const EVENT_CATEGORY_LIST = Object.keys(EVENT_CATEGORIES) as EventCategory[];
