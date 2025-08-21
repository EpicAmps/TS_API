export default defineNuxtConfig({
  devtools: { enabled: false },
  srcDir: 'src/',
  css: ['assets/css/main.css'],
  srcDir: 'src/',
  modules: ['@nuxtjs/tailwindcss'],
  nitro: {
    experimental: {
      wasm: true
    }
  }
})