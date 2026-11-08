import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import PlatformLogo from './PlatformLogo.jsx';
import { platformsFor, matchesPlatform } from '../../lib/demo/platforms.js';
export default function AutofillDemo({ unlocked, items, onUnlock, onCreate }) {
  const [platform, setPlatform] = useState(null),
    [username, setUsername] = useState(''),
    [password, setPassword] = useState(''),
    [show, setShow] = useState(false),
    [suggestions, setSuggestions] = useState(false),
    [message, setMessage] = useState(''),
    [signedIn, setSignedIn] = useState(false);
  const platforms = platformsFor(items),
    matches = platform ? items.filter((i) => matchesPlatform(i, platform)) : [];
  function clear() {
    setUsername('');
    setPassword('');
    setShow(false);
    setMessage('');
    setSignedIn(false);
    setSuggestions(false);
  }
  useEffect(() => {
    if (!unlocked) {
      setUsername('');
      setPassword('');
      setShow(false);
      setMessage('');
      setSignedIn(false);
      setSuggestions(false);
    }
  }, [unlocked]);
  function fill(item) {
    setUsername(item.values.Username);
    setPassword(item.values.Password);
    setShow(false);
    setMessage('Filled from your unlocked vault.');
    setSuggestions(false);
    setSignedIn(false);
  }
  function open(p) {
    clear();
    setPlatform(p);
    const found = items.filter((i) => matchesPlatform(i, p));
    if (unlocked && found.length === 1) fill(found[0]);
    else if (unlocked && found.length > 1) setSuggestions(true);
  }
  return (
    <div className="platform-demo">
      <div className="platform-intro">
        <span className="demo-pill">
          <ShieldCheck size={15} /> Interactive practice
        </span>
        <h2>Your logins. Ready when you need them.</h2>
        <p>
          Choose a platform to try signing in with a matching login from your
          vault.
        </p>
        <p className="fine">
          These are local practice screens. Credentials stay in this app; no
          real website is opened.
        </p>
      </div>
      {!platform ? (
        <div className="platform-grid">
          {platforms.map((p) => {
            const count = unlocked
              ? items.filter((i) => matchesPlatform(i, p)).length
              : 0;
            return (
              <button
                className="platform-card"
                key={p.host}
                onClick={() => open(p)}
              >
                <PlatformLogo platform={p} />
                <b>{p.name}</b>
                <span className="platform-domain">{p.host}</span>
                <span
                  className={'platform-count ' + (count ? 'available' : '')}
                >
                  {!unlocked
                    ? 'Unlock to find logins'
                    : count
                      ? `${count} saved login${count === 1 ? '' : 's'}`
                      : 'Add a login to try'}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <section className="platform-browser">
          <div className="platform-browser-bar">
            <button
              onClick={() => {
                clear();
                setPlatform(null);
              }}
            >
              <ArrowLeft size={17} /> All platforms
            </button>
            <span>
              <LockKeyhole size={14} />
              {platform.host}
              <span className="practice-label">Practice</span>
            </span>
          </div>
          <div className="platform-login-area">
            <div className="platform-login-card">
              <PlatformLogo platform={platform} />
              <h2>
                {signedIn
                  ? 'Welcome, ' + username
                  : 'Sign in to ' + platform.name}
              </h2>
              {signedIn ? (
                <>
                  <p className="platform-success" role="status">
                    <Check size={20} /> Demo complete. No account was
                    authenticated and no credentials were sent.
                  </p>
                  <button className="primary" onClick={clear}>
                    Try again
                  </button>
                </>
              ) : (
                <>
                  <p className="platform-login-subtitle">
                    Use your saved account to continue
                  </p>
                  <form
                    autoComplete="off"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSuggestions(false);
                      setSignedIn(true);
                    }}
                  >
                    <label>
                      Username
                      <div className="platform-field">
                        <input
                          aria-label="Demo username"
                          required
                          autoComplete="off"
                          value={username}
                          onFocus={() => setSuggestions(true)}
                          onChange={(e) => {
                            setUsername(e.target.value);
                            setMessage('');
                          }}
                        />
                        <button
                          type="button"
                          className="vault-field-button"
                          aria-label="Show saved logins"
                          aria-expanded={suggestions}
                          aria-controls="vault-suggestions"
                          onClick={() => setSuggestions(!suggestions)}
                        >
                          <KeyRound size={19} />
                          <ChevronDown size={12} />
                        </button>
                      </div>
                    </label>
                    {suggestions && (
                      <div id="vault-suggestions" className="vault-suggestions">
                        <div className="suggestion-heading">
                          <ShieldCheck size={16} /> Password Manager
                          <button
                            type="button"
                            aria-label="Close saved logins"
                            onClick={() => setSuggestions(false)}
                          >
                            ×
                          </button>
                        </div>
                        {!unlocked ? (
                          <button type="button" onClick={onUnlock}>
                            <LockKeyhole size={18} />
                            Unlock vault
                          </button>
                        ) : matches.length ? (
                          matches.map((item) => (
                            <button
                              type="button"
                              key={item.id}
                              aria-label={'Use ' + item.values.Username}
                              onClick={() => fill(item)}
                            >
                              <span className="suggestion-key">
                                <KeyRound size={18} />
                              </span>
                              <span>
                                <b>{item.values.Username}</b>
                                <small>
                                  {item.values.Title} · {platform.host}
                                </small>
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="no-match">
                            <p>No saved login matches {platform.host}.</p>
                            <button
                              type="button"
                              onClick={() =>
                                onCreate('https://' + platform.host)
                              }
                            >
                              Add a login
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    <label>
                      Password
                      <div className="platform-field">
                        <input
                          aria-label="Demo password"
                          type={show ? 'text' : 'password'}
                          value={password}
                          required
                          autoComplete="off"
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setMessage('');
                          }}
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
                    <button
                      className="primary platform-signin"
                      disabled={!unlocked}
                    >
                      Sign in (demo)
                    </button>
                  </form>
                  {message && (
                    <p className="platform-filled" role="status">
                      <Check size={16} />
                      {message}
                    </p>
                  )}
                  <div className="platform-login-actions">
                    <button onClick={clear}>Clear form</button>
                    {!unlocked ? (
                      <button onClick={onUnlock}>Unlock vault</button>
                    ) : !matches.length ? (
                      <button
                        onClick={() => onCreate('https://' + platform.host)}
                      >
                        Add a login
                      </button>
                    ) : (
                      <span>
                        <ShieldCheck size={14} /> {matches.length} matching
                        login{matches.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
