import type { Household, Person } from '../types';
import { generateInitialsAvatar } from './avatar';

type SeedInput = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  bio: string;
  interests: string[];
  relation: Person['relation'];
  householdId: string;
};

const CITIES: Record<string, { lat: number; lng: number; label: string }> = {
  cluj: { lat: 46.7712, lng: 23.6236, label: 'Cluj-Napoca' },
  bucuresti: { lat: 44.4268, lng: 26.1025, label: 'București' },
  timisoara: { lat: 45.7489, lng: 21.2087, label: 'Timișoara' },
  iasi: { lat: 47.1585, lng: 27.6014, label: 'Iași' },
  brasov: { lat: 45.6427, lng: 25.5887, label: 'Brașov' },
  sibiu: { lat: 45.7983, lng: 24.1256, label: 'Sibiu' },
  constanta: { lat: 44.1598, lng: 28.6348, label: 'Constanța' },
};

const households: {
  id: string;
  label: string;
  city: keyof typeof CITIES;
  memberSince: string;
  members: SeedInput[];
}[] = [
  {
    id: 'h1',
    label: 'Popescu',
    city: 'cluj',
    memberSince: '2019-03',
    members: [
      {
        id: 'p1',
        firstName: 'Andrei',
        lastName: 'Popescu',
        birthDate: '1985-04-12',
        bio: 'Coordinates the Thursday evening group and makes a mean bowl of ciorbă. Always up for a hike.',
        interests: ['Hiking', 'Cooking', 'Board games'],
        relation: 'adult',
        householdId: 'h1',
      },
      {
        id: 'p2',
        firstName: 'Ioana',
        lastName: 'Popescu',
        birthDate: '1987-09-02',
        bio: 'Runs the welcome table most Sundays. Loves reading, terrible at remembering names on the first try.',
        interests: ['Reading', 'Photography', 'Coffee'],
        relation: 'adult',
        householdId: 'h1',
      },
      {
        id: 'p3',
        firstName: 'Matei',
        lastName: 'Popescu',
        birthDate: '2013-06-21',
        bio: 'Wants to be a goalkeeper. Will challenge anyone to a board game and usually win.',
        interests: ['Football', 'Board games'],
        relation: 'child',
        householdId: 'h1',
      },
      {
        id: 'p4',
        firstName: 'Sofia',
        lastName: 'Popescu',
        birthDate: '2016-11-08',
        bio: 'Draws on everything. Currently obsessed with dinosaurs and glitter pens.',
        interests: ['Painting'],
        relation: 'child',
        householdId: 'h1',
      },
    ],
  },
  {
    id: 'h2',
    label: 'Ionescu',
    city: 'bucuresti',
    memberSince: '2022-01',
    members: [
      {
        id: 'p5',
        firstName: 'Radu',
        lastName: 'Ionescu',
        birthDate: '1990-02-17',
        bio: 'New in town and still learning names. Plays chess badly but enthusiastically.',
        interests: ['Chess', 'Cycling', 'Coding'],
        relation: 'adult',
        householdId: 'h2',
      },
    ],
  },
  {
    id: 'h3',
    label: 'Dumitrescu',
    city: 'timisoara',
    memberSince: '2017-09',
    members: [
      {
        id: 'p6',
        firstName: 'Mihai',
        lastName: 'Dumitrescu',
        birthDate: '1982-12-04',
        bio: 'Fixes anything with a plug. Been around long enough to know most of the founding families.',
        interests: ['Gardening', 'Football'],
        relation: 'adult',
        householdId: 'h3',
      },
      {
        id: 'p7',
        firstName: 'Elena',
        lastName: 'Dumitrescu',
        birthDate: '1984-03-29',
        bio: 'Bakes for every gathering, no exceptions. Ask her about the sourdough starter.',
        interests: ['Baking', 'Yoga'],
        relation: 'adult',
        householdId: 'h3',
      },
      {
        id: 'p8',
        firstName: 'Luca',
        lastName: 'Dumitrescu',
        birthDate: '2015-07-19',
        bio: 'Fastest kid at the summer camp relay two years running.',
        interests: ['Football', 'Running'],
        relation: 'child',
        householdId: 'h3',
      },
    ],
  },
  {
    id: 'h4',
    label: 'Georgescu',
    city: 'cluj',
    memberSince: '2021-05',
    members: [
      {
        id: 'p9',
        firstName: 'Ana',
        lastName: 'Georgescu',
        birthDate: '1993-08-30',
        bio: 'Moved from Iași two years ago and never left. Always has a camera on her.',
        interests: ['Photography', 'Traveling', 'Music'],
        relation: 'adult',
        householdId: 'h4',
      },
    ],
  },
  {
    id: 'h5',
    label: 'Constantin',
    city: 'iasi',
    memberSince: '2015-02',
    members: [
      {
        id: 'p10',
        firstName: 'Bogdan',
        lastName: 'Constantin',
        birthDate: '1979-01-22',
        bio: 'One of the longest-standing members. Knows the building better than the caretaker.',
        interests: ['Volunteering', 'Chess'],
        relation: 'adult',
        householdId: 'h5',
      },
      {
        id: 'p11',
        firstName: 'Carla',
        lastName: 'Constantin',
        birthDate: '1981-05-14',
        bio: 'Runs the kids program on weekends. Three of her own to practice on.',
        interests: ['Volunteering', 'Baking'],
        relation: 'adult',
        householdId: 'h5',
      },
      {
        id: 'p12',
        firstName: 'David',
        lastName: 'Constantin',
        birthDate: '2010-10-03',
        bio: 'Plays the drums louder than anyone asked for. Very proud of it.',
        interests: ['Music', 'Football'],
        relation: 'child',
        householdId: 'h5',
      },
      {
        id: 'p13',
        firstName: 'Maria',
        lastName: 'Constantin',
        birthDate: '2012-04-27',
        bio: 'Reads faster than the library can restock. Currently on a mystery-novel streak.',
        interests: ['Reading'],
        relation: 'child',
        householdId: 'h5',
      },
      {
        id: 'p14',
        firstName: 'Ilinca',
        lastName: 'Constantin',
        birthDate: '2018-09-15',
        bio: 'Youngest of the family and the unofficial mascot of the nursery room.',
        interests: ['Painting'],
        relation: 'child',
        householdId: 'h5',
      },
    ],
  },
  {
    id: 'h6',
    label: 'Marin',
    city: 'brasov',
    memberSince: '2023-06',
    members: [
      {
        id: 'p15',
        firstName: 'Tudor',
        lastName: 'Marin',
        birthDate: '1996-11-11',
        bio: 'Mountain guide by trade. Will talk your ear off about trail conditions if you let him.',
        interests: ['Hiking', 'Skiing', 'Cycling'],
        relation: 'adult',
        householdId: 'h6',
      },
    ],
  },
  {
    id: 'h7',
    label: 'Stan',
    city: 'sibiu',
    memberSince: '2020-10',
    members: [
      {
        id: 'p16',
        firstName: 'Vlad',
        lastName: 'Stan',
        birthDate: '1988-07-06',
        bio: 'Plays guitar in the Sunday band. Terrible parker, great neighbor.',
        interests: ['Music', 'Coffee'],
        relation: 'adult',
        householdId: 'h7',
      },
      {
        id: 'p17',
        firstName: 'Diana',
        lastName: 'Stan',
        birthDate: '1990-01-25',
        bio: 'Teaches yoga on Tuesdays in the back room. Always brings extra mats.',
        interests: ['Yoga', 'Cooking'],
        relation: 'adult',
        householdId: 'h7',
      },
      {
        id: 'p18',
        firstName: 'Nicolae',
        lastName: 'Stan',
        birthDate: '2017-03-09',
        bio: 'Collects rocks from every trip. The collection is getting out of hand.',
        interests: ['Hiking'],
        relation: 'child',
        householdId: 'h7',
      },
    ],
  },
  {
    id: 'h8',
    label: 'Rusu',
    city: 'cluj',
    memberSince: '2024-02',
    members: [
      {
        id: 'p19',
        firstName: 'Larisa',
        lastName: 'Rusu',
        birthDate: '1998-06-18',
        bio: 'Newest face around here — still figuring out where everything is. Say hi.',
        interests: ['Dancing', 'Traveling'],
        relation: 'adult',
        householdId: 'h8',
      },
    ],
  },
  {
    id: 'h9',
    label: 'Vasilescu',
    city: 'constanta',
    memberSince: '2016-08',
    members: [
      {
        id: 'p20',
        firstName: 'Paul',
        lastName: 'Vasilescu',
        birthDate: '1983-10-09',
        bio: 'Grew up by the sea and still swims every morning he can. Coaches youth football.',
        interests: ['Football', 'Cycling'],
        relation: 'adult',
        householdId: 'h9',
      },
      {
        id: 'p21',
        firstName: 'Ștefania',
        lastName: 'Vasilescu',
        birthDate: '1985-12-01',
        bio: 'Organizes the summer coastal retreat every year. Ask her about carpooling.',
        interests: ['Volunteering', 'Photography'],
        relation: 'adult',
        householdId: 'h9',
      },
      {
        id: 'p22',
        firstName: 'Rareș',
        lastName: 'Vasilescu',
        birthDate: '2014-05-23',
        bio: 'Builds sandcastles with genuine architectural ambition.',
        interests: ['Football'],
        relation: 'child',
        householdId: 'h9',
      },
    ],
  },
];

function buildPeople(): Person[] {
  const people: Person[] = [];
  for (const h of households) {
    const location = CITIES[h.city];
    for (const m of h.members) {
      people.push({
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        photo: generateInitialsAvatar(m.firstName, m.lastName, m.id),
        birthDate: m.birthDate,
        memberSince: h.memberSince,
        bio: m.bio,
        interests: m.interests,
        relation: m.relation,
        householdId: h.id,
        location,
      });
    }
  }
  return people;
}

function buildHouseholds(): Household[] {
  return households.map((h) => ({
    id: h.id,
    label: h.label,
    memberIds: h.members.map((m) => m.id),
  }));
}

export const seedPeople: Person[] = buildPeople();
export const seedHouseholds: Household[] = buildHouseholds();

export const CURRENT_USER_ID = 'p1';
