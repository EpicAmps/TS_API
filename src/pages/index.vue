<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto p-6">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          Yet Another Tonestack Calculator
        </h1>
        <p class="text-gray-400">Interactive guitar tone stack simulation and frequency response analyzer</p>
      </header>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Tone Stack Selection -->
        <div class="bg-gray-800 p-6 rounded-lg border border-gray-600">
          <h2 class="text-xl font-bold mb-4">Tone Stack Selection</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Select Tone Stack:</label>
              <select class="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white">
                <option>Fender TMB</option>
                <option>Marshall JCM800</option>
                <option>Vox AC30</option>
                <option>Boneyard Ray</option>
                <option>RAT Distortion</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div class="bg-gray-800 p-6 rounded-lg border border-gray-600">
          <h2 class="text-xl font-bold mb-4">Controls</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Bass</label>
              <input type="range" min="0" max="1" step="0.01" value="0.5" class="w-full">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Mid</label>
              <input type="range" min="0" max="1" step="0.01" value="0.5" class="w-full">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Treble</label>
              <input type="range" min="0" max="1" step="0.01" value="0.5" class="w-full">
            </div>
          </div>
        </div>

        <!-- Frequency Response Chart -->
        <div class="lg:col-span-2">
          <FrequencyChart />
        </div>

        <!-- Audio Player -->
        <div class="lg:col-span-2">
          <AudioPlayer />
        </div>
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