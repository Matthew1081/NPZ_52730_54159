import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      
      devOptions: {
        enabled: true
      },
      
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      
      manifest: {
        name: 'Osobisty Asystent Finansowy',
        short_name: 'Asystent',
        description: 'Zarządzaj swoimi finansami nawet offline',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/vite.svg', 
            sizes: '192x192',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
})