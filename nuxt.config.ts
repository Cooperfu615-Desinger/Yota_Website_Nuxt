// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },

  // SSG for SEO + static hosting (GitHub Pages / CDN)
  ssr: true,

  // 停用 App Manifest：
  // Nuxt 3.9+ 預設開啟此功能，會在客戶端輪詢 /_nuxt/builds/latest.json
  // 每次 nuxt generate 產生新 build ID → 偵測到版本不符 → 強制 reload
  // GitHub Pages CDN 快取尚未更新 → 舊 HTML 引用舊 chunk → 404 → hydration 失敗
  // 此外在 dev 模式下 #app-manifest 虛擬模組無法正確解析 → 同樣導致 hydration 失效
  experimental: {
    appManifest: false,
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
  ],

  googleFonts: {
    families: {
      'Noto Sans TC': [400, 500, 600, 700, 800, 900],
    },
    display: 'swap',
    preload: true,
  },

  css: ['~/assets/css/main.css'],

  app: {
    // GitHub Pages 子路徑：https://xxx.github.io/Yota_Website_Nuxt/
    baseURL: '/Yota_Website_Nuxt/',
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
      htmlAttrs: { lang: 'zh-TW' },
      meta: [
        { name: 'theme-color', content: '#0F0020' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'format-detection', content: 'telephone=no' },
        // Robots — update to index, follow when ready for production
        { name: 'robots', content: 'noindex, nofollow' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  // Nitro static preset for nuxt generate
  // 輸出到 docs/ 讓 GitHub Pages main branch 可直接讀取
  nitro: {
    preset: 'static',
    output: {
      publicDir: 'docs',
    },
    // dev server 不監看 docs/ 目錄，避免靜態輸出觸發反覆 reload
    watchOptions: {
      ignored: ['**/docs/**'],
    },
  },
})
