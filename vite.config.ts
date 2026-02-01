import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: '/BRUHsailer/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    copyPublicDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    },
    extensions: ['.ts', '.js', '.vue']
  }
});
