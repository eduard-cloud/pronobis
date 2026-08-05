import type { CommunityEvent, EventCategory } from '../types';
import { jitterLocation } from '../map/geoJitter';
import { TIMISOARA_AREAS } from './timisoaraAreas';
import { ROMANIA_CITIES } from './romaniaCities';

type Seed = {
  id: string;
  title: string;
  category: EventCategory;
  venue: string;
  area: string;
  city: string;
  lat: number;
  lng: number;
  /** Days from today (0 = today), materialized to an ISO timestamp at
   * module load so the demo never goes stale — never hardcode ISO dates
   * here. */
  dayOffset: number;
  startHour: number;
  durationHours: number;
  description: string;
  attendeeIds: string[];
};

function area(label: string) {
  const a = TIMISOARA_AREAS.find((a) => a.label === label);
  if (!a) throw new Error(`Unknown Timișoara area: ${label}`);
  return a;
}

function city(id: string) {
  const c = ROMANIA_CITIES.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown city: ${id}`);
  return c;
}

// Computed once so every "Sunday Service" seed lands on the same upcoming
// Sunday, rather than each re-evaluating `new Date()` independently.
const DAYS_UNTIL_SUNDAY = (7 - new Date().getDay()) % 7 || 7;

// Mostly church community life — services, small groups, fellowship — with
// outdoor and sports activities mixed in, matching how the seed community
// actually gathers. Timișoara carries full detail; other cities get a
// lighter sprinkle so the country tier isn't empty.
const TIMISOARA_SEEDS: Omit<Seed, 'lat' | 'lng' | 'city'>[] = [
  {
    id: 'e-tm-01',
    title: 'Sunday Morning Service',
    category: 'community',
    venue: 'Biserica Elim',
    area: 'Cetate',
    dayOffset: DAYS_UNTIL_SUNDAY,
    startHour: 10,
    durationHours: 2,
    description: 'Worship, teaching, and fellowship to start the week together. All are welcome.',
    attendeeIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'],
  },
  {
    id: 'e-tm-02',
    title: 'Prayer & Fasting Night',
    category: 'community',
    venue: 'Speranța Community Church',
    area: 'Fabric',
    dayOffset: 1,
    startHour: 19,
    durationHours: 1.5,
    description: 'A quiet midweek gathering to pray together as a church family.',
    attendeeIds: ['p2', 'p5', 'p9', 'p14'],
  },
  {
    id: 'e-tm-03',
    title: "Men's Breakfast",
    category: 'community',
    venue: 'Calvary Chapel Timișoara',
    area: 'Iosefin',
    dayOffset: 2,
    startHour: 8,
    durationHours: 1.5,
    description: 'Coffee, eggs, and honest conversation before the workday starts.',
    attendeeIds: ['p1', 'p8', 'p12', 'p19'],
  },
  {
    id: 'e-tm-04',
    title: "Women's Ministry Circle",
    category: 'community',
    venue: 'Harul Church Hall',
    area: 'Elisabetin',
    dayOffset: 2,
    startHour: 18,
    durationHours: 2,
    description: 'A monthly circle for encouragement, study, and tea.',
    attendeeIds: ['p3', 'p6', 'p11', 'p16', 'p20'],
  },
  {
    id: 'e-tm-05',
    title: 'Youth Group Night',
    category: 'community',
    venue: 'Biserica Elim — Youth Wing',
    area: 'Cetate',
    dayOffset: 3,
    startHour: 18,
    durationHours: 2,
    description: 'Games, worship, and a short talk for teens across the community.',
    attendeeIds: ['p4', 'p10', 'p13', 'p17', 'p21'],
  },
  {
    id: 'e-tm-06',
    title: 'Wednesday Bible Study',
    category: 'community',
    venue: 'Speranța Community Church',
    area: 'Fabric',
    dayOffset: 3,
    startHour: 19,
    durationHours: 1.5,
    description: 'Working through the book of Romans, chapter by chapter.',
    attendeeIds: ['p2', 'p7', 'p9', 'p15', 'p18'],
  },
  {
    id: 'e-tm-07',
    title: 'Small Group — Mehala',
    category: 'community',
    venue: "Host home, Mehala",
    area: 'Mehala',
    dayOffset: 4,
    startHour: 19,
    durationHours: 1.5,
    description: 'A living-room gathering for prayer, discussion, and dinner.',
    attendeeIds: ['p5', 'p8', 'p14', 'p22'],
  },
  {
    id: 'e-tm-08',
    title: 'Food Pantry Outreach',
    category: 'community',
    venue: 'Biserica Elim',
    area: 'Cetate',
    dayOffset: 5,
    startHour: 10,
    durationHours: 3,
    description: 'Packing and distributing groceries to families in the neighborhood.',
    attendeeIds: ['p1', 'p3', 'p6', 'p10', 'p12', 'p19'],
  },
  {
    id: 'e-tm-09',
    title: 'Baptism Sunday',
    category: 'community',
    venue: 'Calvary Chapel Timișoara',
    area: 'Iosefin',
    dayOffset: 6,
    startHour: 11,
    durationHours: 2,
    description: 'Celebrating new believers taking their next step of faith.',
    attendeeIds: ['p1', 'p2', 'p4', 'p9', 'p13', 'p16', 'p20'],
  },
  {
    id: 'e-tm-10',
    title: 'All-Day Sanctuary Prayer',
    category: 'community',
    venue: 'Biserica Elim',
    area: 'Cetate',
    // Spans the full current day so exactly one live pin exists at any hour.
    dayOffset: 0,
    startHour: 0,
    durationHours: 24,
    description: 'The sanctuary stays open all day for anyone who wants to stop in and pray.',
    attendeeIds: ['p2', 'p6', 'p11'],
  },
  {
    id: 'e-tm-11',
    title: 'Church Camping Retreat',
    category: 'outdoors',
    venue: 'Pădurea Verde campsite',
    area: 'Zona Lunei',
    dayOffset: 4,
    startHour: 9,
    durationHours: 30,
    description: 'A weekend away from the city — worship around the fire and time outdoors together.',
    attendeeIds: ['p3', 'p7', 'p10', 'p13', 'p17', 'p21'],
  },
  {
    id: 'e-tm-12',
    title: 'Community Park Cleanup',
    category: 'outdoors',
    venue: 'Parcul Central',
    area: 'Cetate',
    dayOffset: 1,
    startHour: 9,
    durationHours: 2,
    description: 'Serving the neighborhood by tidying up the park we love.',
    attendeeIds: ['p4', 'p8', 'p12', 'p18'],
  },
  {
    id: 'e-tm-13',
    title: 'Fellowship Hiking Trip',
    category: 'outdoors',
    venue: 'Trail meetup, Ronaț edge',
    area: 'Ronaț',
    dayOffset: 6,
    startHour: 8,
    durationHours: 4,
    description: 'An easy morning trail walk followed by a shared lunch.',
    attendeeIds: ['p5', 'p9', 'p14', 'p16', 'p19'],
  },
  {
    id: 'e-tm-14',
    title: 'Sunset Picnic & Worship',
    category: 'outdoors',
    venue: 'Parcul Rozelor',
    area: 'Circumvalațiunii',
    dayOffset: 2,
    startHour: 18,
    durationHours: 2.5,
    description: 'Blankets, guitars, and an open-air worship set as the sun goes down.',
    attendeeIds: ['p1', 'p6', 'p11', 'p15', 'p20', 'p22'],
  },
  {
    id: 'e-tm-15',
    title: 'Early Morning Prayer Walk',
    category: 'outdoors',
    venue: 'Bega riverside path',
    area: 'Fabric',
    dayOffset: 5,
    startHour: 7,
    durationHours: 1,
    description: 'A quiet walk along the river, praying for the city as we go.',
    attendeeIds: ['p2', 'p10', 'p17'],
  },
  {
    id: 'e-tm-16',
    title: 'Church Basketball League',
    category: 'sports',
    venue: 'Sala Sporturilor Constantin Jude',
    area: 'Girocului',
    dayOffset: 2,
    startHour: 19,
    durationHours: 2,
    description: 'Weekly friendly league between small groups — everyone plays.',
    attendeeIds: ['p3', 'p8', 'p13', 'p18', 'p21'],
  },
  {
    id: 'e-tm-17',
    title: 'Charity 5K Run',
    category: 'sports',
    venue: 'Aradului start line',
    area: 'Aradului',
    dayOffset: 7,
    startHour: 8,
    durationHours: 2,
    description: 'A community run raising support for the food pantry ministry.',
    attendeeIds: ['p1', 'p4', 'p7', 'p12', 'p16', 'p19', 'p22'],
  },
  {
    id: 'e-tm-18',
    title: 'Volleyball Night',
    category: 'sports',
    venue: 'Lipovei sports court',
    area: 'Lipovei',
    dayOffset: 3,
    startHour: 20,
    durationHours: 1.5,
    description: 'Casual pickup volleyball — bring a friend.',
    attendeeIds: ['p5', 'p9', 'p14', 'p20'],
  },
  {
    id: 'e-tm-19',
    title: "Men's Soccer Friendly",
    category: 'sports',
    venue: 'Soarelui field',
    area: 'Soarelui',
    dayOffset: 6,
    startHour: 17,
    durationHours: 2,
    description: 'A friendly match against a sister church across town.',
    attendeeIds: ['p2', 'p6', 'p11', 'p15', 'p17'],
  },
  {
    id: 'e-tm-20',
    title: 'Worship Night',
    category: 'music',
    venue: 'Biserica Elim',
    area: 'Cetate',
    dayOffset: 4,
    startHour: 19,
    durationHours: 2,
    description: 'An evening set apart for extended worship and reflection.',
    attendeeIds: ['p1', 'p3', 'p8', 'p10', 'p13', 'p19', 'p21'],
  },
  {
    id: 'e-tm-21',
    title: 'Gospel Choir Concert',
    category: 'music',
    venue: 'Casa de Cultură a Studenților',
    area: 'Zona Lunei',
    dayOffset: 5,
    startHour: 19,
    durationHours: 2,
    description: 'The combined youth and adult choirs share a night of song.',
    attendeeIds: ['p4', 'p7', 'p9', 'p14', 'p16', 'p18', 'p22'],
  },
  {
    id: 'e-tm-22',
    title: 'Potluck Fellowship Dinner',
    category: 'food',
    venue: 'Speranța Community Church',
    area: 'Fabric',
    dayOffset: 3,
    startHour: 18,
    durationHours: 2,
    description: 'Everyone brings a dish — a full table and a fuller room.',
    attendeeIds: ['p2', 'p5', 'p6', 'p12', 'p15', 'p17', 'p20'],
  },
];

// A lighter sprinkle for the rest of the country, so the country-tier
// bubbles are never a dead end when tapped.
const OTHER_CITY_SEEDS: Omit<Seed, 'lat' | 'lng' | 'area'>[] = [
  { id: 'e-buc-01', title: 'Sunday Service', category: 'community', venue: 'Biserica Providența', city: 'bucuresti', dayOffset: DAYS_UNTIL_SUNDAY, startHour: 11, durationHours: 2, description: 'Weekly gathering for worship and teaching.', attendeeIds: [] },
  { id: 'e-buc-02', title: 'Young Adults Meetup', category: 'community', venue: 'Biserica Providența — Hall B', city: 'bucuresti', dayOffset: 3, startHour: 19, durationHours: 2, description: 'Discussion and worship for 20s and 30s.', attendeeIds: [] },
  { id: 'e-buc-03', title: 'City Park 5K', category: 'sports', venue: 'Herăstrău start line', city: 'bucuresti', dayOffset: 6, startHour: 8, durationHours: 2, description: 'A community fun run around the lake.', attendeeIds: [] },
  { id: 'e-buc-04', title: 'Riverside Prayer Walk', category: 'outdoors', venue: 'Dâmbovița embankment', city: 'bucuresti', dayOffset: 5, startHour: 7, durationHours: 1, description: 'An early walk of prayer through the city.', attendeeIds: [] },

  { id: 'e-cluj-01', title: 'Sunday Service', category: 'community', venue: 'Biserica Emanuel', city: 'cluj-napoca', dayOffset: DAYS_UNTIL_SUNDAY, startHour: 10, durationHours: 2, description: 'Weekly gathering for worship and teaching.', attendeeIds: [] },
  { id: 'e-cluj-02', title: 'Small Group Night', category: 'community', venue: 'Host home, Mănăștur', city: 'cluj-napoca', dayOffset: 2, startHour: 19, durationHours: 1.5, description: 'Midweek discussion and prayer.', attendeeIds: [] },
  { id: 'e-cluj-03', title: 'Hiking Fellowship', category: 'outdoors', venue: 'Făget Forest trailhead', city: 'cluj-napoca', dayOffset: 6, startHour: 9, durationHours: 4, description: 'A group hike through the forest above the city.', attendeeIds: [] },

  { id: 'e-iasi-01', title: 'Sunday Service', category: 'community', venue: 'Biserica Betania', city: 'iasi', dayOffset: DAYS_UNTIL_SUNDAY, startHour: 10, durationHours: 2, description: 'Weekly gathering for worship and teaching.', attendeeIds: [] },
  { id: 'e-iasi-02', title: 'Youth Basketball Night', category: 'sports', venue: 'Sala Sporturilor Iași', city: 'iasi', dayOffset: 3, startHour: 18, durationHours: 2, description: 'Weekly pickup games for the youth group.', attendeeIds: [] },
  { id: 'e-iasi-03', title: 'Fellowship Picnic', category: 'outdoors', venue: 'Parcul Copou', city: 'iasi', dayOffset: 6, startHour: 13, durationHours: 3, description: 'A relaxed afternoon picnic after church.', attendeeIds: [] },

  { id: 'e-brasov-01', title: 'Sunday Service', category: 'community', venue: 'Biserica Sfânta Treime', city: 'brasov', dayOffset: DAYS_UNTIL_SUNDAY, startHour: 10, durationHours: 2, description: 'Weekly gathering for worship and teaching.', attendeeIds: [] },
  { id: 'e-brasov-02', title: 'Mountain Prayer Retreat', category: 'outdoors', venue: 'Poiana Brașov trailhead', city: 'brasov', dayOffset: 5, startHour: 8, durationHours: 8, description: 'A day of hiking, worship, and quiet reflection in the mountains.', attendeeIds: [] },
  { id: 'e-brasov-03', title: 'Church Volleyball Night', category: 'sports', venue: 'Centru sports court', city: 'brasov', dayOffset: 4, startHour: 19, durationHours: 1.5, description: 'Casual pickup volleyball for all ages.', attendeeIds: [] },

  { id: 'e-const-01', title: 'Sunday Service', category: 'community', venue: 'Biserica Maranata', city: 'constanta', dayOffset: DAYS_UNTIL_SUNDAY, startHour: 10, durationHours: 2, description: 'Weekly gathering for worship and teaching.', attendeeIds: [] },
  { id: 'e-const-02', title: 'Beach Baptism Service', category: 'community', venue: 'Mamaia beach', city: 'constanta', dayOffset: 6, startHour: 9, durationHours: 2, description: 'Celebrating new believers by the sea.', attendeeIds: [] },
  { id: 'e-const-03', title: 'Seaside Fun Run', category: 'sports', venue: 'Mamaia boardwalk', city: 'constanta', dayOffset: 3, startHour: 7, durationHours: 1.5, description: 'An early run along the boardwalk.', attendeeIds: [] },

  { id: 'e-sibiu-01', title: 'Sunday Service', category: 'community', venue: 'Biserica Bethel', city: 'sibiu', dayOffset: DAYS_UNTIL_SUNDAY, startHour: 10, durationHours: 2, description: 'Weekly gathering for worship and teaching.', attendeeIds: [] },
  { id: 'e-sibiu-02', title: 'Old Town Fellowship Walk', category: 'outdoors', venue: 'Piața Mare', city: 'sibiu', dayOffset: 4, startHour: 18, durationHours: 1.5, description: 'A walking tour and conversation through the old town.', attendeeIds: [] },

  { id: 'e-oradea-01', title: 'Sunday Service', category: 'community', venue: 'Biserica Emanuel Oradea', city: 'oradea', dayOffset: DAYS_UNTIL_SUNDAY, startHour: 10, durationHours: 2, description: 'Weekly gathering for worship and teaching.', attendeeIds: [] },
  { id: 'e-oradea-02', title: 'Youth Soccer Friendly', category: 'sports', venue: 'Parcul 1 Decembrie field', city: 'oradea', dayOffset: 5, startHour: 17, durationHours: 2, description: 'A friendly match between youth groups.', attendeeIds: [] },
  { id: 'e-oradea-03', title: 'Community Garden Morning', category: 'outdoors', venue: 'Parcul 1 Decembrie', city: 'oradea', dayOffset: 2, startHour: 9, durationHours: 2, description: 'Tending the church community garden together.', attendeeIds: [] },
];

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function materialize(seed: Seed): CommunityEvent {
  const base = startOfToday();
  const start = new Date(base);
  start.setDate(start.getDate() + seed.dayOffset);
  start.setHours(seed.startHour, 0, 0, 0);
  const end = new Date(start.getTime() + seed.durationHours * 3600_000);

  const jittered = jitterLocation(seed.lat, seed.lng, seed.id);

  return {
    id: seed.id,
    title: seed.title,
    category: seed.category,
    venue: seed.venue,
    area: seed.area,
    city: seed.city,
    location: jittered,
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    cover: `https://picsum.photos/seed/${seed.id}/640/360`,
    description: seed.description,
    attendeeIds: seed.attendeeIds,
  };
}

const timisoaraFull: Seed[] = TIMISOARA_SEEDS.map((s) => {
  const a = area(s.area);
  return { ...s, lat: a.lat, lng: a.lng, city: 'Timișoara' };
});

const otherFull: Seed[] = OTHER_CITY_SEEDS.map((s) => {
  const c = city(s.city);
  return { ...s, lat: c.lat, lng: c.lng, area: c.label, city: c.label };
});

export const events: CommunityEvent[] = [...timisoaraFull, ...otherFull].map(materialize);
