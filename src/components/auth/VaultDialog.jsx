import React from 'react';
import { X, LockKeyhole } from 'lucide-react';
import { SetupForm, UnlockForm } from './Setup.jsx';

export default function VaultDialog({
  modal,
  setModal,
  busy,
  setBusy,
  record,
  ready,
  error,
  enter,
  persist,
  data,
  draft,
  setDraft,
  notify,
}) {
  return (
    <>
      {modal && modal !== 'setup-complete' && (
        <div
          className={'overlay ' + (modal === 'unlock' ? 'auth-overlay' : '')}
          onClick={() => !busy && setModal(null)}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              aria-label="Close dialog"
              onClick={() => setModal(null)}
            >
              <X />
            </button>
            <LockKeyhole className="modal-lock" size={65} />
            <h2 id="modal-title">
              {modal === 'encryption'
                ? 'Your Data is Encrypted'
                : modal === 'delete'
                  ? 'Delete this item?'
                  : record
                    ? 'Unlock your vault'
                    : 'Set up your local vault'}
            </h2>
            {modal === 'encryption' ? (
              <>
                <p>
                  Your vault is encrypted with AES-256-GCM using a key derived
                  from your master password.
                </p>
                <p>
                  Encrypted data is stored locally in this browser. Your master
                  password is never saved. While unlocked, your data is
                  available to this app.
                </p>
                <button className="primary" onClick={() => setModal(null)}>
                  Close
                </button>
              </>
            ) : modal === 'delete' ? (
              <>
                <p>This permanently removes the item from this local vault.</p>
                <button
                  className="danger"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await persist({
                        ...data,
                        items: data.items.filter((i) => i.id !== draft.id),
                      });
                      setDraft(null);
                      setModal(null);
                      notify('Item deleted');
                    } catch {
                      notify('Deletion failed');
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Delete item
                </button>
              </>
            ) : record && ready ? (
              <UnlockForm onSubmit={enter} busy={busy} error={error} />
            ) : !record && ready ? (
              <SetupForm onSubmit={enter} busy={busy} error={error} />
            ) : (
              <form onSubmit={enter}>
                {!ready ? (
                  <p>Loading local storage…</p>
                ) : (
                  <>
                    {!record && (
                      <>
                        <p>
                          This creates a local profile, with no online Avast
                          account or cloud sync.
                        </p>
                        <label>
                          Email
                          <input
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                          />
                        </label>
                      </>
                    )}
                    <label>
                      Master password
                      <input
                        name="master"
                        type="password"
                        minLength={record ? 1 : 12}
                        required
                        autoComplete={
                          record ? 'current-password' : 'new-password'
                        }
                      />
                    </label>
                    {!record && (
                      <>
                        <label>
                          Confirm master password
                          <input
                            name="confirm"
                            type="password"
                            minLength="12"
                            required
                            autoComplete="new-password"
                          />
                        </label>
                        <p className="fine">
                          Use at least 12 characters. There is no password
                          recovery. Keep your master password safe.
                        </p>
                      </>
                    )}
                    {error && (
                      <p className="error" role="alert">
                        {error}
                      </p>
                    )}
                    <button className="primary" disabled={busy}>
                      {busy
                        ? 'Please wait…'
                        : record
                          ? 'Unlock vault'
                          : 'Create encrypted vault'}
                    </button>
                  </>
                )}
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
