import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import * as viteCompressionNS from 'vite-plugin-compression'
import path from 'path'

// vite-plugin-compression ships a CJS default export; under
// `verbatimModuleSyntax` the default/named distinction is lost, so we reach
// into `.default` with an explicit call signature to recover the factory.
type CompressionFactory = (options?: {
  algorithm?: 'gzip' | 'brotliCompress' | 'deflate' | 'deflateRaw'
  ext?: string
  verbose?: boolean
  threshold?: number
  disable?: boolean
}) => Plugin
const viteCompression = (viteCompressionNS as unknown as { default: CompressionFactory }).default

// NOTE: screenshots currently reference .svg placeholders under public/icons/.
// Replace them with real PNG screenshots before release and update `src`/`type`
// in the `screenshots` array below accordingly.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'favicon.svg',
        'icons/*.png',
        'icons/screenshot-*.svg',
        'fonts/*.woff2',
        'offline.html',
      ],
      manifest: {
        id: '/',
        name: '命运之轮 — Decision Roulette',
        short_name: '命运之轮',
        description: '输入选项，生成炫酷 3D 轮盘，把选择困难变成一场仪式感体验。',
        lang: 'zh-CN',
        theme_color: '#c96442',
        background_color: '#faf9f5',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        start_url: '/',
        dir: 'auto' as 'ltr' | 'rtl',
        categories: ['utilities', 'entertainment'],
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: '快速转盘',
            short_name: '转盘',
            description: '直接开始命运之轮',
            url: '/?action=spin',
            icons: [{ src: '/icons/pwa-192.png', sizes: '192x192' }],
          },
        ],
        screenshots: [
          {
            src: '/icons/screenshot-mobile.svg',
            sizes: '1080x1920',
            type: 'image/svg+xml',
            form_factor: 'narrow',
            label: '命运之轮主界面',
          },
          {
            src: '/icons/screenshot-wide.svg',
            sizes: '1920x1080',
            type: 'image/svg+xml',
            form_factor: 'wide',
            label: '命运之轮桌面端',
          },
        ],
        share_target: {
          action: '/',
          method: 'GET',
          params: {
            text: 'text',
          },
        },
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/share/],
        runtimeCaching: [
          {
            urlPattern: /\/fonts\/.*\.woff2$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'local-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
    // Both plugins only emit output during build; no-op in dev/serve.
    visualizer({
      filename: 'dist/stats.html',
      template: 'treemap',
      gzipSize: true,
      brotliSize: true,
    }),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-router-dom/')) {
            return 'router-vendor'
          }
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/')
          ) {
            return 'react-vendor'
          }
          return undefined
        },
      },
    },
  },
})
