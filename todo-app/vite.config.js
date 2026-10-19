import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// base: './' と outDir: 'docs' は GitHub Pages（main ブランチの /docs）で公開するための設定
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'docs' },
})
