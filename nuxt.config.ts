// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },

  // SSG for SEO + static hosting (GitHub Pages / CDN)
  ssr: true,

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
  nitro: {
    preset: 'static',
  },
})
