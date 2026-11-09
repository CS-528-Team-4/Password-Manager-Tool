# Password Manager Tool

An Avast-inspired password generator and encrypted local vault built for **CS 528: Computer Security — Project 4**.

**Team 4:** David Amebley and Kofi Ampomah

The application combines configurable password generation with local storage for logins, payment cards, bank accounts, addresses, and secure notes. Its interface follows the Avast reference screenshots supplied by the team. A platform-based autofill demonstration shows how saved credentials can populate a login form, and a card autofill demonstration fills a sample checkout from a saved card.

This is an independent educational project. It does not connect to Avast services.

## Features

### Password generator

- Choose a password length from **4 to 128 characters**.
- Include or exclude uppercase letters, lowercase letters, numbers, and punctuation independently.
- Exclude the ambiguous characters `I`, `l`, `1`, `O`, `0`, and `o`.
- Regenerate passwords, copy them, or open a login draft with the generated password.
- View a strength indicator and estimated entropy in bits.

### Encrypted vault

- Create a local profile and protect it with a master password.
- Add, edit, and delete logins, cards, bank accounts, addresses, and notes.
- Organize entries using favorites and comma-separated tags.
- Search stored fields and tags; sort entries in ascending or descending order.
- Hide sensitive fields until explicitly revealed.
- Lock automatically after **1, 5, 15, or 30 minutes** of inactivity; the default is 5 minutes.
- Detect stale saves so an older browser tab cannot silently overwrite a newer change.

### Platform autofill demo

- Open cards for **Google, YouTube, Student Portal, Demo Shop**, and websites found in saved logins.
- Automatically fill a platform's practice form when exactly one saved account matches.
- Choose from inline password-manager suggestions when several accounts match.
- Add a login with the platform's website prefilled when no matching account exists.
- Clear the form or simulate signing in to a local welcome screen.

The platform pages are local simulations. They do not open the real services, authenticate accounts, or transmit credentials. Browser-wide autofill is not implemented.

### Card autofill demo

- Fill a sample checkout's cardholder, card number, expiration, and security code from a saved card.
- Mask the card number and security code by default; bank accounts and card PINs are never used.
- Show a local confirmation; no payment is processed and no card data is sent.

## Technology

| Area                             | Implementation                             |
| -------------------------------- | ------------------------------------------ |
| Interface                        | React, JavaScript, HTML, CSS, Lucide icons |
| Development and build            | Vite                                       |
| Secure randomness and encryption | Web Crypto API                             |
| Local database                   | IndexedDB                                  |
| Unit tests                       | Node.js test runner                        |
| End-to-end tests                 | Playwright with Google Chrome              |
| Formatting                       | Prettier                                   |

## Getting started

Install **Node.js 22.12+ or Node.js 24**, with npm. Google Chrome is required for the browser tests.

Clone the repository and open the project directory:

```powershell
git clone https://github.com/CS-528-Team-4/Password-Manager-Tool.git
cd Password-Manager-Tool
```

If you already have the project open, use its existing directory instead.

Install dependencies and start the development server:

```powershell
npm.cmd ci
npm.cmd run dev
```

Always open **http://127.0.0.1:5173/** in the same browser profile. Both development and production preview use this address. Keep the server terminal running. If port 5173 is occupied, the new server stops with an error instead of selecting another port. Stop the previous server with Ctrl+C before switching between development and preview.

The commands use `npm.cmd` to avoid PowerShell's `npm.ps1` execution-policy error. On macOS, Linux, or Command Prompt, `npm` can be used instead.

## Using the app

1. **Set up the vault.** Enter an email for the local profile, create a master password, and confirm it. Setup requires at least 12 characters with uppercase letters, lowercase letters, and a digit, plus an acknowledgment that the password differs from other accounts. No online account is created or email sent.
2. **Generate a password.** Open Password Generator, adjust the length and character sets, and regenerate or copy the result. Save as a login opens a draft; complete the title and save it to store the entry.
3. **Save information.** Open a vault category and click **+**. Wallet offers separate **Cards** and **Accounts** options. Add tags or mark an item as a favorite as needed.
4. **Try autofill.** Save a login with a website, username, and password. Open Autofill Demo and select its platform card. Use the key icon beside the username field to view matching accounts.
5. **Lock and return.** Click the account control in the header to lock. Refreshing the page also requires unlocking the vault again.

