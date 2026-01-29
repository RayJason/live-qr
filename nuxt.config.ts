// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  app: {
    head: {
      titleTemplate: '%s - Anti-Lost',
      title: 'Anti-Lost',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-auth-utils',
    '@nuxtjs/i18n'
  ],
  i18n: {
    vueI18n: './i18n.config.ts',
    locales: [
      { code: 'en', file: 'en.json' },
      { code: 'zh', file: 'zh.json' },
      { code: 'ja', file: 'ja.json' },
      { code: 'ko', file: 'ko.json' }
    ],
    lazy: true,
    langDir: 'translations',
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  } as any,
  components: [
    {
      path: '~/components',
      pathPrefix: false,
      ignore: ['**/*.ts'],
    },
  ],
  css: ['./assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    oauth: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      }
    }
  }
})
