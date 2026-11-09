import Navigation from './components/layout/Navigation.jsx';
import ItemEditor from './components/vault/ItemEditor.jsx';
import VaultList from './components/vault/VaultList.jsx';
import VaultDialog from './components/auth/VaultDialog.jsx';
import PasswordGenerator from './components/generator/PasswordGenerator.jsx';
import SettingsPage from './components/settings/SettingsPage.jsx';
import { nav } from './config/vaultConfig.js';
import React, { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import {
  defaults,
  generatePassword,
  entropy,
} from './lib/security/generator.js';
import { deriveKey, seal, unseal } from './lib/security/vaultCrypto.js';
import { readVault, writeVault } from './lib/storage/vaultStore.js';

import AutofillDemo from './components/demo/AutofillDemo.jsx';
import CardAutofillDemo from './components/demo/CardAutofillDemo.jsx';
import PasswordHelp from './components/vault/PasswordHelp.jsx';
import { SetupComplete } from './components/auth/Setup.jsx';
export default function App() {
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
    // Escape dismisses overlays only. Unsaved editor drafts are kept; use
    // Cancel to discard them explicitly.
    const close = (e) => {
      if (e.key === 'Escape') {
        setModal(null);
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
      <Navigation
        page={page}
        go={go}
        data={data}
        unlocked={!!key}
        lock={lock}
        setModal={setModal}
      />
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
          <ItemEditor
            draft={draft}
            setDraft={setDraft}
            saveItem={saveItem}
            visibleField={visibleField}
            setVisibleField={setVisibleField}
            password={password}
            options={options}
            busy={busy}
            setModal={setModal}
          />
        ) : page === 'Password Generator' ? (
          <PasswordGenerator
            password={password}
            options={options}
            updateOptions={updateOptions}
            bits={bits}
            strength={strength}
            error={error}
            modal={modal}
            copy={copy}
            setPassword={setPassword}
            saveGenerated={saveGenerated}
          />
        ) : page === 'Autofill Demo' ? (
          <AutofillDemo
            unlocked={!!key}
            items={data.items}
            onUnlock={() => {
              setError('');
              setModal('unlock');
            }}
            onCreate={(website) => {
              setPage('Logins');
              setDraft({
                type: 'Logins',
                values: { Website: website },
                favorite: false,
              });
            }}
          />
        ) : page === 'Card Autofill Demo' ? (
          <CardAutofillDemo
            unlocked={!!key}
            items={data.items}
            onUnlock={() => {
              setError('');
              setModal('unlock');
            }}
            onCreate={() => {
              if (!key) {
                setModal('unlock');
                return;
              }
              setPage('Wallet');
              setVisibleField(null);
              setDraft({
                type: 'Wallet',
                kind: 'card',
                values: {},
                favorite: false,
              });
            }}
          />
        ) : page === 'Settings' ? (
          <SettingsPage
            unlocked={!!key}
            data={data}
            record={record}
            lock={lock}
            setModal={setModal}
            busy={busy}
            setBusy={setBusy}
            persist={persist}
            notify={notify}
          />
        ) : (
          <VaultList
            page={page}
            visible={visible}
            data={data}
            record={record}
            unlocked={!!key}
            query={query}
            setQuery={setQuery}
            sortAscending={sortAscending}
            setSortAscending={setSortAscending}
            setDraft={setDraft}
            copy={copy}
            persist={persist}
            notify={notify}
            setModal={setModal}
            setHelp={setHelp}
            walletMenu={walletMenu}
            setWalletMenu={setWalletMenu}
            setVisibleField={setVisibleField}
            add={add}
          />
        )}
        <footer>
          Team 4 · CS 528 · Password Generation / Management Tool{' '}
          <span>Educational project</span>
        </footer>
      </main>
      <VaultDialog
        modal={modal}
        setModal={setModal}
        busy={busy}
        setBusy={setBusy}
        record={record}
        ready={ready}
        error={error}
        enter={enter}
        persist={persist}
        data={data}
        draft={draft}
        setDraft={setDraft}
        notify={notify}
      />
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
