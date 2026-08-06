import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  SFMusicNote,
  SFForkKnife,
  SFFigureRun,
  SFTheatermasksFill,
  SFLeafFill,
  SFPerson3Fill,
  SFBuilding2Fill,
} from 'sf-symbols-lib/monochrome';

// A named import per icon (not `import * as monochrome`) so the bundle only
// pulls in the handful of glyphs the map actually uses — sf-symbols-lib
// ships tens of thousands of icon modules, and a wildcard import defeats
// tree-shaking across all of them.
const icons: Record<string, ComponentType<{ size?: number }>> = {
  SFMusicNote,
  SFForkKnife,
  SFFigureRun,
  SFTheatermasksFill,
  SFLeafFill,
  SFPerson3Fill,
  SFBuilding2Fill,
};

/** Renders a named sf-symbols-lib icon to a static SVG markup string, for
 * the plain-DOM marker factories (mapboxgl.Marker elements aren't React
 * trees, so the icon components can't be mounted directly). */
export function renderGlyph(name: string, size: number): string {
  const Icon = icons[name];
  if (!Icon) throw new Error(`Unknown sf-symbols-lib icon: ${name}`);
  return renderToStaticMarkup(createElement(Icon, { size }));
}
