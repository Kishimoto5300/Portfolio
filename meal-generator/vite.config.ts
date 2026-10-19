import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' と outDir: 'docs' は GitHub Pages（main ブランチの /docs）で公開するための設定
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'docs' },
});
