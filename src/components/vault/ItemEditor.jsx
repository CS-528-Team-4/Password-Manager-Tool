import React from 'react';
import {
  Wallet,
  RefreshCw,
  LockKeyhole,
  Eye,
  EyeOff,
  Search,
  Trash2,
} from 'lucide-react';
import {
  fields,
  accountFields,
  sensitiveFields,
} from '../../config/vaultConfig.js';
import { defaults, generatePassword } from '../../lib/security/generator.js';

export default function ItemEditor({
  draft,
  setDraft,
  saveItem,
  visibleField,
  setVisibleField,
  password,
  options,
  busy,
  setModal,
}) {
  return (
    <>
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
                  aria-label={f}
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
                    aria-label={f}
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
              Separate tags with commas. Search by tag to find related items.
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
    </>
  );
}
