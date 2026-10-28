# Team 4 Password Manager

Avast-inspired CS 528 Project 4 by David Amebley and Kofi Ampomah. Independent educational implementation; no Avast services are contacted.

## Run

Node 22.12+ or Node 24 recommended.

    npm install
    npm run dev

Open the localhost URL printed by Vite. Production: `npm run build`. Security tests: `npm test`.

## Features

Configurable length (4-128), independent lowercase/uppercase/digit/punctuation controls, ambiguous-character exclusion, regeneration, clipboard copying, and entropy visualization. The screenshot labels Letters/Mixed case are split into independent case controls to meet the assignment requirements.

Local vault setup and unlock, login/card/address/note creation and editing, deletion, favorites, search, ascending/descending alphabetical sorting, and configurable inactivity lock (1, 5, 15, or 30 minutes; default 5). Reference screens are preserved in references/screenshots.

## Security design

Passwords use Web Crypto getRandomValues and rejection sampling to avoid modulo bias. Each position is independently sampled from the selected alphabet. Selected sets are eligible, not guaranteed to appear in every generated password. Entropy is L * log2(N), with no assumed cracking speed.

Vault keys use PBKDF2-HMAC-SHA-256, 600,000 iterations, a random 16-byte salt, and a non-extractable AES-256-GCM key. Every save uses a new random 12-byte IV. Only salt, version, IV and authenticated ciphertext are persisted to IndexedDB; the profile email and items are inside ciphertext. The master password and key are never persisted. Reloading requires unlock. While unlocked, data is in memory. Clipboard contents are not automatically cleared.

Use localhost or HTTPS for Web Crypto. This is a single local vault per browser origin. No cloud account, recovery, sync, actual biometric unlock, browser-wide autofill, or import is implemented. Clearing browser storage removes the vault. This is a course prototype, not an audited production password manager.

Implementation references:

- https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
- https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey
- https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
- https://vite.dev/guide/

## Remaining coursework

The team must verify secure randomness, understand and explain the code, complete its 3-5 page report and presentation, and review the AI usage statement. Instructor approval for the Avast proposal was confirmed by the user on October 28, 2026.

## Project layout and maintenance

- `src/`: React screens, styles, password generation, and encrypted vault storage.
- `tests/security.test.js`: generator and encryption checks.
- `scripts/browser-check.mjs`: Chrome checks for setup, vault actions, wallet cards/accounts, help accordions, and mobile layout.
- `references/screenshots/`: original UI references. Assignment and proposal PDFs remain in the project root.
- `AI_USAGE.md`: draft statement for team review.

Run `npm run format` to format source and documentation, or `npm run format:check` to check formatting. Run `npm test` for security checks. With the dev server running at `http://127.0.0.1:5173`, run `npm run test:browser` for browser checks; this requires installed Google Chrome. The browser script creates an isolated test profile and saves review images under ignored `tmp/`.

Build output (`dist/`), dependencies (`node_modules/`), test artifacts, environment files, and temporary files are excluded by `.gitignore`. These generated directories may be recreated by normal development commands.

Vault setup includes uppercase, lowercase, and digit requirements, confirmation, and an acknowledgment that the password differs from other accounts. Wallet supports separate Cards and Accounts. The help drawer mirrors the reference accordion layout; its Import Now button explains that importing is unavailable.

## Organization and save safeguards

Add comma-separated tags in the item editor. Tags are encrypted with the item and included in search. Click the Website/Title table header to reverse sorting. The generator's Save as a login button opens a login draft containing the generated password; complete the title and save it to persist it.

Automatic lock duration is configurable in Settings and encrypted with the vault. A transactional comparison rejects saves based on an outdated vault record, preventing an older tab from silently overwriting a newer save. Reload and unlock the stale tab to refresh before reapplying changes. Concurrent writes within one tab are rejected while a save is in progress.

The browser check also covers tag search, empty-result recovery, generated-login saving, persisted lock preferences, and rejection of stale updates across two tabs.
