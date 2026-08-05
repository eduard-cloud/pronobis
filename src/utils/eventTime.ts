import type { CommunityEvent } from '../types';

export type TimeBucket = 'now' | 'today' | 'week';

export function isLive(event: CommunityEvent, at: Date = new Date()): boolean {
  const t = at.getTime();
  return t >= new Date(event.startsAt).getTime() && t <= new Date(event.endsAt).getTime();
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** "This week" means anywhere in the rolling 7 days starting today, so the
 * chip's count only ever shrinks as buckets narrow (week ⊇ today ⊇ now). */
export function matchesBucket(event: CommunityEvent, bucket: TimeBucket, at: Date = new Date()): boolean {
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);

  if (bucket === 'now') return isLive(event, at);

  if (bucket === 'today') {
    return isSameCalendarDay(start, at) || isSameCalendarDay(end, at) || (start <= at && end >= at);
  }

  const weekEnd = new Date(at);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return start <= weekEnd && end >= at;
}

const TIME_FORMAT: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
const DAY_FORMAT: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };

export function formatEventTime(event: CommunityEvent, at: Date = new Date()): string {
  if (isLive(event, at)) return 'Happening now';

  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  const time = `${start.toLocaleTimeString([], TIME_FORMAT)}–${end.toLocaleTimeString([], TIME_FORMAT)}`;

  if (isSameCalendarDay(start, at)) return `Today · ${time}`;

  const tomorrow = new Date(at);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameCalendarDay(start, tomorrow)) return `Tomorrow · ${time}`;

  return `${start.toLocaleDateString([], DAY_FORMAT)} · ${time}`;
}
