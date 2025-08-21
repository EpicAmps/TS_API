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
              <select 
                v-model="selectedToneStack"
                @change="updateFrequencyResponse"
                class="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="fender-tmb">Fender TMB</option>
                <option value="marshall-jcm800">Marshall JCM800</option>
                <option value="vox-ac30">Vox AC30</option>
                <option value="boneyard-ray">Boneyard Ray</option>
                <option value="rat-distortion">RAT Distortion</option>
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
              <input 
                v-model.number="controls.bass"
                @input="updateFrequencyResponse"
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                class="w-full"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Mid</label>
              <input 
                v-model.number="controls.mid"
                @input="updateFrequencyResponse"
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                class="w-full"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Treble</label>
              <input 
                v-model.number="controls.treble"
                @input="updateFrequencyResponse"
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                class="w-full"
              >
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
            :tone-stack-id="selectedToneStack"
            :controls="controls"
            @audio-processed="handleAudioProcessed"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Reactive state
const selectedToneStack = ref('fender-tmb');
const controls = reactive({
  bass: 0.5,
  mid: 0.5,
  treble: 0.5
});
const frequencyData = ref<Array<{ frequency: number; magnitude: number; phase: number }>>([]);

// Update frequency response when controls change
async function updateFrequencyResponse() {
  try {
    const response = await $fetch('/api/audio/analyze', {
      method: 'POST',
      body: {
        toneStackId: selectedToneStack.value,
        controls: controls,
        sampleRate: 44100
      }
    });
    
    if (response.success) {
      frequencyData.value = response.data.frequencyResponse;
    }
  } catch (error) {
    console.error('Failed to update frequency response:', error);
  }
}

// Handle audio processing results
function handleAudioProcessed(data: { frequencyResponse: any[]; processedAudio: number[] }) {
  frequencyData.value = data.frequencyResponse;
}

// Initialize on mount
onMounted(() => {
  updateFrequencyResponse();
});

// Set page title
useHead({
  title: 'Yet Another Tonestack Calculator - Guitar Tone Stack Analysis'
});
</script>