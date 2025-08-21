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

      <!-- Tone Stack Selector -->
      <div class="mb-8">
        <label class="block text-lg font-medium mb-4">Select Tone Stack:</label>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="preset in toneStacks"
            :key="preset.id"
            @click="selectToneStack(preset)"
            :class="[
              'p-4 rounded-lg border-2 cursor-pointer transition-all',
              selectedToneStack?.id === preset.id
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-gray-600 bg-gray-800 hover:border-gray-500'
            ]"
          >
            <h3 class="font-bold text-lg">{{ preset.name }}</h3>
            <p class="text-sm text-gray-400 mb-2">{{ preset.brand }}</p>
            <p class="text-xs text-gray-500">{{ preset.description }}</p>
          </div>
        </div>
      </div>

      <div v-if="selectedToneStack" class="space-y-8">
        <!-- Controls -->
        <ToneStackControls
          :tone-stack="selectedToneStack"
          :controls="controls"
          @update:controls="updateControls"
        />

        <!-- Audio Player -->
        <AudioPlayer
          :selected-tone-stack="selectedToneStack"
          :controls="controls"
          @audio-processed="onAudioProcessed"
        />

        <!-- Frequency Chart -->
        <FrequencyChart
          v-if="frequencyResponse.length"
          :frequency-response="frequencyResponse"
        />

        <!-- Component Details -->
        <div class="bg-gray-800 p-6 rounded-lg border border-gray-600">
          <h3 class="text-lg font-bold mb-4">Circuit Components</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="component in selectedToneStack.components"
              :key="component.id"
              class="p-3 bg-gray-700 rounded border border-gray-600"
            >
              <div class="font-medium">{{ component.label }}</div>
              <div class="text-sm text-gray-400">{{ component.type }}</div>
              <div class="text-sm font-mono">{{ formatComponentValue(component) }}</div>
            </div>
          </div>
        </div>

        <!-- API Information -->
        <div class="bg-gray-800 p-6 rounded-lg border border-gray-600">
          <h3 class="text-lg font-bold mb-4">API Endpoints</h3>
          <div class="space-y-2 text-sm font-mono">
            <div><span class="text-green-400">GET</span> /api/tone-stacks - List all presets</div>
            <div><span class="text-green-400">GET</span> /api/tone-stacks/{{ selectedToneStack.id }} - Get preset details</div>
            <div><span class="text-blue-400">POST</span> /api/audio/process - Process audio through tone stack</div>
            <div><span class="text-blue-400">POST</span> /api/audio/analyze - Analyze frequency response</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="text-center py-12">
        <p class="text-gray-400">Select a tone stack to begin</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ToneStackPreset, FrequencyResponse, ToneStackComponent } from '~/types/audio';

const selectedToneStack = ref<ToneStackPreset | null>(null);
const toneStacks = ref<ToneStackPreset[]>([]);
const controls = ref<Record<string, number>>({});
const frequencyResponse = ref<FrequencyResponse[]>([]);

// Load tone stacks on mount
onMounted(async () => {
  try {
    const response = await $fetch('/api/tone-stacks');
    if (response.success) {
      toneStacks.value = response.data;
    }
  } catch (error) {
    console.error('Failed to load tone stacks:', error);
  }
});

async function selectToneStack(preset: ToneStackPreset) {
  selectedToneStack.value = preset;
  controls.value = { ...preset.controls };
  
  // Analyze frequency response
  await analyzeFrequencyResponse();
}

async function updateControls(newControls: Record<string, number>) {
  controls.value = newControls;
  
  // Update frequency response in real-time
  await analyzeFrequencyResponse();
}

async function analyzeFrequencyResponse() {
  if (!selectedToneStack.value) return;
  
  try {
    const response = await $fetch('/api/audio/analyze', {
      method: 'POST',
      body: {
        toneStackId: selectedToneStack.value.id,
        controls: controls.value,
        sampleRate: 44100
      }
    });
    
    if (response.success) {
      frequencyResponse.value = response.data.frequencyResponse;
    }
  } catch (error) {
    console.error('Failed to analyze frequency response:', error);
  }
}

function onAudioProcessed(data: { processedAudio: number[], originalAudio: number[] }) {
  console.log('Audio processed:', data.processedAudio.length, 'samples');
}

function formatComponentValue(component: ToneStackComponent): string {
  if (component.type === 'capacitor' && component.value < 1) {
    return `${component.value * 1000000} n${component.unit.replace('µ', '')}`;
  }
  if (component.type === 'resistor' && component.value >= 1000) {
    return `${component.value / 1000} k${component.unit}`;
  }
  return `${component.value} ${component.unit}`;
}

// Set page title
useHead({
  title: 'Yet Another Tonestack Calculator - Guitar Tone Stack Analysis'
});
</script>