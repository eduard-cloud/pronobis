import { SFBellBadge } from 'sf-symbols-lib/monochrome';
import { AvatarMenu } from './AvatarMenu';
import pronobisMark from '../assets/pronobis-mark.svg';
import './TopNavBar.css';

type Props = {
  onEditProfile: () => void;
  onReset: () => void;
};

export function TopNavBar({ onEditProfile, onReset }: Props) {
  return (
    <div className="top-nav">
      <div className="top-nav__row">
        <div className="top-nav__chip top-nav__chip--icon top-nav__logo" aria-label="ProNobis">
          <img src={pronobisMark} alt="" className="top-nav__logo-mark" />
        </div>

        <div className="top-nav__spacer" />

        <div className="top-nav__chip top-nav__pill">
          <AvatarMenu onEditProfile={onEditProfile} onReset={onReset} size={36} />
          <div className="top-nav__divider" />
          <button type="button" className="top-nav__bell" aria-label="Notifications">
            <SFBellBadge size={19} />
          </button>
        </div>
      </div>
    </div>
  );
}
