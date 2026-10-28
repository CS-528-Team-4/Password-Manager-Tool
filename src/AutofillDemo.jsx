import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
  Check,
  ShieldCheck,
} from 'lucide-react';
export default function AutofillDemo({ unlocked, items, onUnlock, onCreate }) {
  const [selected, setSelected] = useState(''),
    [username, setUsername] = useState(''),
    [password, setPassword] = useState(''),
    [show, setShow] = useState(false),
    [message, setMessage] = useState('');
  const logins = items.filter(
    (i) => i.type === 'Logins' && i.values.Username && i.values.Password,
  );
  function clear() {
    setUsername('');
    setPassword('');
    setShow(false);
    setMessage('');
  }
  function fill() {
    const item = logins.find((i) => i.id === selected);
    if (!item) return;
    setUsername(item.values.Username);
    setPassword(item.values.Password);
    setShow(false);
    setMessage('Filled from your unlocked vault.');
  }
  return (
    <div className="autofill-demo">
      <section className="demo-controls">
        <ShieldCheck size={32} />
        <h2>Try filling a saved login</h2>
        <p>
          Select a login from your vault, then fill the practice form. Nothing
          is sent to a website or server.
        </p>
        {!unlocked ? (
          <button className="primary" onClick={onUnlock}>
            Unlock vault
          </button>
        ) : !logins.length ? (
          <>
            <p>Add a login with a username and password to try this demo.</p>
            <button className="primary" onClick={onCreate}>
              Add a login
            </button>
          </>
        ) : (
          <>
            <label>
              Saved login
              <select
                aria-label="Saved login"
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                  clear();
                }}
              >
                <option value="">Choose a saved login</option>
                {logins.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.values.Title}
                    {i.values.Website ? ' · ' + i.values.Website : ''}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary" disabled={!selected} onClick={fill}>
              Autofill demo form
            </button>
            <button onClick={clear}>Clear form</button>
          </>
        )}
        <p className="fine">
          This demonstrates filling a form within our app. Browser-wide autofill
          requires a separate extension.
        </p>
      </section>
      <section className="demo-site">
        <div className="demo-site-bar">
          <LockKeyhole size={15} /> Practice form · Local demo
        </div>
        <div className="demo-login">
          <span className="demo-avatar">
            <UserRound size={30} />
          </span>
          <h2>Welcome back</h2>
          <p>Sign in to the practice portal</p>
          <form
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();
              setMessage(
                'Demo complete. No account was authenticated and no credentials were sent.',
              );
            }}
          >
            <label>
              Username
              <input
                aria-label="Demo username"
                value={username}
                required
                onChange={(e) => {
                  setUsername(e.target.value);
                  setMessage('');
                }}
                autoComplete="off"
              />
            </label>
            <label>
              Password
              <div className="demo-secret">
                <input
                  aria-label="Demo password"
                  type={show ? 'text' : 'password'}
                  value={password}
                  required
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setMessage('');
                  }}
                  autoComplete="off"
                />
                <button
                  type="button"
                  aria-label={
                    show ? 'Hide demo password' : 'Show demo password'
                  }
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>
            <button className="primary" disabled={!unlocked}>
              Sign in (demo)
            </button>
          </form>
          {message && (
            <p className="demo-status" role="status">
              <Check size={18} />
              {message}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
