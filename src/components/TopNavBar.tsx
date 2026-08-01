import { SFBellBadge } from 'sf-symbols-lib/monochrome';
import { usePeople } from '../data/store';
import { Avatar } from './Avatar';
import pronobisMark from '../assets/pronobis-mark.svg';
import './TopNavBar.css';

type Props = {
  onOpenSettings: () => void;
};

export function TopNavBar({ onOpenSettings }: Props) {
  const { people, currentUserId } = usePeople();
  const currentUser = people.find((p) => p.id === currentUserId);

  return (
    <div className="top-nav">
      <div className="top-nav__row">
        <div className="top-nav__chip top-nav__chip--icon top-nav__logo" aria-label="ProNobis">
          <img src={pronobisMark} alt="" className="top-nav__logo-mark" />
        </div>

        <div className="top-nav__spacer" />

        <div className="top-nav__chip top-nav__pill">
          {currentUser && (
            <Avatar
              src={currentUser.photo}
              alt={currentUser.firstName}
              size={36}
              onClick={onOpenSettings}
            />
          )}
          <button type="button" className="top-nav__bell" aria-label="Notifications">
            <SFBellBadge size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
