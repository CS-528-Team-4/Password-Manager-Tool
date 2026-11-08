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
