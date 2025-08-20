export default defineNuxtConfig({
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss'],
  nitro: {
    experimental: {
      wasm: true
    }
  }
})