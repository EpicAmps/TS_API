<template>
  <div class="audio-player bg-gray-800 p-6 rounded-lg border border-gray-600">
    <h3 class="text-lg font-bold mb-4">Audio Test</h3>
    
    <div class="controls flex items-center gap-4 mb-4">
      <button
        @click="togglePlayback"
        :disabled="isProcessing"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-medium transition-colors"
      >
        {{ isPlaying ? 'Stop' : 'Play Test Loop' }}
      </button>
      
      <button
        @click="processAudio"
        :disabled="isProcessing || !selectedToneStack"
        class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded font-medium transition-colors"
      >
        {{ isProcessing ? 'Processing...' : 'Process Audio' }}
      </button>
      
      <div class="flex items-center gap-2">
        <label class="text-sm">Volume:</label>
        <input
          v-model="volume"
          type="range"
          min="0"
          max="1"
          step="0.1"
          class="w-20"
        />
        <span class="text-xs text-gray-400">{{ Math.round(volume * 100) }}%</span>
      </div>
    </div>
    
    <div class="status text-sm text-gray-400">
      <p v-if="isProcessing">Processing audio through {{ selectedToneStack?.name }}...</p>
      <p v-else-if="processedAudio">
        Processed {{ processedAudio.length }} samples through {{ selectedToneStack?.name }}
      </p>
      <p v-else>Ready to process audio</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ToneStackPreset } from '~/types/audio';
import { generateGuitarTestLoop } from '~/utils/frequency-analysis';

interface Props {
  selectedToneStack: ToneStackPreset | null;
  controls: Record<string, number>;
}

interface Emits {
  (e: 'audio-processed', data: { processedAudio: number[], originalAudio: number[] }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isPlaying = ref(false);
const isProcessing = ref(false);
const volume = ref(0.5);
const processedAudio = ref<number[] | null>(null);

let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let originalTestLoop: number[] | null = null;

onMounted(() => {
  // Generate test loop on mount
  originalTestLoop = generateGuitarTestLoop(44100);
});

async function togglePlayback() {
  if (isPlaying.value) {
    stopPlayback();
  } else {
    await startPlayback();
  }
}

async function startPlayback() {
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Use processed audio if available, otherwise use original
    const audioData = processedAudio.value || originalTestLoop;
    if (!audioData) return;
    
    const buffer = audioContext.createBuffer(1, audioData.length, audioContext.sampleRate);
    const channelData = buffer.getChannelData(0);
    
    // Copy audio data and apply volume
    for (let i = 0; i < audioData.length; i++) {
      channelData[i] = audioData[i] * volume.value;
    }
    
    currentSource = audioContext.createBufferSource();
    currentSource.buffer = buffer;
    currentSource.loop = true;
    currentSource.connect(audioContext.destination);
    
    currentSource.onended = () => {
      isPlaying.value = false;
      currentSource = null;
    };
    
    currentSource.start();
    isPlaying.value = true;
    
  } catch (error) {
    console.error('Failed to start playback:', error);
  }
}

function stopPlayback() {
  if (currentSource) {
    currentSource.stop();
    currentSource = null;
  }
  isPlaying.value = false;
}

async function processAudio() {
  if (!props.selectedToneStack || !originalTestLoop) return;
  
  isProcessing.value = true;
  
  try {
    const response = await $fetch('/api/audio/process', {
      method: 'POST',
      body: {
        toneStackId: props.selectedToneStack.id,
        controls: props.controls,
        sampleRate: 44100,
        audioData: originalTestLoop
      }
    });
    
    if (response.success && response.data.processedAudio) {
      processedAudio.value = response.data.processedAudio;
      
      emit('audio-processed', {
        processedAudio: response.data.processedAudio,
        originalAudio: originalTestLoop
      });
      
      // If currently playing, restart with processed audio
      if (isPlaying.value) {
        stopPlayback();
        await startPlayback();
      }
    }
    
  } catch (error) {
    console.error('Failed to process audio:', error);
  } finally {
    isProcessing.value = false;
  }
}

onUnmounted(() => {
  stopPlayback();
  if (audioContext) {
    audioContext.close();
  }
});
</script>