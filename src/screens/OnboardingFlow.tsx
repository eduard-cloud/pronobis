import { useState } from 'react';
import { usePeople } from '../data/store';
import { generateInitialsAvatar } from '../data/avatar';
import { INTEREST_PRESETS } from '../data/interests';
import { LocationPicker } from '../components/LocationPicker';
import { Chip } from '../components/Chip';
import { processPhotoFile } from '../utils/photo';
import { TIMISOARA_CENTER } from '../data/timisoaraAreas';
import type { Household, Person, Relation } from '../types';
import './OnboardingFlow.css';

type Props = {
  onComplete: () => void;
};

const STEPS = ['photo', 'identity', 'since', 'location', 'about', 'family'] as const;
type Step = (typeof STEPS)[number];

const DEFAULT_LOCATION = { ...TIMISOARA_CENTER, label: '' };

type FamilyDraft = {
  id: string;
  photo: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  relation: Relation;
};

function makeEmptyFamilyDraft(): FamilyDraft {
  return {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    photo: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    relation: 'adult',
  };
}

export function OnboardingFlow({ onComplete }: Props) {
  const { completeOnboarding } = usePeople();
  const [stepIndex, setStepIndex] = useState(0);
  const step: Step = STEPS[stepIndex];

  const [photo, setPhoto] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [memberSince, setMemberSince] = useState('');
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [family, setFamily] = useState<FamilyDraft[]>([]);

  function next() {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }
  function back() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function toggleInterest(name: string) {
    setInterests((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  }

  function finish() {
    const householdId = `h-${Date.now()}`;
    const selfId = `p-${Date.now()}`;
    const self: Person = {
      id: selfId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      photo: photo || generateInitialsAvatar(firstName, lastName, selfId),
      birthDate,
      memberSince,
      bio: bio.trim(),
      interests,
      relation: 'adult',
      householdId,
      location,
    };
    const familyPeople: Person[] = family.map((f) => ({
      id: f.id,
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      photo: f.photo || generateInitialsAvatar(f.firstName, f.lastName, f.id),
      birthDate: f.birthDate,
      memberSince,
      bio: '',
      interests: [],
      relation: f.relation,
      householdId,
      location,
    }));
    const household: Household = {
      id: householdId,
      label: lastName.trim() || firstName.trim(),
      memberIds: [selfId, ...family.map((f) => f.id)],
    };
    completeOnboarding(household, [self, ...familyPeople]);
    onComplete();
  }

  const canProceed = (() => {
    switch (step) {
      case 'identity':
        return Boolean(firstName.trim() && lastName.trim() && birthDate);
      case 'since':
        return Boolean(memberSince);
      case 'location':
        return Boolean(location.label.trim());
      default:
        return true;
    }
  })();

  return (
    <div className="onboarding">
      <div className="onboarding__ticker">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={
              'onboarding__tick' + (i <= stepIndex ? ' onboarding__tick--active' : '')
            }
          />
        ))}
      </div>

      <div className="onboarding__card">
        {step === 'photo' && <PhotoStep photo={photo} onPhoto={setPhoto} />}
        {step === 'identity' && (
          <IdentityStep
            firstName={firstName}
            lastName={lastName}
            birthDate={birthDate}
            onFirstName={setFirstName}
            onLastName={setLastName}
            onBirthDate={setBirthDate}
          />
        )}
        {step === 'since' && <SinceStep memberSince={memberSince} onChange={setMemberSince} />}
        {step === 'location' && (
          <div className="onboarding__step">
            <h2 className="t-large-title onboarding__title">
              Where's <span className="onboarding__title-accent">home</span>?
            </h2>
            <LocationPicker
              value={location}
              label={location.label}
              onChange={(v) => setLocation((l) => ({ ...l, ...v }))}
              onLabelChange={(label) => setLocation((l) => ({ ...l, label }))}
            />
          </div>
        )}
        {step === 'about' && (
          <AboutStep bio={bio} onBio={setBio} interests={interests} onToggle={toggleInterest} />
        )}
        {step === 'family' && (
          <FamilyStep family={family} onChange={setFamily} onFinish={finish} />
        )}
      </div>

      <div className="onboarding__nav">
        {stepIndex > 0 && (
          <button type="button" className="onboarding__back-btn" onClick={back}>
            Back
          </button>
        )}
        {step !== 'family' && (
          <button
            type="button"
            className="onboarding__next"
            disabled={!canProceed}
            onClick={next}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

function PhotoStep({ photo, onPhoto }: { photo: string; onPhoto: (v: string) => void }) {
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await processPhotoFile(file);
    onPhoto(dataUrl);
  }

  return (
    <div className="onboarding__step onboarding__step--center">
      <h2 className="t-large-title onboarding__title">
        Add a <span className="onboarding__title-accent">photo</span>
      </h2>
      <p className="t-body onboarding__hint">So people can put a face to your name.</p>
      <label className="onboarding__photo-picker">
        {photo ? (
          <img src={photo} alt="Your photo" className="onboarding__photo-preview" />
        ) : (
          <span className="onboarding__photo-placeholder">+</span>
        )}
        <input type="file" accept="image/*" onChange={handleFile} hidden />
      </label>
    </div>
  );
}

function IdentityStep({
  firstName,
  lastName,
  birthDate,
  onFirstName,
  onLastName,
  onBirthDate,
}: {
  firstName: string;
  lastName: string;
  birthDate: string;
  onFirstName: (v: string) => void;
  onLastName: (v: string) => void;
  onBirthDate: (v: string) => void;
}) {
  return (
    <div className="onboarding__step">
      <h2 className="t-large-title onboarding__title">
        What's your <span className="onboarding__title-accent">name</span>?
      </h2>
      <input
        className="onboarding__input t-body"
        placeholder="First name"
        value={firstName}
        onChange={(e) => onFirstName(e.target.value)}
      />
      <input
        className="onboarding__input t-body"
        placeholder="Last name"
        value={lastName}
        onChange={(e) => onLastName(e.target.value)}
      />
      <label className="t-caption onboarding__label">Date of birth</label>
      <input
        className="onboarding__input t-body"
        type="date"
        value={birthDate}
        onChange={(e) => onBirthDate(e.target.value)}
      />
    </div>
  );
}

function SinceStep({
  memberSince,
  onChange,
}: {
  memberSince: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="onboarding__step">
      <h2 className="t-large-title onboarding__title">
        In ProNobis <span className="onboarding__title-accent">since</span>
      </h2>
      <input
        className="onboarding__input t-body"
        type="month"
        value={memberSince}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function AboutStep({
  bio,
  onBio,
  interests,
  onToggle,
}: {
  bio: string;
  onBio: (v: string) => void;
  interests: string[];
  onToggle: (name: string) => void;
}) {
  const [customInterest, setCustomInterest] = useState('');
  const extraInterests = interests.filter((i) => !INTEREST_PRESETS.includes(i));

  function addCustom() {
    const trimmed = customInterest.trim();
    if (trimmed) {
      onToggle(trimmed);
      setCustomInterest('');
    }
  }

  return (
    <div className="onboarding__step">
      <h2 className="t-large-title onboarding__title">
        A little <span className="onboarding__title-accent">about you</span>
      </h2>
      <textarea
        className="onboarding__textarea t-body"
        placeholder="Short description"
        maxLength={220}
        value={bio}
        onChange={(e) => onBio(e.target.value)}
      />
      <div className="onboarding__chip-grid">
        {INTEREST_PRESETS.map((name) => (
          <Chip
            key={name}
            variant="outline"
            selected={interests.includes(name)}
            onClick={() => onToggle(name)}
          >
            {name}
          </Chip>
        ))}
        {extraInterests.map((name) => (
          <Chip key={name} variant="outline" selected onClick={() => onToggle(name)}>
            {name}
          </Chip>
        ))}
      </div>
      <div className="onboarding__custom-interest">
        <input
          className="onboarding__input t-body"
          placeholder="Add your own"
          value={customInterest}
          onChange={(e) => setCustomInterest(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustom();
            }
          }}
        />
        <button type="button" className="onboarding__add-btn" onClick={addCustom}>
          Add
        </button>
      </div>
    </div>
  );
}

function FamilyStep({
  family,
  onChange,
  onFinish,
}: {
  family: FamilyDraft[];
  onChange: (v: FamilyDraft[]) => void;
  onFinish: () => void;
}) {
  const [adding, setAdding] = useState(family.length === 0);
  const [draft, setDraft] = useState<FamilyDraft>(makeEmptyFamilyDraft);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await processPhotoFile(file);
    setDraft((d) => ({ ...d, photo: dataUrl }));
  }

  function addMember() {
    if (!draft.firstName.trim() || !draft.lastName.trim() || !draft.birthDate) return;
    onChange([...family, draft]);
    setDraft(makeEmptyFamilyDraft());
    setAdding(false);
  }

  return (
    <div className="onboarding__step">
      <h2 className="t-large-title onboarding__title">
        Add <span className="onboarding__title-accent">family?</span>
      </h2>
      <p className="t-body onboarding__hint">
        Spouse, kids — you can always add more later.
      </p>

      {family.length > 0 && (
        <ul className="onboarding__family-list">
          {family.map((f) => (
            <li key={f.id} className="onboarding__family-item">
              <span className="t-body">
                {f.firstName} {f.lastName}
              </span>
              <button
                type="button"
                className="onboarding__remove"
                onClick={() => onChange(family.filter((m) => m.id !== f.id))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <div className="onboarding__family-form">
          <label className="onboarding__photo-picker onboarding__photo-picker--small">
            {draft.photo ? (
              <img src={draft.photo} alt="" className="onboarding__photo-preview" />
            ) : (
              <span className="onboarding__photo-placeholder">+</span>
            )}
            <input type="file" accept="image/*" onChange={handleFile} hidden />
          </label>
          <input
            className="onboarding__input t-body"
            placeholder="First name"
            value={draft.firstName}
            onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))}
          />
          <input
            className="onboarding__input t-body"
            placeholder="Last name"
            value={draft.lastName}
            onChange={(e) => setDraft((d) => ({ ...d, lastName: e.target.value }))}
          />
          <input
            className="onboarding__input t-body"
            type="date"
            value={draft.birthDate}
            onChange={(e) => setDraft((d) => ({ ...d, birthDate: e.target.value }))}
          />
          <div className="onboarding__relation-toggle">
            <button
              type="button"
              className={
                'chip chip--outline' + (draft.relation === 'adult' ? ' chip--selected' : '')
              }
              onClick={() => setDraft((d) => ({ ...d, relation: 'adult' }))}
            >
              Adult
            </button>
            <button
              type="button"
              className={
                'chip chip--outline' + (draft.relation === 'child' ? ' chip--selected' : '')
              }
              onClick={() => setDraft((d) => ({ ...d, relation: 'child' }))}
            >
              Child
            </button>
          </div>
          <button type="button" className="onboarding__next" onClick={addMember}>
            Add to household
          </button>
        </div>
      ) : (
        <button type="button" className="onboarding__back-btn" onClick={() => setAdding(true)}>
          + Add another
        </button>
      )}

      <button type="button" className="onboarding__finish" onClick={onFinish}>
        {family.length > 0 ? 'Done' : 'Skip for now'}
      </button>
    </div>
  );
}
