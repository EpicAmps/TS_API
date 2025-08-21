<template>
  <div class="min-h-screen bg-gray-900 text-white p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          Yet Another Tonestack Calculator
        </h1>
        <p class="text-gray-400">Interactive guitar tone stack simulation and frequency response analyzer</p>
      </header>

      <!-- Simple test content for now -->
      <div class="text-center">
        <p class="text-xl mb-4">Tonestack Calculator is Loading...</p>
        <p class="text-gray-400">This is a test to see if the page loads correctly</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Set page title
useHead({
  title: 'Yet Another Tonestack Calculator - Guitar Tone Stack Analysis'
});
</script>