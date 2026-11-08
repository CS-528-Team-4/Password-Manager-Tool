import React from 'react';
import {
  KeyRound,
  CreditCard,
  UserRound,
  Settings,
  SlidersHorizontal,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import Brand from './Brand.jsx';
import { nav } from '../../config/vaultConfig.js';

export default function Navigation({
  page,
  go,
  data,
  unlocked,
  lock,
  setModal,
}) {
  return (
    <>
      <header>
        <Brand />
        <button
          className="account"
          onClick={() => (unlocked ? lock() : setModal('unlock'))}
        >
          {unlocked ? data.email : 'Local vault'} <UserRound size={25} />
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
            aria-current={page === name ? 'page' : undefined}
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
          aria-current={page === 'Settings' ? 'page' : undefined}
          onClick={() => go('Settings')}
        >
          <Settings />
          Settings
        </button>
        <small>MORE FEATURES</small>
        <button
          className={'nav ' + (page === 'Password Generator' ? 'active' : '')}
          aria-current={page === 'Password Generator' ? 'page' : undefined}
          onClick={() => go('Password Generator')}
        >
          <SlidersHorizontal />
          Password Generator
        </button>
        <button
          className={'nav ' + (page === 'Autofill Demo' ? 'active' : '')}
          aria-current={page === 'Autofill Demo' ? 'page' : undefined}
          onClick={() => go('Autofill Demo')}
        >
          <UserRound />
          Autofill Demo
        </button>
        <button
          className={'nav ' + (page === 'Card Autofill Demo' ? 'active' : '')}
          aria-current={page === 'Card Autofill Demo' ? 'page' : undefined}
          onClick={() => go('Card Autofill Demo')}
        >
          <CreditCard />
          Card Autofill Demo
        </button>
        <div className="sidebar-bottom">
          <ShieldCheck size={17} /> Team 4 · Educational project
        </div>
      </aside>
    </>
  );
}
