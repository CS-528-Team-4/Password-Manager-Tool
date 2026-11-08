# Codebase guide

## Entry point and application state

`src/main.jsx` mounts React and imports the global stylesheet. `src/App.jsx` coordinates navigation, the unlocked session, generator options, editor drafts, searches, and application actions. It connects the feature components through props.

The UI components are grouped by feature. Navigation and branding live in `layout`; vault forms and listings live in `vault`; setup/unlock components live in `auth`. The generator, settings, and autofill demo each have their own folder. Components receive the data and callbacks they need rather than reading IndexedDB themselves.

## Password generation

`lib/security/generator.js` owns the character sets, generation rules, rejection sampling, and entropy calculation. The generator screen displays this module's output. Keep randomness changes here and verify them with the security tests.

## Vault storage flow

1. An editor supplies an item draft to an action in `App.jsx`.
2. The app produces the next vault contents and calls `seal` from `vaultCrypto.js`.
3. `vaultStore.js` writes the ciphertext, IV, salt, and format version to IndexedDB.
4. During a save, the storage transaction compares the current stored record with the expected record. An outdated tab receives a conflict instead of overwriting a newer save.
5. Unlock derives the key and decrypts the stored record. Lock clears the active key, displayed vault contents, drafts, and autofill form.

Cryptographic functions are separate from browser database operations so they can be tested directly in Node. The master password and encryption key are not persisted. UI-only screens receive an unlocked flag; they do not need the encryption key.

## Shared configuration and styling

`config/vaultConfig.js` defines sidebar vault categories and the fields for each item type. Add or adjust ordinary item fields there, and update sensitive-field masking when necessary. Cards and bank accounts use separate field definitions.

`styles/app.css` preserves the existing theme and responsive cascade. Later responsive and interaction rules refine the base layout. Check desktop and mobile screenshots when changing these rules.

## Verification

- `npm test`: password-generation constraints, entropy, encryption round trip, tamper detection, and wrong-key rejection.
- `npm run build`: production bundle.
- `npm run format:check`: consistent source formatting.
- `npm run test:browser`: Chrome flow with synthetic data and an isolated browser profile; start the app first.

Development and production preview both use `http://127.0.0.1:5173/`, configured in `vite.config.js`. Strict port checking prevents silently switching to an origin with different IndexedDB storage. Run one server at a time. Browser checks use the same address in an isolated test context. Generated images and scratch files stay in ignored `tmp/`; do not put application source there.

The feature split is an organizational refactor. Biometric unlock, external website autofill, cloud accounts, and password import remain outside the implemented feature set.
