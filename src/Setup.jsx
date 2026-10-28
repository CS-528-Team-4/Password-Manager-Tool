import React, { useState } from 'react';
import { ArrowLeft, Check, Eye, EyeOff, X } from 'lucide-react';
export function SetupForm({ onSubmit, busy, error }) {
  const [stage, setStage] = useState('profile'),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [confirm, setConfirm] = useState(''),
    [show, setShow] = useState(false),
    [unique, setUnique] = useState(false),
    [confirming, setConfirming] = useState(false);
  const rules = [
    ['At least 12 characters', password.length >= 12],
    ['Uppercase letters (e.g. ABC)', /[A-Z]/.test(password)],
    ['Lowercase letters (e.g. abc)', /[a-z]/.test(password)],
    ['Digits (e.g. 345)', /[0-9]/.test(password)],
  ];
  const valid = rules.every(([, ok]) => ok) && unique;
  return (
    <div className="setup-form">
      <div className="setup-title">
        {stage !== 'profile' && (
          <button
            type="button"
            aria-label="Back to profile"
            onClick={() =>
              confirming ? setConfirming(false) : setStage('profile')
            }
          >
            <ArrowLeft />
          </button>
        )}
        <h2>
          {stage === 'profile'
            ? 'Create your local profile'
            : confirming
              ? 'Confirm your vault password'
              : 'Create your vault password'}
        </h2>
      </div>
      {stage === 'profile' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStage('password');
          }}
        >
          <p>
            Start with your email, then create a password to protect your vault
            on this device.
          </p>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <p className="fine">
            This is a local profile. No Avast account is created, and no email
            is sent.
          </p>
          <button className="primary setup-continue">Continue</button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            if (!confirming) {
              e.preventDefault();
              setConfirming(true);
            } else {
              onSubmit(e);
            }
          }}
        >
          <input type="hidden" name="email" value={email} />
          <div
            className={
              confirming
                ? 'setup-create-content hidden-step'
                : 'setup-create-content'
            }
          >
            <label htmlFor="master-new">Enter Vault Password</label>
            <div className="setup-password">
              <input
                id="master-new"
                name="master"
                aria-label="Master password"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                minLength="12"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                aria-label={
                  show ? 'Hide master password' : 'Show master password'
                }
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff /> : <Eye />}
              </button>
            </div>
            <div className="setup-strength">
              <span
                style={{
                  width: `${rules.filter(([, ok]) => ok).length * 25}%`,
                }}
              />
            </div>
            <ul className="requirements">
              {rules.map(([text, ok]) => (
                <li key={text} className={ok ? 'met' : ''}>
                  <Check size={16} />
                  {text}
                </li>
              ))}
            </ul>
            <label className="check uniqueness">
              <input
                type="checkbox"
                aria-label="I use a different password for other accounts"
                checked={unique}
                onChange={(e) => setUnique(e.target.checked)}
                required
              />
              Differs from other accounts
            </label>
          </div>
          <label className={confirming ? '' : 'hidden-step'}>
            Confirm master password
            <input
              name="confirm"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              required={confirming}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>
          {confirm && confirm !== password && (
            <p className="error">Passwords do not match.</p>
          )}
          {!confirming && (
            <p className="setup-reminder">
              As only you'll know your vault password, try your best to remember
              it.
            </p>
          )}
          <p className="fine">Your password cannot be recovered.</p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button
            className="primary setup-continue"
            disabled={busy || !valid || (confirming && confirm !== password)}
          >
            {busy ? 'Creating vault…' : 'Continue'}
          </button>
        </form>
      )}
    </div>
  );
}
export function SetupComplete({ onClose }) {
  const [details, setDetails] = useState(false);
  return (
    <section
      className="modal setup-complete"
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-complete-title"
    >
      <button className="close" aria-label="Close setup" onClick={onClose}>
        <X />
      </button>
      <h2 id="setup-complete-title">Great!</h2>
      <p className="setup-subtitle">You're almost there</p>
      <ol className="setup-steps">
        {[
          ['Local profile', 'Created on this device', true],
          ['Vault Setup', 'Vault password created', true],
          ['Biometric unlock', 'Requires authenticator integration', false],
          ['Notifications', 'In-app confirmations available', false],
          ['Autofill apps', 'Requires a browser extension', false],
        ].map(([title, description, done], i) => (
          <li key={title}>
            <span className={'step-circle ' + (done ? 'done' : '')}>
              {done ? <Check size={27} /> : i + 1}
            </span>
            <div>
              <b>{title}</b>
              {(done || details) && (
                <p className={done ? 'done-text' : ''}>{description}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
      {details ? (
        <>
          <p className="fine">
            Your local vault is ready. Biometric unlock and app autofill are not
            available in this version.
          </p>
          <button className="primary setup-continue" onClick={onClose}>
            Open my vault
          </button>
        </>
      ) : (
        <>
          <button
            className="primary setup-continue"
            onClick={() => setDetails(true)}
          >
            Continue Setup
          </button>
          <button className="remind" onClick={onClose}>
            Remind Me Later
          </button>
        </>
      )}
    </section>
  );
}
export function UnlockForm({ onSubmit, busy, error }) {
  const [show, setShow] = useState(false);
  return (
    <div className="setup-form unlock-form">
      <div className="setup-title">
        <h2>Unlock your vault</h2>
      </div>
      <p className="unlock-description">
        Enter your vault password to access your saved information.
      </p>
      <form onSubmit={onSubmit}>
        <label htmlFor="master-unlock">Vault password</label>
        <div className="setup-password">
          <input
            id="master-unlock"
            aria-label="Master password"
            name="master"
            type={show ? 'text' : 'password'}
            required
            autoComplete="current-password"
            autoFocus
          />
          <button
            type="button"
            aria-label={show ? 'Hide master password' : 'Show master password'}
            onClick={() => setShow(!show)}
          >
            {show ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button className="primary setup-continue" disabled={busy}>
          {busy ? 'Unlocking…' : 'Unlock vault'}
        </button>
        <p className="fine">Your vault is stored securely on this device.</p>
      </form>
    </div>
  );
}
