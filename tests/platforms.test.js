import test from 'node:test';
import assert from 'node:assert/strict';
import {
  websiteHost,
  matchesPlatform,
  platformsFor,
  samplePlatforms,
} from '../src/lib/demo/platforms.js';
const login = (website) => ({
  type: 'Logins',
  values: {
    Title: 'Test',
    Website: website,
    Username: 'sample',
    Password: 'fictional',
  },
});
test('platform matching uses parsed hostnames rather than substrings', () => {
  const google = samplePlatforms[0];
  for (const site of [
    'google.com',
    'https://www.google.com/login',
    'https://accounts.google.com',
  ])
    assert.equal(matchesPlatform(login(site), google), true);
  for (const site of [
    'https://google.com.evil.example',
    'https://evil.example/?site=google.com',
    'https://google.com@evil.example',
    'javascript:google.com',
    'https://youtube.com',
  ])
    assert.equal(matchesPlatform(login(site), google), false);
  assert.equal(websiteHost(''), null);
  assert.equal(websiteHost('https://user:pass@google.com'), null);
  assert.equal(
    matchesPlatform(
      {
        ...login('google.com'),
        values: { Website: 'google.com', Username: '', Password: 'test' },
      },
      google,
    ),
    false,
  );
});
test('custom saved websites become cards and canonical domains are not duplicated', () => {
  const result = platformsFor([
    login('https://portal.example.org/login'),
    login('https://portal.example.org/other'),
    login('https://accounts.google.com'),
  ]);
  assert.equal(result.length, samplePlatforms.length + 1);
  assert.equal(result.filter((p) => p.host === 'portal.example.org').length, 1);
});
