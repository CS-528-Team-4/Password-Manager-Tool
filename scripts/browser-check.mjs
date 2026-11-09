import { mkdir } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
await mkdir('tmp', { recursive: true });
const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
try {
  await page.goto(baseURL);
  await page.getByRole('dialog').waitFor();
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  await page
    .getByRole('heading', { name: 'Password Generator', exact: true })
    .waitFor();
  assert.equal((await page.locator('.password').innerText()).length, 20);
  await page.getByLabel('Password length', { exact: true }).fill('32');
  assert.equal((await page.locator('.password').innerText()).length, 32);
  await page.screenshot({ path: 'tmp/app-generator.png', fullPage: true });
  // Regression: a vault category opened before any vault exists shows the
  // locked empty state with a setup action instead of crashing.
  await page.getByRole('button', { name: 'Logins 0', exact: true }).click();
  await page
    .getByRole('heading', { name: 'Your vault, secured', exact: true })
    .waitFor();
  await page
    .getByRole('button', { name: 'Set up vault', exact: true })
    .waitFor();
  assert.deepEqual(errors, []);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Set up vault', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill('team4@example.com');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page
    .getByLabel('I use a different password for other accounts')
    .check();
  await page
    .getByLabel('Master password', { exact: true })
    .fill('Team4-test-password!');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Confirm master password').fill('Team4-test-password!');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('heading', { name: 'Great!', exact: true }).waitFor();
  await page.screenshot({ path: 'tmp/app-setup-complete.png', fullPage: true });
  await page
    .getByRole('button', { name: 'Continue Setup', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Open my vault', exact: true })
    .click();
  await page.getByRole('button', { name: 'Lock vault', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Logins 0', exact: true }).click();
  await page.getByRole('button', { name: 'Add item', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill('Example');
  await page.getByLabel('Website', { exact: true }).fill('example.com');
  await page.getByLabel('Username', { exact: true }).fill('student');
  await page
    .getByLabel('Password', { exact: true })
    .fill('private-test-secret');
  await page.getByLabel('Mark as favorite').check();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page
    .getByRole('button', { name: 'example.com', exact: true })
    .waitFor();
  await page
    .getByRole('button', { name: 'Autofill Demo', exact: true })
    .click();
  await page.getByRole('button', { name: /Example example.com/ }).click();
  assert.equal(await page.getByLabel('Demo username').inputValue(), 'student');
  assert.equal(
    await page.getByLabel('Demo password', { exact: true }).inputValue(),
    'private-test-secret',
  );
  assert.equal(
    await page
      .getByLabel('Demo password', { exact: true })
      .getAttribute('type'),
    'password',
  );
  const demoRequests = [];
  const watchRequest = (request) => demoRequests.push(request.url());
  page.on('request', watchRequest);
  await page
    .getByRole('button', { name: 'Sign in (demo)', exact: true })
    .click();
  await page
    .getByText(
      'Demo complete. No account was authenticated and no credentials were sent.',
      { exact: true },
    )
    .waitFor();
  assert.deepEqual(demoRequests, []);
  page.off('request', watchRequest);
  await page.screenshot({ path: 'tmp/autofill-demo.png', fullPage: true });
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  assert.equal(
    await page.getByLabel('Demo password', { exact: true }).inputValue(),
    '',
  );
  await page
    .getByRole('button', { name: 'Show saved logins', exact: true })
    .click();
  await page.getByRole('button', { name: 'Use student', exact: true }).click();
  await page
    .getByRole('button', { name: 'team4@example.com', exact: true })
    .click();
  // The demo form clears in an effect after the locked render, so wait for
  // the cleared state instead of reading it once immediately after the click.
  await expect(page.getByLabel('Demo username')).toHaveValue('');
  await expect(page.getByLabel('Demo password', { exact: true })).toHaveValue(
    '',
  );
  await page.reload();
  await page.getByRole('dialog').waitFor();
  await page
    .getByLabel('Master password', { exact: true })
    .fill('wrong-password');
  await page.getByRole('button', { name: 'Unlock vault', exact: true }).click();
  await page.getByRole('alert').waitFor();
  await page
    .getByLabel('Master password', { exact: true })
    .fill('Team4-test-password!');
  await page.getByRole('button', { name: 'Unlock vault', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Logins 1', exact: true }).click();
  await page.getByRole('button', { name: 'example.com', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill('Updated example');
  // Regression: Escape must not silently discard an unsaved edit.
  await page.keyboard.press('Escape');
  await page
    .getByRole('heading', { name: 'Edit a Login', exact: true })
    .waitFor();
  assert.equal(
    await page.getByLabel('Title', { exact: true }).inputValue(),
    'Updated example',
  );
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'example.com', exact: true }).click();
  assert.equal(
    await page.getByLabel('Title', { exact: true }).inputValue(),
    'Updated example',
  );
  await page.getByRole('button', { name: 'Delete item', exact: true }).click();
  // Escape dismisses the delete confirmation and returns to the open editor.
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page
    .getByRole('heading', { name: 'Edit a Login', exact: true })
    .waitFor();
  await page.getByRole('button', { name: 'Delete item', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Delete item', exact: true })
    .click();
  await page.getByText('No items yet', { exact: true }).waitFor();
  await page
    .getByRole('button', { name: 'How to add more passwords', exact: true })
    .click();
  const helpDialog = page.getByRole('dialog', {
    name: 'How to add more passwords',
    exact: true,
  });
  assert.equal(
    await helpDialog
      .getByRole('button', {
        name: 'Save your passwords when prompted',
        exact: true,
      })
      .getAttribute('aria-expanded'),
    'true',
  );
  await helpDialog
    .getByRole('button', { name: 'Import your passwords', exact: true })
    .click();
  await helpDialog
    .getByRole('button', { name: 'Import Now', exact: true })
    .waitFor();
  await helpDialog
    .getByRole('button', { name: 'Add your passwords manually', exact: true })
    .click();
  await page.screenshot({
    path: 'tmp/password-help-review.png',
    fullPage: true,
  });
  await helpDialog
    .getByRole('button', { name: 'Close help', exact: true })
    .click();
  await page.getByRole('button', { name: 'Wallet 0', exact: true }).click();
  await page.getByRole('button', { name: 'Add item', exact: true }).click();
  await page.getByRole('button', { name: 'Cards', exact: true }).click();
  await page
    .getByRole('heading', { name: 'Add a Card', exact: true })
    .waitFor();
  await page.getByLabel('Title', { exact: true }).fill('Test card');
  await page
    .getByLabel('Card number', { exact: true })
    .fill('4111111111111111');
  assert.equal(
    await page.getByLabel('Card number', { exact: true }).getAttribute('type'),
    'password',
  );
  await page.getByLabel('CVV/CVC', { exact: true }).fill('123');
  await page.getByLabel('Cardholder', { exact: true }).fill('Demo Student');
  await page.getByLabel('Expiration', { exact: true }).fill('2028-12');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'Test card', exact: true }).waitFor();
  await page
    .getByRole('button', { name: 'Card Autofill Demo', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Choose a saved card', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Use card Test card', exact: true })
    .click();
  assert.equal(
    await page.getByLabel('Checkout cardholder').inputValue(),
    'Demo Student',
  );
  assert.equal(
    await page.getByLabel('Checkout card number', { exact: true }).inputValue(),
    '4111111111111111',
  );
  assert.equal(
    await page.getByLabel('Checkout expiration').inputValue(),
    '2028-12',
  );
  assert.equal(
    await page
      .getByLabel('Checkout security code', { exact: true })
      .inputValue(),
    '123',
  );
  assert.equal(
    await page
      .getByLabel('Checkout card number', { exact: true })
      .getAttribute('type'),
    'password',
  );
  await page.screenshot({ path: 'tmp/card-checkout.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.setViewportSize({ width: 1600, height: 1000 });
  const paymentRequests = [];
  const watchPayment = (r) => paymentRequests.push(r.url());
  page.on('request', watchPayment);
  await page
    .getByRole('button', { name: 'Complete demo checkout', exact: true })
    .click();
  await page
    .getByText('No payment was processed and no card details were sent.', {
      exact: true,
    })
    .waitFor();
  assert.deepEqual(paymentRequests, []);
  page.off('request', watchPayment);
  await page
    .getByRole('button', { name: 'Try another card', exact: true })
    .click();
  assert.equal(
    await page.getByLabel('Checkout card number', { exact: true }).inputValue(),
    '',
  );
  await page
    .getByRole('button', { name: 'Choose a saved card', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Use card Test card', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'team4@example.com', exact: true })
    .click();
  // The checkout form also clears in an effect after the locked render.
  await expect(
    page.getByLabel('Checkout card number', { exact: true }),
  ).toHaveValue('');
  await expect(
    page.getByLabel('Checkout security code', { exact: true }),
  ).toHaveValue('');
  await page.getByRole('button', { name: 'Unlock vault', exact: true }).click();
  await page
    .getByLabel('Master password', { exact: true })
    .fill('Team4-test-password!');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Unlock vault', exact: true })
    .click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Wallet 1', exact: true }).click();

  await page.getByRole('button', { name: 'Add item', exact: true }).click();
  await page.getByRole('button', { name: 'Accounts', exact: true }).click();
  await page
    .getByRole('heading', { name: 'Add an Account', exact: true })
    .waitFor();
  await page.getByLabel('Title', { exact: true }).fill('Test bank');
  await page.getByLabel('Account number', { exact: true }).fill('123456789');
  await page
    .getByLabel('Branch/Routing number', { exact: true })
    .fill('987654321');
  await page.getByLabel('Bank name', { exact: true }).fill('Example bank');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'Test bank', exact: true }).waitFor();
  await page.reload();
  await page
    .getByLabel('Master password', { exact: true })
    .fill('Team4-test-password!');
  await page.getByRole('button', { name: 'Unlock vault', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Wallet 2', exact: true }).click();
  await page.getByRole('button', { name: 'Test bank', exact: true }).click();
  assert.equal(
    await page.getByLabel('Account number', { exact: true }).inputValue(),
    '123456789',
  );
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Test card', exact: true }).click();
  assert.equal(
    await page.getByLabel('Card number', { exact: true }).inputValue(),
    '4111111111111111',
  );
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Automatic lock duration').selectOption('1');
  await page.getByText('Automatic lock updated', { exact: true }).waitFor();
  await page
    .getByRole('button', { name: 'Password Generator', exact: true })
    .click();
  const generated = await page.locator('.password').innerText();
  await page
    .getByRole('button', { name: 'Save as a login', exact: true })
    .click();
  assert.equal(
    await page.getByLabel('Password', { exact: true }).inputValue(),
    generated,
  );
  await page.getByLabel('Title', { exact: true }).fill('Generated login');
  await page.getByLabel('Website', { exact: true }).fill('generated.example');
  await page.getByLabel('Tags', { exact: true }).fill('School, Security');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page
    .getByRole('button', { name: 'generated.example', exact: true })
    .waitFor();
  await page.getByLabel('Search your vault').fill('School');
  await page
    .getByRole('button', { name: 'generated.example', exact: true })
    .waitFor();
  await page.getByLabel('Search your vault').fill('no-such-item');
  await page
    .getByRole('heading', { name: 'No matching items', exact: true })
    .waitFor();
  await page.getByLabel('Search your vault').fill('');
  await page.getByRole('button', { name: 'Website ↑', exact: true }).click();
  assert.equal(
    await page.locator('th[aria-sort]').getAttribute('aria-sort'),
    'descending',
  );
  const other = await page.context().newPage();
  await other.goto(baseURL);
  await other
    .getByLabel('Master password', { exact: true })
    .fill('Team4-test-password!');
  await other
    .getByRole('button', { name: 'Unlock vault', exact: true })
    .click();
  await other.getByRole('dialog').waitFor({ state: 'hidden' });
  await other.getByRole('button', { name: 'Settings', exact: true }).click();
  assert.equal(
    await other.getByLabel('Automatic lock duration').inputValue(),
    '1',
  );
  await other.getByRole('button', { name: 'Logins 1', exact: true }).click();
  await other
    .getByRole('button', { name: 'generated.example', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'generated.example', exact: true })
    .click();
  await page.getByLabel('Tags', { exact: true }).fill('School, Updated');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page
    .getByRole('button', { name: 'generated.example', exact: true })
    .waitFor();
  await other
    .getByLabel('Title', { exact: true })
    .fill('Stale overwrite attempt');
  await other.getByRole('button', { name: 'Save', exact: true }).click();
  await other
    .getByText(
      'Vault changed in another tab. Reload and unlock before saving.',
      { exact: true },
    )
    .waitFor();
  await other.close();
  // Exercise the remaining vault item types using synthetic data.
  await page.getByRole('button', { name: 'Notes 0', exact: true }).click();
  await page.getByRole('button', { name: 'Add item', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill('E2E secure note');
  await page
    .getByLabel('Notes', { exact: true })
    .fill('Synthetic note for the end-to-end check');
  // Regression: Escape keeps an unsaved new entry open with its contents.
  await page.keyboard.press('Escape');
  await page
    .getByRole('heading', { name: 'Add a Note', exact: true })
    .waitFor();
  assert.equal(
    await page.getByLabel('Notes', { exact: true }).inputValue(),
    'Synthetic note for the end-to-end check',
  );
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page
    .getByRole('button', { name: 'E2E secure note', exact: true })
    .waitFor();
  await page.getByRole('button', { name: 'Addresses 0', exact: true }).click();
  await page.getByRole('button', { name: 'Add item', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill('E2E address');
  await page.getByLabel('Street', { exact: true }).fill('123 Test Street');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page
    .getByRole('button', { name: 'E2E address', exact: true })
    .waitFor();
  await page.reload();
  await page
    .getByLabel('Master password', { exact: true })
    .fill('Team4-test-password!');
  await page.getByRole('button', { name: 'Unlock vault', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Notes 1', exact: true }).click();
  await page
    .getByRole('button', { name: 'E2E secure note', exact: true })
    .click();
  assert.equal(
    await page.getByLabel('Notes', { exact: true }).inputValue(),
    'Synthetic note for the end-to-end check',
  );
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Addresses 1', exact: true }).click();
  await page.getByRole('button', { name: 'E2E address', exact: true }).click();
  assert.equal(
    await page.getByLabel('Street', { exact: true }).inputValue(),
    '123 Test Street',
  );
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  // Regression: locking while a vault category is open shows the locked state
  // instead of crashing, and unlocking restores the same encrypted records.
  const storedVault = () =>
    page.evaluate(
      () =>
        new Promise((resolve, reject) => {
          const open = indexedDB.open('team4-vault', 1);
          open.onerror = () => reject(open.error);
          open.onsuccess = () => {
            const database = open.result;
            const get = database
              .transaction('vault')
              .objectStore('vault')
              .get('main');
            get.onerror = () => reject(get.error);
            get.onsuccess = () => {
              database.close();
              resolve(JSON.stringify(get.result));
            };
          };
        }),
    );
  const vaultBeforeLocking = await storedVault();
  for (const secret of ['Test card', '4111111111111111', 'E2E address'])
    assert.ok(!vaultBeforeLocking.includes(secret));
  for (const [category, count, item] of [
    ['Logins', 1, 'generated.example'],
    ['Favorites', 0, null],
    ['Wallet', 2, 'Test card'],
    ['Addresses', 1, 'E2E address'],
    ['Notes', 1, 'E2E secure note'],
  ]) {
    await page
      .getByRole('button', { name: `${category} ${count}`, exact: true })
      .click();
    await page
      .getByRole('button', { name: 'team4@example.com', exact: true })
      .click();
    await page
      .getByRole('heading', { name: 'Your vault, secured', exact: true })
      .waitFor();
    await page
      .getByText('Unlock your vault to view items', { exact: true })
      .waitFor();
    await page
      .getByRole('button', { name: `${category} 0`, exact: true })
      .waitFor();
    assert.deepEqual(errors, []);
    await page
      .getByRole('button', { name: 'Unlock vault', exact: true })
      .click();
    await page
      .getByLabel('Master password', { exact: true })
      .fill('Team4-test-password!');
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Unlock vault', exact: true })
      .click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await page
      .getByRole('button', { name: `${category} ${count}`, exact: true })
      .waitFor();
    if (item)
      await page.getByRole('button', { name: item, exact: true }).waitFor();
  }
  assert.equal(await storedVault(), vaultBeforeLocking);
  await page.getByRole('button', { name: 'Wallet 2', exact: true }).click();
  await page.getByRole('button', { name: 'Test card', exact: true }).click();
  assert.equal(
    await page.getByLabel('Card number', { exact: true }).inputValue(),
    '4111111111111111',
  );
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page
    .getByRole('button', { name: 'Autofill Demo', exact: true })
    .click();
  await page.getByRole('button', { name: /Google google.com/ }).click();
  assert.equal(await page.getByLabel('Demo username').inputValue(), '');
  await page
    .getByRole('button', { name: 'Show saved logins', exact: true })
    .click();
  await page
    .getByText('No saved login matches google.com.', { exact: true })
    .waitFor();
  await page
    .getByRole('button', { name: 'Close saved logins', exact: true })
    .click();
  await page.getByRole('button', { name: 'Add a login', exact: true }).click();
  assert.equal(
    await page.getByLabel('Website', { exact: true }).inputValue(),
    'https://google.com',
  );
  await page.getByLabel('Title', { exact: true }).fill('Google school');
  await page.getByLabel('Username', { exact: true }).fill('school@example.com');
  await page
    .getByLabel('Password', { exact: true })
    .fill('Fictional-Google-1!');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page
    .getByRole('button', { name: 'Autofill Demo', exact: true })
    .click();
  await page.getByRole('button', { name: /Google google.com/ }).click();
  assert.equal(
    await page.getByLabel('Demo username').inputValue(),
    'school@example.com',
  );
  await page
    .getByRole('button', { name: 'All platforms', exact: true })
    .click();
  await page.getByRole('button', { name: 'Logins 2', exact: true }).click();
  await page.getByRole('button', { name: 'Add item', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill('Google personal');
  await page
    .getByLabel('Website', { exact: true })
    .fill('https://accounts.google.com');
  await page
    .getByLabel('Username', { exact: true })
    .fill('personal@example.com');
  await page
    .getByLabel('Password', { exact: true })
    .fill('Fictional-Google-2!');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page
    .getByRole('button', { name: 'Autofill Demo', exact: true })
    .click();
  await page.screenshot({ path: 'tmp/platform-cards.png', fullPage: true });
  await page.getByRole('button', { name: /Google google.com/ }).click();
  assert.equal(await page.getByLabel('Demo username').inputValue(), '');
  await page
    .getByRole('button', { name: 'Use school@example.com', exact: true })
    .waitFor();
  await page
    .getByRole('button', { name: 'Use personal@example.com', exact: true })
    .click();
  assert.equal(
    await page.getByLabel('Demo password', { exact: true }).inputValue(),
    'Fictional-Google-2!',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'tmp/platform-mobile.png', fullPage: true });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page
    .getByRole('button', { name: 'All platforms', exact: true })
    .click();
  await page.clock.install();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Automatic lock duration').selectOption('5');
  await page.getByText('Automatic lock updated', { exact: true }).waitFor();
  await page.getByLabel('Automatic lock duration').selectOption('1');
  await page.getByText('Automatic lock updated', { exact: true }).waitFor();
  await page
    .getByRole('button', { name: 'Autofill Demo', exact: true })
    .click();
  await page.getByRole('button', { name: /Google google.com/ }).click();
  await page.clock.fastForward(61000);
  await page.getByText('Vault locked', { exact: true }).waitFor();
  assert.equal(
    await page.getByLabel('Demo password', { exact: true }).inputValue(),
    '',
  );
  await page.getByRole('button', { name: 'Unlock vault', exact: true }).click();
  await page
    .getByLabel('Master password', { exact: true })
    .fill('Team4-test-password!');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Unlock vault', exact: true })
    .click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole('button', { name: 'Password Generator', exact: true })
    .click();
  await page.screenshot({ path: 'tmp/app-mobile.png', fullPage: true });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
    false,
  );
  assert.deepEqual(errors, []);
  console.log(
    'Browser checks passed: generator, setup/unlock, CRUD, wallet cards/accounts, notes/addresses, favorites/tags/search/sort, persistence, wrong-password rejection, autofill with no network submission, stale-tab protection, lock preferences and timed idle lock, mobile layout, no runtime errors.',
  );
} catch (error) {
  if (errors.length) console.error('Page errors:', errors);
  await page.screenshot({ path: 'tmp/e2e-failure.png', fullPage: true });
  throw error;
} finally {
  await browser.close();
}
