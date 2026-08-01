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
