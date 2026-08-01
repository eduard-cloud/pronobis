export function formatAge(birthDate: string): string {
  const today = new Date();
  const dob = new Date(birthDate);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return `${age} yrs`;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatBirthDate(birthDate: string): string {
  const d = new Date(birthDate);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatMemberSince(memberSince: string): string {
  const [year, month] = memberSince.split('-').map(Number);
  return `Since ${MONTHS[month - 1]} ${year}`;
}

export function formatMemberSinceYear(memberSince: string): string {
  const [year] = memberSince.split('-');
  return `Since ${year}`;
}
