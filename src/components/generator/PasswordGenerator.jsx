import React from 'react';
import { Copy, RefreshCw, Check } from 'lucide-react';
import { defaults, generatePassword } from '../../lib/security/generator.js';

export default function PasswordGenerator({
  password,
  options,
  updateOptions,
  bits,
  strength,
  error,
  modal,
  copy,
  setPassword,
  saveGenerated,
}) {
  return (
    <>
      <section className="generator">
        <div className="password-output">
          <div className="password" aria-live="polite">
            {[...password].map((c, i) => (
              <span
                key={i}
                className={
                  /\d/.test(c) ? 'digit' : /[a-z]/i.test(c) ? '' : 'symbol'
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
        <div
          className={
            'strength-line ' + (password ? strength.toLowerCase() : 'empty')
          }
        />
        <div className="generator-settings">
          <div
            className={
              'strength-text ' + (password ? strength.toLowerCase() : 'empty')
            }
          >
            <Check size={17} />
            <b>Strength:</b>{' '}
            {password ? strength : 'No character sets selected'}
          </div>
          <p className="estimate">Estimated search space</p>
          <b>{Math.floor(bits)} bits of entropy</b>
          <p className="fine">
            Based on length and alphabet size; not a guarantee of cracking time.
          </p>
          <h3>CUSTOMIZE YOUR PASSWORD</h3>
          <p>
            Use the slider, and select from the options below, to lengthen your
            password and strengthen your security.
          </p>
          <div className="length-row">
            <label htmlFor="length">Password Length: {options.length}</label>
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
  );
}
