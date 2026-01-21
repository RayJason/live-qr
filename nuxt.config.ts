import { resolve } from 'path'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@sidebase/nuxt-auth'
  ],
  components: [
    {
      path: '~/components',
      pathPrefix: false,
      ignore: ['**/*.ts'],
    },
  ],
  auth: {
    baseURL: 'http://localhost:3000/api/auth',
    provider: {
      type: 'authjs'
    }
  },
  css: ['./app/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  alias: {
    'next-auth/core': resolve(process.cwd(), 'node_modules/next-auth/core'),
    '@': resolve(process.cwd(), './')
  }
})
