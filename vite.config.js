import { defineConfig } from 'vite';

// IndexedDB belongs to an origin. Keep dev and preview on the same address.
const localServer = {
  host: '127.0.0.1',
  port: 5173,
  strictPort: true,
};

export default defineConfig({
  server: { ...localServer },
  preview: { ...localServer },
});