For a fictional test login, use a website such as `https://portal.example.com`, username `demo.student`, and a password used only for this demonstration.

## Card autofill demo

Save a fictional payment card under **Wallet → Cards**, then open **Card Autofill Demo** in the sidebar. Choose a saved card to fill its cardholder name, card number, expiration, and security code in a sample checkout. The picker displays only the card title and last four digits. Bank accounts are excluded, and the card PIN is never used.

Card numbers and security codes are masked by default. Complete any missing fields, then click **Complete demo checkout** to show a local confirmation. No payment is processed or data submitted. Completing the demo, clearing the form, or locking the vault clears the payment fields.

## Security design

### Password generation and entropy

The generator uses `crypto.getRandomValues()` and **rejection sampling** to select characters without modulo bias. It does not use `Math.random()`.

Each password position is sampled independently from the selected alphabet. Enabling a character set makes its characters eligible; it does not guarantee every selected set appears in every generated password.

Entropy is calculated as:

```text
entropy in bits = password length × log2(alphabet size)
```

This describes the generator's search space. The strength display is a heuristic; it is not a guarantee of resistance to every attack or an exact cracking-time prediction.

### Encryption and persistence

| Property                      | Implementation                               |
| ----------------------------- | -------------------------------------------- |
| Password-based key derivation | PBKDF2 with HMAC-SHA-256                     |
| Iterations                    | 600,000                                      |
| Salt                          | Random 16 bytes per vault                    |
| Encryption                    | AES-256-GCM with a non-extractable CryptoKey |
| IV                            | Fresh random 12 bytes per save               |
| Database                      | `team4-vault`                                |
| Object store / record key     | `vault` / `main`                             |

The app encrypts vault contents before writing them to IndexedDB. The persisted record contains the format version, salt, IV, and authenticated ciphertext. The profile email, items, tags, and lock preferences are inside the encrypted contents. The master password and encryption key are not persisted.

While unlocked, decrypted data is available in application memory. Locking clears the active session and populated autofill fields. A read-and-compare operation within the write transaction rejects updates based on an outdated vault record. If a conflict occurs, reload and unlock to refresh before reapplying changes.

### Storage boundaries and limitations

- The vault belongs to the **browser profile and origin**: scheme, hostname, and port. `localhost`, `127.0.0.1`, and different ports have separate storage.
- Development and preview are configured to share `http://127.0.0.1:5173/`. Data previously saved on another address or port remains separate; this configuration does not migrate it.
- Clearing site data removes the vault. There is no recovery, backup/export, cloud synchronization, or master-password reset.
- Web Crypto requires localhost or HTTPS in supported browsers.
- Copied passwords remain on the clipboard until replaced or cleared by the user/system.
- Biometric unlock, external website autofill, per-item password re-prompts, password import, and passphrase generation are not implemented.

This course prototype has automated checks but has not received an independent security audit.

## Testing

Run the formatting check, unit tests, and production build:

```powershell
npm.cmd run format:check
npm.cmd test
npm.cmd run build
```

To test the production build end to end, start a preview in one terminal:

```powershell
npm.cmd run preview
```

Keep it running. In a second terminal in the same project directory:

```powershell
npm.cmd run test:browser
```

The browser script targets `http://127.0.0.1:5173` by default. Run either development or preview, one at a time. Browser tests use a separate browser context, so your personal vault is not used by the tests.

