import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: process.env.PORT || 4173,
    host: true, // Needed for the Docker Container port mapping to work
    strictPort: true,
    allowedHosts: ['anniversary-game-jxjc.onrender.com']
  },
  preview: {
    port: process.env.PORT || 4173,
    host: true, // Needed for the Docker Container port mapping to work
    strictPort: true,
    allowedHosts: ['anniversary-game-jxjc.onrender.com']
  }
})