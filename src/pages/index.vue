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
              <label class="block text-sm font-medium mb-2">Select Marshall Preset:</label>
              <select 
                v-model="selectedMarshallPreset"
                @change="updateMarshallResponse"
                class="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="marshall-noon">All Knobs at Noon</option>
                <option value="marshall-modern">Modern Rock (B:10, M:11, T:1)</option>
                <option value="marshall-scooped">Scooped (B:9, M:3, T:Noon)</option>
                <option value="marshall-dimed">All Knobs Dimed</option>
              </select>
            </div>
            <div v-if="currentPreset" class="text-sm text-gray-400">
              <p><strong>{{ currentPreset.name }}</strong></p>
              <p>{{ currentPreset.description }}</p>
              <p>Bass: {{ Math.round(currentPreset.settings.bass * 10) }}, 
                 Mid: {{ Math.round(currentPreset.settings.mid * 10) }}, 
                 Treble: {{ Math.round(currentPreset.settings.treble * 10) }}</p>
            </div>
          </div>
        </div>

        <!-- Marshall Component Info -->
        <div class="bg-gray-800 p-6 rounded-lg border border-gray-600">
          <h2 class="text-xl font-bold mb-4">Marshall JCM800 Components</h2>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 class="font-semibold text-gray-300 mb-2">Resistors</h3>
              <ul class="space-y-1 text-gray-400">
                <li>R1: 33kΩ (slope)</li>
                <li>R2: 4.7kΩ (mid)</li>
                <li>R3: 82kΩ (bass load)</li>
              </ul>
            </div>
            <div>
              <h3 class="font-semibold text-gray-300 mb-2">Capacitors</h3>
              <ul class="space-y-1 text-gray-400">
                <li>C1: 220pF (treble)</li>
                <li>C2: 22nF (bass)</li>
                <li>C3: 220pF (slope)</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Frequency Response Chart -->
        <div class="lg:col-span-2">
          <FrequencyChart :frequency-data="frequencyData" />
        </div>

        <!-- Audio Player -->
        <div class="lg:col-span-2">
          <AudioPlayer 
            :marshall-preset="selectedMarshallPreset"
            @audio-processed="handleAudioProcessed"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Reactive state
const selectedMarshallPreset = ref('marshall-noon');
const frequencyData = ref<Array<{ frequency: number; magnitude: number; phase: number }>>([]);
const currentPreset = ref<any>(null);

// Update Marshall frequency response
async function updateMarshallResponse() {
  try {
    const response = await $fetch(`/api/marshall/${selectedMarshallPreset.value}`);
    
    if (response.success) {
      frequencyData.value = response.data.frequencyResponse;
      currentPreset.value = response.data.preset;
    }
  } catch (error) {
    console.error('Failed to update Marshall response:', error);
  }
}

// Handle audio processing results
function handleAudioProcessed(data: { frequencyResponse: any[]; processedAudio: number[] }) {
  frequencyData.value = data.frequencyResponse;
}

// Initialize on mount
onMounted(() => {
  updateMarshallResponse();
});

// Set page title
useHead({
  title: 'Marshall JCM800 Tone Stack Analysis - YATSC Implementation'
});
</script>