export type Relation = 'adult' | 'child';

export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  photo: string;
  birthDate: string;
  memberSince: string;
  bio: string;
  interests: string[];
  relation: Relation;
  householdId: string;
  location: { lat: number; lng: number; label: string } | null;
};

export type Household = {
  id: string;
  label: string;
  memberIds: string[];
};

export type EventCategory = 'music' | 'food' | 'sports' | 'arts' | 'outdoors' | 'community';

export type CommunityEvent = {
  id: string;
  title: string;
  category: EventCategory;
  venue: string;
  area: string;
  city: string;
  location: { lat: number; lng: number };
  /** ISO timestamps materialized at module load from relative offsets — see data/events.ts. */
  startsAt: string;
  endsAt: string;
  cover: string;
  description: string;
  attendeeIds: string[];
};
