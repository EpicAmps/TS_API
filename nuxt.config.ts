export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss'],
  nitro: {
    experimental: {
      wasm: true
    }
  }
})