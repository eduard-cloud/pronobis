import { useState } from 'react';
import { GATE_STORAGE_KEY, INVITE_CODE } from '../config';
import './GateScreen.css';

type Props = {
  onSuccess: () => void;
};

export function GateScreen({ onSuccess }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().toLowerCase() === INVITE_CODE.toLowerCase()) {
      localStorage.setItem(GATE_STORAGE_KEY, 'true');
      onSuccess();
    } else {
      setError(true);
    }
  }

  return (
    <div className="gate-screen">
      <div className="gate-screen__content">
        <h1 className="t-display gate-screen__title">
          ProNobis
          <br />
          <em>People</em>
        </h1>
        <p className="t-body gate-screen__subtitle">
          A small directory for a community that's grown fast. Enter your
          invite code to continue.
        </p>

        <form className="gate-screen__form" onSubmit={handleSubmit}>
          <input
            className="gate-screen__input t-body"
            type="text"
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="Invite code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(false);
            }}
          />
          {error && (
            <p className="t-caption gate-screen__error">
              That code didn't work — try again.
            </p>
          )}
          <button type="submit" className="gate-screen__submit">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
