import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/quik': {
        target: 'https://hydration-cycle-answering.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Host': 'hydration-cycle-answering.ngrok-free.dev',
        },
      },
    },
  },
})
