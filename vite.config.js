import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/Pablo-Fotografia/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        bodas: resolve(__dirname, 'pages/bodas.html'),
        quince: resolve(__dirname, 'pages/quince-anos.html'),
        bookpro: resolve(__dirname, 'pages/bookpro.html'),
        vistas: resolve(__dirname, 'pages/vistas.html'),
      },
    },
  },
});
