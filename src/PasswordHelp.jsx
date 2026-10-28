import React from 'react';
import { Info, Plus, Minus, X } from 'lucide-react';
const titles = [
  'Save your passwords when prompted',
  'Import your passwords',
  'Add your passwords manually',
];
function ManualIllustration() {
  return (
    <div className="manual-illustration" aria-hidden="true">
      <div className="mini-toolbar">
        <i />
        <i />
        <i />
      </div>
      <div className="mini-window">
        <div className="mini-nav">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i}>
              <i />
              <b />
            </span>
          ))}
        </div>
        <div className="mini-rows">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        <span className="mini-plus">
          <Plus size={14} />
        </span>
      </div>
    </div>
  );
}
export default function PasswordHelp({
  expanded,
  onExpand,
  onClose,
  onImport,
}) {
  return (
    <div className="overlay help-overlay" onClick={onClose}>
      <section
        className="drawer password-help"
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-help-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close" aria-label="Close help" onClick={onClose}>
          <X size={28} />
        </button>
        <Info className="help-info" size={54} strokeWidth={1.8} />
        <h2 id="password-help-title">How to add more passwords</h2>
        <div className="help-sections">
          {titles.map((title, i) => {
            const open = expanded === title;
            return (
              <section
                className={'accordion ' + (open ? 'expanded' : '')}
                key={title}
              >
                <h3>
                  <button
                    aria-expanded={open}
                    aria-controls={'help-panel-' + i}
                    onClick={() => onExpand(open ? 'closed' : title)}
                  >
                    {title}
                    {open ? (
                      <Minus size={30} strokeWidth={1.6} />
                    ) : (
                      <Plus size={30} strokeWidth={1.6} />
                    )}
                  </button>
                </h3>
                {open && (
                  <div className="help-content" id={'help-panel-' + i}>
                    {i === 0 ? (
                      <>
                        <p>
                          And enter your credentials with just one click the
                          next time you sign in.
                        </p>
                        <ol>
                          <li>
                            Sign in to your favorite websites with your username
                            and password
                          </li>
                          <li>
                            Click <b>Save</b> when Avast offers to save your
                            credentials
                          </li>
                        </ol>
                        <p className="help-project-note">
                          In this course app, use the + button to save logins
                          manually. Website prompts require the Avast extension.
                        </p>
                      </>
                    ) : i === 1 ? (
                      <>
                        <p>
                          If you keep your passwords in your Chrome browser or a
                          different password manager, import your data by
                          clicking below.
                        </p>
                        <button
                          className="primary import-now"
                          onClick={onImport}
                        >
                          Import Now
                        </button>
                      </>
                    ) : (
                      <>
                        <p>
                          Click the PLUS button on the bottom right corner of
                          the screen to add your Wi-Fi, computer, or other
                          passwords manually (
                          <span className="inline-plus">
                            <Plus size={13} />
                          </span>
                          )
                        </p>
                        <ManualIllustration />
                      </>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
