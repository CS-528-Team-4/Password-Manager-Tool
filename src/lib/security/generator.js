export const defaults = {
  length: 20,
  lower: true,
  upper: true,
  numbers: true,
  symbols: true,
  ambiguous: false,
};
export const sets = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/',
};
export function alphabet(options) {
  return Object.entries(sets)
    .filter(([k]) => options[k])
    .map(([, v]) => v)
    .join('')
    .split('')
    .filter((c) => !options.ambiguous || !'Il1O0o'.includes(c))
    .join('');
}
// Rejection sampling avoids modulo bias. Never use Math.random for passwords.
export function randomIndex(size) {
  if (!Number.isInteger(size) || size < 1 || size > 256)
    throw Error('Invalid alphabet size');
  const limit = 256 - (256 % size);
  const b = new Uint8Array(1);
  do {
    crypto.getRandomValues(b);
  } while (b[0] >= limit);
  return b[0] % size;
}
export function generatePassword(options) {
  const pool = alphabet(options);
  if (!pool) throw Error('Select at least one character set.');
  if (
    !Number.isInteger(options.length) ||
    options.length < 4 ||
    options.length > 128
  )
    throw Error('Choose a length from 4 to 128.');
  return Array.from(
    { length: options.length },
    () => pool[randomIndex(pool.length)],
  ).join('');
}
export function entropy(options) {
  const n = alphabet(options).length;
  return n ? options.length * Math.log2(n) : 0;
}
