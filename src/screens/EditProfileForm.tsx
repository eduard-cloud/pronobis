import { useState } from 'react';
import { usePeople } from '../data/store';
import { generateInitialsAvatar } from '../data/avatar';
import { INTEREST_PRESETS } from '../data/interests';
import { LocationPicker } from '../components/LocationPicker';
import { Chip } from '../components/Chip';
import { Avatar } from '../components/Avatar';
import { processPhotoFile } from '../utils/photo';
import type { Person, Relation } from '../types';
import './EditProfileForm.css';

type Props = {
  personId: string;
  onClose: () => void;
};

type FamilyDraft = {
  photo: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  relation: Relation;
};

function emptyFamilyDraft(): FamilyDraft {
  return { photo: '', firstName: '', lastName: '', birthDate: '', relation: 'adult' };
}

export function EditProfileForm({ personId, onClose }: Props) {
  const { people, households, upsertPerson, addHouseholdMember } = usePeople();
  const person = people.find((p) => p.id === personId);
  const household = households.find((h) => h.id === person?.householdId);

  const [photo, setPhoto] = useState(person?.photo ?? '');
  const [firstName, setFirstName] = useState(person?.firstName ?? '');
  const [lastName, setLastName] = useState(person?.lastName ?? '');
  const [birthDate, setBirthDate] = useState(person?.birthDate ?? '');
  const [memberSince, setMemberSince] = useState(person?.memberSince ?? '');
  const [location, setLocation] = useState(
    person?.location ?? { lat: 45.9432, lng: 24.9668, label: '' }
  );
  const [bio, setBio] = useState(person?.bio ?? '');
  const [interests, setInterests] = useState<string[]>(person?.interests ?? []);
  const [customInterest, setCustomInterest] = useState('');

  const [addingFamily, setAddingFamily] = useState(false);
  const [familyDraft, setFamilyDraft] = useState<FamilyDraft>(emptyFamilyDraft);

  if (!person) return null;

  function toggleInterest(name: string) {
    setInterests((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  }

  async function handlePhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(await processPhotoFile(file));
  }

  async function handleFamilyPhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await processPhotoFile(file);
    setFamilyDraft((d) => ({ ...d, photo: dataUrl }));
  }

  function handleSave() {
    if (!person) return;
    const updated: Person = {
      ...person,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      photo: photo || generateInitialsAvatar(firstName, lastName, person.id),
      birthDate,
      memberSince,
      location,
      bio: bio.trim(),
      interests,
    };
    upsertPerson(updated);
    onClose();
  }

  function handleAddFamilyMember() {
    if (!household) return;
    if (!familyDraft.firstName.trim() || !familyDraft.lastName.trim() || !familyDraft.birthDate) return;
    const id = `p-${Date.now()}`;
    const newPerson: Person = {
      id,
      firstName: familyDraft.firstName.trim(),
      lastName: familyDraft.lastName.trim(),
      photo:
        familyDraft.photo ||
        generateInitialsAvatar(familyDraft.firstName, familyDraft.lastName, id),
      birthDate: familyDraft.birthDate,
      memberSince,
      bio: '',
      interests: [],
      relation: familyDraft.relation,
      householdId: household.id,
      location,
    };
    addHouseholdMember(household.id, newPerson);
    setFamilyDraft(emptyFamilyDraft());
    setAddingFamily(false);
  }

  const otherMembers = (household?.memberIds ?? [])
    .filter((id) => id !== person.id)
    .map((id) => people.find((p) => p.id === id))
    .filter((p): p is Person => Boolean(p));

  return (
    <div className="edit-profile-overlay" onClick={onClose}>
      <div className="edit-profile" onClick={(e) => e.stopPropagation()}>
        <div className="edit-profile__header">
          <h2 className="t-title edit-profile__heading">Edit profile</h2>
          <button type="button" className="edit-profile__close" onClick={onClose}>
            Done
          </button>
        </div>

        <div className="edit-profile__scroll">
          <label className="onboarding__photo-picker edit-profile__photo-picker">
            {photo ? (
              <img src={photo} alt="" className="onboarding__photo-preview" />
            ) : (
              <span className="onboarding__photo-placeholder">+</span>
            )}
            <input type="file" accept="image/*" onChange={handlePhotoFile} hidden />
          </label>

          <input
            className="onboarding__input t-body"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            className="onboarding__input t-body"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <label className="t-caption onboarding__label">Date of birth</label>
          <input
            className="onboarding__input t-body"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />

          <label className="t-caption onboarding__label">In ProNobis since</label>
          <input
            className="onboarding__input t-body"
            type="month"
            value={memberSince}
            onChange={(e) => setMemberSince(e.target.value)}
          />

          <label className="t-caption onboarding__label">Home</label>
          <LocationPicker
            value={location}
            label={location.label}
            onChange={(v) => setLocation((l) => ({ ...l, ...v }))}
            onLabelChange={(label) => setLocation((l) => ({ ...l, label }))}
          />

          <label className="t-caption onboarding__label">About</label>
          <textarea
            className="onboarding__textarea t-body"
            placeholder="Short description"
            maxLength={220}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <div className="onboarding__chip-grid">
            {INTEREST_PRESETS.map((name) => (
              <Chip
                key={name}
                variant="outline"
                selected={interests.includes(name)}
                onClick={() => toggleInterest(name)}
              >
                {name}
              </Chip>
            ))}
            {interests
              .filter((i) => !INTEREST_PRESETS.includes(i))
              .map((name) => (
                <Chip key={name} variant="outline" selected onClick={() => toggleInterest(name)}>
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
                  if (customInterest.trim()) {
                    toggleInterest(customInterest.trim());
                    setCustomInterest('');
                  }
                }
              }}
            />
            <button
              type="button"
              className="onboarding__add-btn"
              onClick={() => {
                if (customInterest.trim()) {
                  toggleInterest(customInterest.trim());
                  setCustomInterest('');
                }
              }}
            >
              Add
            </button>
          </div>

          {household && (
            <>
              <label className="t-caption onboarding__label">Household</label>
              {otherMembers.length > 0 && (
                <ul className="edit-profile__family-list">
                  {otherMembers.map((m) => (
                    <li key={m.id} className="edit-profile__family-item">
                      <Avatar src={m.photo} alt={m.firstName} size={36} />
                      <span className="t-body">
                        {m.firstName} {m.lastName}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {addingFamily ? (
                <div className="onboarding__family-form">
                  <label className="onboarding__photo-picker onboarding__photo-picker--small">
                    {familyDraft.photo ? (
                      <img src={familyDraft.photo} alt="" className="onboarding__photo-preview" />
                    ) : (
                      <span className="onboarding__photo-placeholder">+</span>
                    )}
                    <input type="file" accept="image/*" onChange={handleFamilyPhotoFile} hidden />
                  </label>
                  <input
                    className="onboarding__input t-body"
                    placeholder="First name"
                    value={familyDraft.firstName}
                    onChange={(e) => setFamilyDraft((d) => ({ ...d, firstName: e.target.value }))}
                  />
                  <input
                    className="onboarding__input t-body"
                    placeholder="Last name"
                    value={familyDraft.lastName}
                    onChange={(e) => setFamilyDraft((d) => ({ ...d, lastName: e.target.value }))}
                  />
                  <input
                    className="onboarding__input t-body"
                    type="date"
                    value={familyDraft.birthDate}
                    onChange={(e) => setFamilyDraft((d) => ({ ...d, birthDate: e.target.value }))}
                  />
                  <div className="onboarding__relation-toggle">
                    <button
                      type="button"
                      className={
                        'chip chip--outline' +
                        (familyDraft.relation === 'adult' ? ' chip--selected' : '')
                      }
                      onClick={() => setFamilyDraft((d) => ({ ...d, relation: 'adult' }))}
                    >
                      Adult
                    </button>
                    <button
                      type="button"
                      className={
                        'chip chip--outline' +
                        (familyDraft.relation === 'child' ? ' chip--selected' : '')
                      }
                      onClick={() => setFamilyDraft((d) => ({ ...d, relation: 'child' }))}
                    >
                      Child
                    </button>
                  </div>
                  <button type="button" className="onboarding__next" onClick={handleAddFamilyMember}>
                    Add to household
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="onboarding__back-btn"
                  onClick={() => setAddingFamily(true)}
                >
                  + Add family member
                </button>
              )}
            </>
          )}

          <button type="button" className="edit-profile__save" onClick={handleSave}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
