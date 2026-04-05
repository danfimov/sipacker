import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react({
      // Allow JSX in .js files
      include: '**/*.{jsx,js}',
    }),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'SIPacker',
        short_name: 'SIPacker',
        description: 'Онлайн-редактор паков для Своей Игры (SiGame Владимиря Хиля)',
        theme_color: '#4248fb',
        background_color: '#1e1e1e',
        display: 'standalone',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  resolve: {
    alias: {
      components: '/src/components',
      routes: '/src/routes',
      localStorage: '/src/localStorage',
      reducers: '/src/reducers',
      store: '/src/store',
      assets: '/src/assets',
      utils: '/src/utils.js',
      consts: '/src/consts.js',
    }
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) {
              return 'vendor-router'
            }
            if (
              id.includes('@emotion/') ||
              id.includes('@mui/system') ||
              id.includes('@mui/private-theming') ||
              id.includes('@mui/styled-engine') ||
              id.includes('@mui/utils') ||
              id.includes('@mui/material/styles') ||
              id.includes('@mui/material/colors') ||
              id.includes('@mui/material/utils') ||
              id.includes('@popperjs/') ||
              id.includes('react-transition-group') ||
              id.includes('/react-dom/') ||
              id.includes('/react/') ||
              id.includes('/react@') ||
              id.includes('stylis') ||
              id.includes('@babel/runtime')
            ) {
              return 'vendor-mui-core'
            }
            if (id.includes('@mui/material')) {
              return 'vendor-mui-components'
            }
            if (id.includes('xml-js') || id.includes('xml-escape') || id.includes('transliteration')) {
              return 'vendor-xml'
            }
            if (id.includes('jszip') || id.includes('file-saver') || id.includes('dexie')) {
              return 'vendor-storage'
            }
            if (id.includes('@dnd-kit/')) {
              return 'vendor-dnd'
            }
            if (id.includes('formik') || id.includes('yup') || id.includes('dayjs') || id.includes('classnames') || id.includes('decimal.js') || id.includes('just-clone')) {
              return 'vendor-utils'
            }
          }
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
}))