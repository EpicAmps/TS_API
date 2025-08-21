export default defineNuxtConfig({
  devtools: { enabled: false },
  srcDir: 'src/',
  css: ['assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss'],
  ssr: true,
  nitro: {
    experimental: {
      wasm: true
    }
  }
})