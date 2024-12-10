import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dns from 'dns';

dns.setDefaultResultOrder('verbatim');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@medplum/react': '/src/components/medplum_react',
    },
  },
  server: {
    host: 'localhost',
    port: 3000,
  },
});
