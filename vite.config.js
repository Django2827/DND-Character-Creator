import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/DND-Character-Creator/',
  optimizeDeps: {
    entries: ['index.html', 'viewer.html'],
  },
})
