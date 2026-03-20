import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // sockjs-client references `global` which isn't defined in browsers by default.
  // Vite replaces this at bundle time.
  define: {
    global: 'globalThis',
  },
})
