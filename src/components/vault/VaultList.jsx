import React from 'react';
import {
  Star,
  Copy,
  Plus,
  X,
  Search,
  CreditCard,
  Landmark,
} from 'lucide-react';
import { nav } from '../../config/vaultConfig.js';

export default function VaultList({
  page,
  visible,
  data,
  record,
  unlocked,
  query,
  setQuery,
  sortAscending,
  setSortAscending,
  setDraft,
  copy,
  persist,
  notify,
  setModal,
  setHelp,
  walletMenu,
  setWalletMenu,
  setVisibleField,
  add,
}) {
  return (
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
                  <th aria-sort={sortAscending ? 'ascending' : 'descending'}>
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
                        aria-pressed={!!item.favorite}
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
        <div className={'empty ' + (page === 'Logins' ? 'login-empty' : '')}>
          {React.createElement(
            (nav.find(([n]) => n === page) || [])[1] || Star,
            {
              size: 54,
              className:
                page === 'Logins' && unlocked && !query ? 'sr-only' : '',
            },
          )}
          <h2
            className={page === 'Logins' && unlocked && !query ? 'sr-only' : ''}
          >
            {!unlocked
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
            ) : unlocked && page === 'Logins' ? (
              <>
                Make your every day easier with Password Manager.
                <br />
                It helps to securely store and manage your passwords so you
                don't have to.
              </>
            ) : !unlocked ? (
              'Set up or unlock your local vault to save and manage your information.'
            ) : page === 'Favorites' ? (
              'For quick access, mark your most often needed information, such as logins, addresses, and more.'
            ) : (
              'Keep your information together in your encrypted vault.'
            )}
          </p>
          {!unlocked ? (
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
  );
}
