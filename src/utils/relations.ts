import type { Person } from '../types';

export function deriveRelationLabel(viewer: Person, other: Person): string {
  if (viewer.relation === 'adult' && other.relation === 'adult') return 'Partner';
  if (viewer.relation === 'adult' && other.relation === 'child') return 'Child';
  if (viewer.relation === 'child' && other.relation === 'adult') return 'Parent';
  return 'Sibling';
}
