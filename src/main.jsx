import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  KeyRound,
  Star,
  UserRound,
  Wallet,
  MapPin,
  FileText,
  Settings,
  SlidersHorizontal,
  Copy,
  RefreshCw,
  Plus,
  X,
  LockKeyhole,
  LogOut,
  Eye,
  EyeOff,
  Check,
  Search,
  Trash2,
  ShieldCheck,
  CreditCard,
  Landmark,
} from 'lucide-react';
import { defaults, generatePassword, entropy } from './generator.js';
import { deriveKey, seal, unseal, readVault, writeVault } from './vault.js';
import './style.css';
import Brand from './Brand.jsx';
import PasswordHelp from './PasswordHelp.jsx';
import { SetupForm, SetupComplete, UnlockForm } from './Setup.jsx';
const nav = [
  ['Favorites', Star],
  ['Logins', UserRound],
  ['Wallet', Wallet],
  ['Addresses', MapPin],
  ['Notes', FileText],
];
const fields = {
  Logins: ['Title', 'Website', 'Username', 'Password', 'Notes'],
  Wallet: [
    'Title',
    'Card number',
    'Expiration',
    'CVV/CVC',
    'Card PIN',
    'Cardholder',
    'Notes',
  ],
  Addresses: [
    'Title',
    'Full name',
    'Email',
    'Phone',
    'Street',
    'City',
    'State',
    'Postal code',
    'Country',
  ],
  Notes: ['Title', 'Notes'],
};
const accountFields = [
  'Title',
  'Account number',
  'Branch/Routing number',
  'Bank name',
  'Account owner',
  'Notes',
];
const sensitiveFields = [
  'Password',
  'Card number',
  'CVV/CVC',
  'Card PIN',
  'Account number',
];
function App() {
  const [page, setPage] = useState('Password Generator'),
    [options, setOptions] = useState(defaults),
    [password, setPassword] = useState(() => generatePassword(defaults)),
    [modal, setModal] = useState(null),
    [help, setHelp] = useState(null),
    [toast, setToast] = useState(''),
    [record, setRecord] = useState(null),
    [ready, setReady] = useState(false),
    [key, setKey] = useState(null),
    [data, setData] = useState({ email: '', items: [] }),
    [draft, setDraft] = useState(null),
    [query, setQuery] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [walletMenu, setWalletMenu] = useState(false),
    [visibleField, setVisibleField] = useState(null),
    [sortAscending, setSortAscending] = useState(true);
  const timer = useRef(),
    keyRef = useRef(null),
    savingRef = useRef(false),
    pendingGenerated = useRef(null);
  keyRef.current = key;
  useEffect(() => {
    if (!modal) pendingGenerated.current = null;
  }, [modal]);
  useEffect(() => {
    if (!modal && !help) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [modal, help]);
  useEffect(() => {
    if (!modal && !help) return;
    const previous = document.activeElement;
    const dialog = document.querySelector('[role="dialog"]');
    const selector =
      'button:not(:disabled),input:not(:disabled),textarea:not(:disabled),[tabindex="0"]';
    dialog?.querySelector(selector)?.focus();
    const trap = (e) => {
      if (e.key !== 'Tab' || !dialog) return;
      const list = [...dialog.querySelectorAll(selector)];
      const first = list[0],
        last = list.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', trap);
    return () => {
      document.removeEventListener('keydown', trap);
      previous?.focus();
    };
  }, [modal, help]);
  useEffect(() => {
    readVault()
      .then((r) => {
        setRecord(r);
        setReady(true);
        setModal('unlock');
      })
      .catch(() => {
        setError('Unable to open local storage. Check browser permissions.');
        setReady(true);
      });
  }, []);
  const notify = (t) => {
    setToast(t);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 3000);
  };
  const lock = () => {
    setKey(null);
    setData({ email: '', items: [] });
    setDraft(null);
    setModal(null);
    setWalletMenu(false);
    setVisibleField(null);
    setHelp(null);
    pendingGenerated.current = null;
    setPassword(generatePassword(defaults));
    notify('Vault locked');
  };
  useEffect(() => {
    if (!key) return;
    let timeout;
    const reset = () => {
      clearTimeout(timeout);
      timeout = setTimeout(lock, (data.settings?.lockMinutes || 5) * 60 * 1000);
    };
    reset();
    window.addEventListener('pointerdown', reset);
    window.addEventListener('keydown', reset);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('pointerdown', reset);
      window.removeEventListener('keydown', reset);
    };
  }, [key, data.settings?.lockMinutes]);
  useEffect(() => {
    const close = (e) => {
      if (e.key === 'Escape') {
        setModal(null);
        setDraft(null);
        setHelp(null);
        setWalletMenu(false);
      }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      notify('Copied to clipboard');
    } catch {
      notify('Clipboard unavailable. Select and copy the text manually.');
    }
  }
  function updateOptions(next) {
    setOptions(next);
    try {
      setPassword(generatePassword(next));
      setError('');
    } catch (e) {
      setPassword('');
      setError(e.message);
    }
  }
  async function enter(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(e.currentTarget),
      pw = form.get('master');
    try {
      if (!record && pw !== form.get('confirm'))
        throw Error('Master passwords do not match.');
      if (
        !record &&
        (pw.length < 12 ||
          !/[A-Z]/.test(pw) ||
          !/[a-z]/.test(pw) ||
          !/[0-9]/.test(pw))
      )
        throw Error(
          'Use at least 12 characters with uppercase, lowercase, and digits.',
        );
      const salt =
        record?.salt || Array.from(crypto.getRandomValues(new Uint8Array(16)));
      const k = await deriveKey(pw, salt);
      const content = record
        ? await unseal(k, record)
        : { email: form.get('email'), items: [] };
      if (!record) {
        const saved = { version: 1, salt, ...(await seal(k, content)) };
        await writeVault(saved);
        setRecord(saved);
      }
      setKey(k);
      setData(content);
      setModal(record ? null : 'setup-complete');
      if (pendingGenerated.current) {
        setPage('Logins');
        setDraft({
          type: 'Logins',
          values: { Password: pendingGenerated.current },
          favorite: false,
          tags: [],
        });
        pendingGenerated.current = null;
      }
    } catch (e) {
      setError(
        record
          ? 'Unable to unlock. Check your master password and browser storage.'
          : e.message,
      );
    } finally {
      setBusy(false);
    }
  }
  async function persist(next) {
    if (!key || keyRef.current !== key)
      throw Error('Unlock the vault before saving.');
    if (savingRef.current)
      throw Error('Another save is in progress. Please try again.');
    savingRef.current = true;
    try {
      const saved = {
        version: 1,
        salt: record.salt,
        ...(await seal(key, next)),
      };
      if (keyRef.current !== key) throw Error('Vault locked before saving.');
      await writeVault(saved, record);
      if (keyRef.current === key) {
        setRecord(saved);
        setData(next);
      }
    } finally {
      savingRef.current = false;
    }
  }
  function saveGenerated() {
    if (!password) return;
    if (!key) {
      pendingGenerated.current = password;
      setError('');
      setModal('unlock');
      return;
    }
    setPage('Logins');
    setDraft({
      type: 'Logins',
      values: { Password: password },
      favorite: false,
      tags: [],
    });
    setVisibleField(null);
  }
  async function saveItem(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const item = {
        ...draft,
        tags: [
          ...new Set((draft.tags || []).map((t) => t.trim()).filter(Boolean)),
        ],
        updated: new Date().toISOString(),
        id: draft.id || crypto.randomUUID(),
      };
      await persist({
        ...data,
        items: [...data.items.filter((x) => x.id !== item.id), item],
      });
      setDraft(null);
      notify('Item saved securely');
    } catch (e) {
      notify(e.message || 'Save failed. Your changes have not been stored.');
    } finally {
      setBusy(false);
    }
  }
  function add() {
    if (!key) {
      setModal('unlock');
      return;
    }
    if (page === 'Wallet') {
      setWalletMenu(!walletMenu);
      return;
    }
    setDraft({
      type: page === 'Favorites' ? 'Logins' : page,
      values: {},
      favorite: false,
    });
  }
  const bits = entropy(options),
    strength = bits >= 80 ? 'Strong' : bits >= 50 ? 'Moderate' : 'Weak';
  const visible = data.items
    .filter(
      (i) =>
        (page === 'Favorites' ? i.favorite : i.type === page) &&
        [...Object.values(i.values), ...(i.tags || [])].some((v) =>
          String(v).toLowerCase().includes(query.toLowerCase()),
        ),
    )
    .sort((a, b) => {
      const field = page === 'Logins' ? 'Website' : 'Title';
      return (
        (sortAscending ? 1 : -1) *
        (a.values[field] || a.values.Title || '').localeCompare(
          b.values[field] || b.values.Title || '',
        )
      );
    });
  const go = (p) => {
    setPage(p);
    setWalletMenu(false);
    setVisibleField(null);
    setDraft(null);
    setQuery('');
    setError('');
  };
  return (
    <>
      <header>
        <Brand />
        <button
          className="account"
          onClick={() => (key ? lock() : setModal('unlock'))}
        >
          {key ? data.email : 'Local vault'} <UserRound size={25} />
        </button>
      </header>
      <aside>
        <h2>
          <KeyRound />
          Password Manager
        </h2>
        <small>VAULT</small>
        <button className="encrypted" onClick={() => setModal('encryption')}>
          <LockKeyhole size={15} /> Your data is encrypted
        </button>
        {nav.map(([name, Icon]) => (
          <button
            key={name}
            className={'nav ' + (page === name ? 'active' : '')}
            onClick={() => go(name)}
          >
            <Icon />
            {name}
            <span>
              {
                data.items.filter((i) =>
                  name === 'Favorites' ? i.favorite : i.type === name,
                ).length
              }
            </span>
          </button>
        ))}
        <small>SECURITY & PREFERENCES</small>
        <button
          className={'nav ' + (page === 'Settings' ? 'active' : '')}
          onClick={() => go('Settings')}
        >
          <Settings />
          Settings
        </button>
        <small>MORE FEATURES</small>
        <button
          className={'nav ' + (page === 'Password Generator' ? 'active' : '')}
          onClick={() => go('Password Generator')}
        >
          <SlidersHorizontal />
          Password Generator
        </button>
        <div className="sidebar-bottom">
          <ShieldCheck size={17} /> Team 4 · Educational project
        </div>
      </aside>
      <main
        className={
          draft
            ? 'editing-page'
            : page === 'Logins' && !visible.length
              ? 'empty-logins-page'
              : ''
        }
      >
        <div className="page-top">
          <div>
            <h1>
              {draft
                ? `${draft.id ? 'Edit' : 'Add'} ${draft.type === 'Logins' ? 'a Login' : draft.type === 'Wallet' ? (draft.kind === 'account' ? 'an Account' : 'a Card') : draft.type === 'Notes' ? 'a Note' : 'an Address'}`
                : page}
            </h1>
            {nav.some(([n]) => n === page) && !draft && (
              <p className="muted">
                {visible.length
                  ? `${visible.length} items`
                  : key
                    ? 'No items yet'
                    : 'Unlock your vault to view items'}
              </p>
            )}
          </div>
          {draft && (
            <div className="actions">
              <button onClick={() => setDraft(null)}>Cancel</button>
              <button className="primary" form="item-form" disabled={busy}>
                Save
              </button>
            </div>
          )}
        </div>
        {draft ? (
          <form id="item-form" className="editor" onSubmit={saveItem}>
            <div>
              {(draft.type === 'Wallet' && draft.kind === 'account'
                ? accountFields
                : fields[draft.type]
              ).map((f) => (
                <label key={f} className="editor-field">
                  <span className="sr-only">{f}</span>
                  {f === 'Notes' ? (
                    <textarea
                      placeholder={f}
                      value={draft.values[f] || ''}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          values: { ...draft.values, [f]: e.target.value },
                        })
                      }
                    />
                  ) : (
                    <div className="input-row">
                      <input
                        required={f === 'Title'}
                        placeholder={
                          f === 'Cardholder'
                            ? 'Name on Card'
                            : f === 'Expiration'
                              ? 'Valid Thru'
                              : f === 'Branch/Routing number'
                                ? 'Branch/Routing Number (ABA, BSB, IFSC etc.)'
                                : f
                        }
                        type={
                          sensitiveFields.includes(f) && visibleField !== f
                            ? 'password'
                            : f === 'Expiration'
                              ? 'month'
                              : 'text'
                        }
                        autoComplete="off"
                        value={draft.values[f] || ''}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            values: { ...draft.values, [f]: e.target.value },
                          })
                        }
                      />
                      {sensitiveFields.includes(f) && (
                        <button
                          type="button"
                          aria-label={
                            (visibleField === f ? 'Hide ' : 'Show ') +
                            f.toLowerCase()
                          }
                          onClick={() =>
                            setVisibleField(visibleField === f ? null : f)
                          }
                        >
                          {visibleField === f ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      )}
                      {f === 'Password' && (
                        <>
                          <button
                            type="button"
                            aria-label="Generate password"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                values: {
                                  ...draft.values,
                                  Password: generatePassword(
                                    password ? options : defaults,
                                  ),
                                },
                              })
                            }
                          >
                            <RefreshCw size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </label>
              ))}
            </div>
            <section className="edit-side">
              <label className="check">
                <input
                  type="checkbox"
                  checked={draft.favorite}
                  onChange={(e) =>
                    setDraft({ ...draft, favorite: e.target.checked })
                  }
                />
                Mark as favorite
              </label>
              <div className="tag-editor">
                <label>
                  Tags
                  <input
                    aria-label="Tags"
                    placeholder="Work, Personal, Banking"
                    value={(draft.tags || []).join(',')}
                    onChange={(e) =>
                      setDraft({ ...draft, tags: e.target.value.split(',') })
                    }
                  />
                </label>
                <p className="fine">
                  Separate tags with commas. Search by tag to find related
                  items.
                </p>
                <div className="tag-list">
                  {(draft.tags || [])
                    .filter((t) => t.trim())
                    .map((tag, i) => (
                      <span key={i}>{tag.trim()}</span>
                    ))}
                </div>
              </div>
              <LockKeyhole />
              <p>Your item is encrypted before it is saved on this device.</p>
              {draft.id && (
                <button
                  type="button"
                  className="danger"
                  disabled={busy}
                  onClick={() => setModal('delete')}
                >
                  <Trash2 size={16} /> Delete item
                </button>
              )}
            </section>
          </form>
        ) : page === 'Password Generator' ? (
          <>
            <section className="generator">
              <div className="password-output">
                <div className="password" aria-live="polite">
                  {[...password].map((c, i) => (
                    <span
                      key={i}
                      className={
                        /\d/.test(c)
                          ? 'digit'
                          : /[a-z]/i.test(c)
                            ? ''
                            : 'symbol'
                      }
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <button
                  aria-label="Copy password"
                  disabled={!password}
                  onClick={() => copy(password)}
                >
                  <Copy />
                </button>
                <button
                  aria-label="Regenerate password"
                  disabled={!password}
                  onClick={() => setPassword(generatePassword(options))}
                >
                  <RefreshCw />
                </button>
              </div>
              <div className={'strength-line ' + strength.toLowerCase()} />
              <div className="generator-settings">
                <div className={'strength-text ' + strength.toLowerCase()}>
                  <Check size={17} />
                  <b>Strength:</b>{' '}
                  {password ? strength : 'No character sets selected'}
                </div>
                <p className="estimate">Estimated search space</p>
                <b>{Math.floor(bits)} bits of entropy</b>
                <p className="fine">
                  Based on length and alphabet size; not a guarantee of cracking
                  time.
                </p>
                <h3>CUSTOMIZE YOUR PASSWORD</h3>
                <p>
                  Use the slider, and select from the options below, to lengthen
                  your password and strengthen your security.
                </p>
                <div className="length-row">
                  <label htmlFor="length">
                    Password Length: {options.length}
                  </label>
                  <input
                    id="length"
                    type="range"
                    min="4"
                    max="128"
                    value={options.length}
                    onChange={(e) =>
                      updateOptions({
                        ...options,
                        length: Number(e.target.value),
                      })
                    }
                  />
                  <input
                    aria-label="Password length"
                    className="length-number"
                    type="number"
                    min="4"
                    max="128"
                    value={options.length}
                    onChange={(e) =>
                      updateOptions({
                        ...options,
                        length: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="checks">
                  {[
                    ['lower', 'Lowercase letters'],
                    ['upper', 'Uppercase letters'],
                    ['numbers', 'Numbers'],
                    ['symbols', 'Punctuation'],
                    ['ambiguous', 'Avoid ambiguous characters'],
                  ].map(([k, label]) => (
                    <label className="check" key={k}>
                      <input
                        type="checkbox"
                        checked={options[k]}
                        onChange={(e) =>
                          updateOptions({ ...options, [k]: e.target.checked })
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {error && !modal && (
                  <p role="alert" className="error">
                    {error}
                  </p>
                )}
              </div>
            </section>
            <button
              className="restore"
              onClick={() => updateOptions({ ...defaults })}
            >
              Restore Default Settings
            </button>
            <button
              className="restore save-generated"
              disabled={!password}
              onClick={saveGenerated}
            >
              Save as a login
            </button>
          </>
        ) : page === 'Settings' ? (
          <div className="settings">
            <h3>VAULT SECURITY</h3>
            <section>
              <div>
                <h2>{key ? 'Vault is unlocked' : 'Set up your local vault'}</h2>
                <p>
                  Create a master password to encrypt your saved items on this
                  device.
                </p>
              </div>
              <button onClick={() => (key ? lock() : setModal('unlock'))}>
                {key ? 'Lock vault' : record ? 'Unlock vault' : 'Set up vault'}
              </button>
            </section>
            <section>
              <div>
                <h2>Automatic lock</h2>
                <p>
                  Your vault locks after {data.settings?.lockMinutes || 5}{' '}
                  minutes without keyboard or pointer activity.
                </p>
              </div>
              <label className="lock-setting">
                Lock after
                <select
                  aria-label="Automatic lock duration"
                  disabled={!key || busy}
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
            {['Biometric unlock', 'Browser autofill', 'Notifications'].map(
              (t) => (
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
              ),
            )}
            <h3>ABOUT THIS PROJECT</h3>
            <p>
              Avast-inspired educational implementation by Team 4. Independent
              course project; not affiliated with Avast. Vault contents stay in
              this browser. Clearing site data removes the vault. The master
              password cannot be recovered.
            </p>
          </div>
        ) : (
          <>
            {(page === 'Logins' ||
              data.items.some((i) =>
                page === 'Favorites' ? i.favorite : i.type === page,
              )) && (
              <>
                <div
                  className={
                    visible.length || query ? 'search' : 'search search-hidden'
                  }
                >
                  <Search size={18} />
                  <input
                    placeholder="Search your vault"
                    aria-label="Search your vault"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th
                          aria-sort={sortAscending ? 'ascending' : 'descending'}
                        >
                          <button
                            className="sort-button"
                            onClick={() => setSortAscending(!sortAscending)}
                          >
                            {page === 'Logins' ? 'Website' : 'Title'}{' '}
                            {sortAscending ? '↑' : '↓'}
                          </button>
                        </th>
                        <th>{page === 'Logins' ? 'Username' : 'Type'}</th>
                        <th>Password</th>
                        <th>Last Modified</th>
                        <th>
                          <span className="sr-only">Favorite</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {!visible.length &&
                        page === 'Logins' &&
                        Array.from({ length: 6 }, (_, i) => (
                          <tr className="placeholder-row" key={'empty-' + i}>
                            <td colSpan="5" />
                          </tr>
                        ))}
                      {visible.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <button
                              className="item-link"
                              onClick={() =>
                                setDraft({
                                  ...item,
                                  values: { ...item.values },
                                })
                              }
                            >
                              {item.values.Website || item.values.Title}
                            </button>
                            <div className="tag-list">
                              {(item.tags || []).map((tag, i) => (
                                <span key={i}>{tag}</span>
                              ))}
                            </div>
                          </td>
                          <td>
                            {item.values.Username ||
                              (item.type === 'Wallet'
                                ? item.kind === 'account'
                                  ? 'Account'
                                  : 'Card'
                                : item.type)}
                          </td>
                          <td>
                            {item.values.Password && (
                              <button
                                aria-label="Copy saved password"
                                onClick={() => copy(item.values.Password)}
                              >
                                •••••••• <Copy size={14} />
                              </button>
                            )}
                          </td>
                          <td>{new Date(item.updated).toLocaleDateString()}</td>
                          <td>
                            <button
                              aria-label="Toggle favorite"
                              onClick={async () => {
                                try {
                                  await persist({
                                    ...data,
                                    items: data.items.map((i) =>
                                      i.id === item.id
                                        ? { ...i, favorite: !i.favorite }
                                        : i,
                                    ),
                                  });
                                } catch {
                                  notify(
                                    'Unable to update favorite. Another tab may have changed the vault; reload and unlock to refresh.',
                                  );
                                }
                              }}
                            >
                              <Star
                                size={19}
                                fill={item.favorite ? '#ff8300' : 'none'}
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {!visible.length && (
              <div
                className={'empty ' + (page === 'Logins' ? 'login-empty' : '')}
              >
                {React.createElement(
                  (nav.find(([n]) => n === page) || [])[1] || Star,
                  {
                    size: 54,
                    className:
                      page === 'Logins' && key && !query ? 'sr-only' : '',
                  },
                )}
                <h2
                  className={
                    page === 'Logins' && key && !query ? 'sr-only' : ''
                  }
                >
                  {!key
                    ? 'Your vault, secured'
                    : query
                      ? 'No matching items'
                      : page === 'Favorites'
                        ? 'Add Your Favorites'
                        : `Add Your ${page === 'Wallet' ? 'Cards and Accounts' : page}`}
                </h2>
                <p>
                  {query ? (
                    'Try another title, username, or tag.'
                  ) : key && page === 'Logins' ? (
                    <>
                      Make your every day easier with Password Manager.
                      <br />
                      It helps to securely store and manage your passwords so
                      you don't have to.
                    </>
                  ) : !key ? (
                    'Set up or unlock your local vault to save and manage your information.'
                  ) : page === 'Favorites' ? (
                    'For quick access, mark your most often needed information, such as logins, addresses, and more.'
                  ) : (
                    'Keep your information together in your encrypted vault.'
                  )}
                </p>
                {!key ? (
                  <button onClick={() => setModal('unlock')}>
                    {record ? 'Unlock vault' : 'Set up vault'}
                  </button>
                ) : page === 'Logins' ? (
                  <button
                    onClick={() => setHelp('Save your passwords when prompted')}
                  >
                    How to add more passwords
                  </button>
                ) : null}
              </div>
            )}
            {walletMenu && page === 'Wallet' && (
              <>
                <div
                  className="wallet-menu-backdrop"
                  onClick={() => setWalletMenu(false)}
                />
                <div
                  className="wallet-add-menu"
                  role="group"
                  aria-label="Add to wallet"
                >
                  {[
                    ['card', 'Cards', CreditCard],
                    ['account', 'Accounts', Landmark],
                  ].map(([kind, label, Icon]) => (
                    <button
                      key={kind}
                      onClick={() => {
                        setDraft({
                          type: 'Wallet',
                          kind,
                          values: {},
                          favorite: false,
                        });
                        setVisibleField(null);
                        setWalletMenu(false);
                      }}
                    >
                      {label}
                      <span>
                        <Icon size={23} />
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
            <button
              className={'fab ' + (walletMenu ? 'wallet-menu-open' : '')}
              aria-label={walletMenu ? 'Close wallet menu' : 'Add item'}
              aria-expanded={page === 'Wallet' ? walletMenu : undefined}
              onClick={add}
            >
              {walletMenu ? <X size={30} /> : <Plus size={30} />}
            </button>
          </>
        )}
        <footer>
          Team 4 · CS 528 · Password Generation / Management Tool{' '}
          <span>Educational project</span>
        </footer>
      </main>
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
      {modal === 'setup-complete' && (
        <div className="overlay">
          <SetupComplete onClose={() => setModal(null)} />
        </div>
      )}
      {help && (
        <PasswordHelp
          expanded={help}
          onExpand={setHelp}
          onClose={() => setHelp(null)}
          onImport={() =>
            notify(
              'Password import is not implemented in this course version. Use + to add a login manually.',
            )
          }
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById('root')).render(<App />);
