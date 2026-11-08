import React from 'react';

export default function SettingsPage({
  unlocked,
  data,
  record,
  lock,
  setModal,
  busy,
  setBusy,
  persist,
  notify,
}) {
  return (
    <>
      <div className="settings">
        <h3>VAULT SECURITY</h3>
        <section>
          <div>
            <h2>
              {unlocked ? 'Vault is unlocked' : 'Set up your local vault'}
            </h2>
            <p>
              Create a master password to encrypt your saved items on this
              device.
            </p>
          </div>
          <button onClick={() => (unlocked ? lock() : setModal('unlock'))}>
            {unlocked ? 'Lock vault' : record ? 'Unlock vault' : 'Set up vault'}
          </button>
        </section>
        <section>
          <div>
            <h2>Automatic lock</h2>
            <p>
              Your vault locks after {data.settings?.lockMinutes || 5} minutes
              without keyboard or pointer activity.
            </p>
          </div>
          <label className="lock-setting">
            Lock after
            <select
              aria-label="Automatic lock duration"
              disabled={!unlocked || busy}
              value={data.settings?.lockMinutes || 5}
              onChange={async (e) => {
                const lockMinutes = Number(e.target.value);
                setBusy(true);
                try {
                  await persist({
                    ...data,
                    settings: { ...data.settings, lockMinutes },
                  });
                  notify('Automatic lock updated');
                } catch (e) {
                  notify(e.message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {[1, 5, 15, 30].map((n) => (
                <option key={n} value={n}>
                  {n} minute{n === 1 ? '' : 's'}
                </option>
              ))}
            </select>
          </label>
        </section>
        <h3>BROWSER INTEGRATION</h3>
        {['Biometric unlock', 'Browser autofill', 'Notifications'].map((t) => (
          <section key={t}>
            <div>
              <h2>{t}</h2>
              <p>
                {t === 'Biometric unlock'
                  ? 'Requires a separate authenticator integration.'
                  : t === 'Browser autofill'
                    ? 'Requires a browser extension to fill credentials on other websites.'
                    : 'This local version uses in-app confirmations.'}
              </p>
            </div>
            <span className="badge">Not enabled</span>
          </section>
        ))}
        <h3>ABOUT THIS PROJECT</h3>
        <p>
          Avast-inspired educational implementation by Team 4. Independent
          course project; not affiliated with Avast. Vault contents stay in this
          browser. Clearing site data removes the vault. The master password
          cannot be recovered.
        </p>
      </div>
    </>
  );
}
