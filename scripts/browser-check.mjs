import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
await mkdir('tmp', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
try {
  await page.goto('http://127.0.0.1:5173');
  await page.getByRole('dialog').waitFor();
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  await page
    .getByRole('heading', { name: 'Password Generator', exact: true })
    .waitFor();
  assert.equal((await page.locator('.password').innerText()).length, 20);
  await page.getByLabel('Password length', { exact: true }).fill('32');
  assert.equal((await page.locator('.password').innerText()).length, 32);
  await page.screenshot({ path: 'tmp/app-generator.png', fullPage: true });
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
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'example.com', exact: true }).click();
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
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'Test card', exact: true }).waitFor();
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
    'Browser checks passed: generator, setup, create/edit/delete, favorites, persistence, incorrect password, mobile layout, no runtime errors.',
  );
} finally {
  await browser.close();
}
