import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generatePassword,
  defaults,
  alphabet,
  entropy,
} from '../src/generator.js';
import { deriveKey, seal, unseal } from '../src/vault.js';
test('generator respects each alphabet and every supported length', () => {
  for (const flag of ['lower', 'upper', 'numbers', 'symbols'])
    for (const length of [4, 20, 128]) {
      const o = {
        lower: false,
        upper: false,
        numbers: false,
        symbols: false,
        [flag]: true,
        length,
      };
      const pool = alphabet(o);
      for (let i = 0; i < 100; i++) {
        const pw = generatePassword(o);
        assert.equal(pw.length, length);
        assert.ok([...pw].every((c) => pool.includes(c)));
      }
    }
});
test('invalid options rejected, ambiguous characters omitted, entropy calculated', () => {
  assert.throws(() =>
    generatePassword({
      ...defaults,
      lower: false,
      upper: false,
      numbers: false,
      symbols: false,
    }),
  );
  assert.throws(() => generatePassword({ ...defaults, length: 0 }));
  assert.ok(
    !/[Il1O0o]/.test(
      generatePassword({ ...defaults, length: 128, ambiguous: true }),
    ),
  );
  assert.equal(entropy({ length: 20, numbers: true }), 20 * Math.log2(10));
});
test('vault round trip, unique IVs, wrong password and tampering rejection', async () => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey('test master password', salt);
  const data = {
    email: 'test@example.com',
    items: [{ password: 'private-value' }],
  };
  const a = await seal(key, data),
    b = await seal(key, data);
  assert.deepEqual(await unseal(key, a), data);
  assert.notDeepEqual(a.iv, b.iv);
  assert.ok(!JSON.stringify(a).includes('private-value'));
  const wrong = await deriveKey('wrong password', salt);
  await assert.rejects(() => unseal(wrong, a));
  a.ciphertext[0] ^= 1;
  await assert.rejects(() => unseal(key, a));
});
