import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,       // listen on 0.0.0.0 — makes Vite reachable via LAN IP
    port: 5173,
    strictPort: true, // fail fast if 5173 is taken
    // Allow any host header so mobile browsers don't get "Invalid Host header"
    allowedHosts: 'all',
  },
})
