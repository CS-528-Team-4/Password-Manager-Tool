const enc = new TextEncoder();
export async function deriveKey(password, salt) {
  const material = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(salt),
      iterations: 600000,
      hash: 'SHA-256',
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}
export async function seal(key, data) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(JSON.stringify(data)),
  );
  return {
    iv: Array.from(iv),
    ciphertext: Array.from(new Uint8Array(ciphertext)),
  };
}
export async function unseal(key, record) {
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(record.iv) },
    key,
    new Uint8Array(record.ciphertext),
  );
  return JSON.parse(new TextDecoder().decode(plain));
}
function db() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('team4-vault', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('vault');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function readVault() {
  const database = await db();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('vault');
    const request = tx.objectStore('vault').get('main');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => database.close();
  });
}
// Read and compare within the same read/write transaction to avoid stale-tab overwrites.
export async function writeVault(record, expected) {
  const database = await db();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('vault', 'readwrite');
    const store = tx.objectStore('vault');
    let conflict = false;
    const request = store.get('main');
    request.onsuccess = () => {
      if (JSON.stringify(request.result) !== JSON.stringify(expected)) {
        conflict = true;
        tx.abort();
        return;
      }
      store.put(record, 'main');
    };
    tx.oncomplete = () => {
      database.close();
      resolve();
    };
    tx.onabort = () => {
      database.close();
      reject(
        Error(
          conflict
            ? 'Vault changed in another tab. Reload and unlock before saving.'
            : 'Vault save failed.',
        ),
      );
    };
    tx.onerror = () => {};
  });
}
