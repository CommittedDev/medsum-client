import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dns from 'dns';

dns.setDefaultResultOrder('verbatim');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@medplum/react': '/src/components/medplum_react',
      src: '/src',
    },
  },
  server: {
    host: 'localhost',
    port: 3000,
  },
});