| Test group        | Coverage                                                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Generator         | Lengths, allowed character sets, invalid options, ambiguous-character exclusion, entropy                                   |
| Encryption        | Encrypt/decrypt round trip, distinct IVs, wrong-password rejection, ciphertext tampering                                   |
| Platform matching | Parsed hostnames, Google aliases, unrelated/lookalike domains, custom platform cards                                       |
| Browser flow      | Setup/unlock, item creation/editing/deletion, all vault categories, reload persistence, favorites, tags, search, sorting   |
| Autofill          | Platform cards, matching accounts, automatic fill, multiple-account selection, masking, clear/reset, local-only submission |
| Card checkout     | Saved-card fill, masked card number, no network requests on checkout, form reset, clearing on lock                         |
| Session/storage   | Lock preferences, simulated inactivity lock, clearing on lock, rejection of stale-tab saves                                |
| Regressions       | Locking from each vault category, unchanged ciphertext after lock/unlock, Escape keeps unsaved drafts                      |
| Layout            | Mobile overflow check and review screenshots                                                                               |

Browser checks use a separate, temporary browser context and fictional credentials. Review images are written to ignored `tmp/`. Automated checks support the team's review; the assignment still requires the team to understand and verify its randomness implementation.

## Codebase structure

```text
src/
  main.jsx                       React entry point and stylesheet imports
  App.jsx                        Shared session state and application actions
  components/
    auth/                        Vault setup, unlock, and dialogs
    demo/                        Platform cards, logos, practice login, and card checkout
    generator/                   Password generator screen
    layout/                      Brand, header, and sidebar
    settings/                    Application settings
    vault/                       Item editor, list, and help drawer
  config/
    vaultConfig.js               Navigation and item field definitions
  lib/
    demo/platforms.js            Platform definitions and hostname matching
    security/generator.js       Password sampling and entropy
    security/vaultCrypto.js     Key derivation and encryption
    storage/vaultStore.js       IndexedDB and transactional save protection
  styles/
    app.css                      Application theme, layout, and interactions
    demo.css                     Platform-card and practice-login styling
tests/
  security.test.js               Generator and encryption checks
  platforms.test.js              Platform matching checks
scripts/
  browser-check.mjs              End-to-end Chrome checks
docs/
  ARCHITECTURE.md                Data flow and maintenance guide
```

See [the architecture guide](docs/ARCHITECTURE.md) for implementation details and [the AI usage statement](AI_USAGE.md) for documented assistance and team review responsibilities. Reference screenshots are under `references/screenshots/`; the assignment and proposal PDFs are in the project root.

Generated dependencies, builds, temporary artifacts, and environment files are excluded through `.gitignore`.

## Comparison with the Avast reference

The interface follows the reference's navy theme, orange active navigation, vault categories, password display, settings controls, help drawer, and setup checklist.

Our generator provides independent uppercase/lowercase controls to satisfy the assignment, rather than the reference's Letters/Mixed case combination, and adds an option to avoid ambiguous characters. It displays entropy and a three-level strength label instead of a cracking-time estimate.

Other differences from the reference:

- **Account and recovery:** Avast's setup uses an Avast Account and offers a downloadable recovery key. This app creates a local profile only, and a forgotten master password cannot be recovered.
- **Storage:** the encrypted vault is stored in one browser profile and origin, with no synchronization, export, or import.
- **Per-item protection:** the reference can require the vault password before opening an individual card. This app protects the whole vault with the master password and automatic lock.
- **Autofill:** the reference runs as a browser extension. This app demonstrates autofill only on local practice login and checkout pages.

## Submission checklist

- [ ] Review the source and verify secure randomness as a team.
- [ ] Complete the 3–5 page report covering design choices, randomness, and comparison with Avast.
- [ ] Review and finalize the AI usage statement.
- [ ] Prepare the in-class presentation and demonstration.
- [ ] Check submission files and remove or redact sensitive reference screenshots before sharing.

The README explains the implementation; it does not replace the required report or presentation.

## Technical references

- [Web Crypto: getRandomValues](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)
- [Web Crypto: deriveKey](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey)
- [Web Crypto: encrypt](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Vite documentation](https://vite.dev/guide/)
