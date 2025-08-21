<template>
  <div class="bg-gray-800 p-6 rounded-lg border border-gray-600">
    <h3 class="text-lg font-bold mb-4">Audio Processing</h3>
    
    <div class="space-y-4">
      <!-- File Upload -->
      <div>
        <label class="block text-sm font-medium mb-2">Upload Audio File</label>
        <input
          ref="fileInput"
          type="file"
          accept="audio/*"
          @change="handleFileUpload"
          class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
      </div>

      <!-- Audio Controls -->
      <div v-if="audioBuffer" class="flex items-center space-x-4">
        <button
          @click="togglePlayback"
          :disabled="isProcessing"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isPlaying ? 'Stop' : 'Play' }} Original
        </button>
        
        <button
          @click="toggleProcessedPlayback"
          :disabled="isProcessing || !processedAudio"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isPlayingProcessed ? 'Stop' : 'Play' }} Processed
        </button>

        <button
          @click="processAudio"
          :disabled="isProcessing || !selectedToneStack"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isProcessing ? 'Processing...' : 'Process Audio' }}
        </button>
      </div>

      <!-- Progress -->
      <div v-if="isProcessing" class="w-full bg-gray-700 rounded-full h-2">
        <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="{ width: `${progress}%` }"></div>
      </div>

      <!-- Audio Info -->
      <div v-if="audioBuffer" class="text-sm text-gray-400">
        <p>Duration: {{ (audioBuffer.duration).toFixed(2) }}s</p>
        <p>Sample Rate: {{ audioBuffer.sampleRate }}Hz</p>
        <p>Channels: {{ audioBuffer.numberOfChannels }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ToneStackPreset } from '~/types/audio';

interface Props {
  selectedToneStack: ToneStackPreset | null;
  controls: Record<string, number>;
}

interface Emits {
  (e: 'audio-processed', data: { processedAudio: number[], originalAudio: number[] }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const fileInput = ref<HTMLInputElement>();
const audioBuffer = ref<AudioBuffer | null>(null);
const processedAudio = ref<number[] | null>(null);
const isPlaying = ref(false);
const isPlayingProcessed = ref(false);
const isProcessing = ref(false);
const progress = ref(0);

let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

onMounted(() => {
  audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
});

onUnmounted(() => {
  if (currentSource) {
    currentSource.stop();
  }
  if (audioContext) {
    audioContext.close();
  }
});

async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file || !audioContext) return;

  try {
    const arrayBuffer = await file.arrayBuffer();
    audioBuffer.value = await audioContext.decodeAudioData(arrayBuffer);
    processedAudio.value = null;
  } catch (error) {
    console.error('Error loading audio file:', error);
  }
}

function togglePlayback() {
  if (isPlaying.value) {
    stopPlayback();
  } else {
    playOriginal();
  }
}

function toggleProcessedPlayback() {
  if (isPlayingProcessed.value) {
    stopPlayback();
  } else {
    playProcessed();
  }
}

function playOriginal() {
  if (!audioBuffer.value || !audioContext) return;
  
  stopPlayback();
  
  currentSource = audioContext.createBufferSource();
  currentSource.buffer = audioBuffer.value;
  currentSource.connect(audioContext.destination);
  
  currentSource.onended = () => {
    isPlaying.value = false;
    currentSource = null;
  };
  
  currentSource.start();
  isPlaying.value = true;
}

function playProcessed() {
  if (!processedAudio.value || !audioContext) return;
  
  stopPlayback();
  
  // Create buffer from processed audio data
  const buffer = audioContext.createBuffer(1, processedAudio.value.length, audioContext.sampleRate);
  buffer.copyToChannel(new Float32Array(processedAudio.value), 0);
  
  currentSource = audioContext.createBufferSource();
  currentSource.buffer = buffer;
  currentSource.connect(audioContext.destination);
  
  currentSource.onended = () => {
    isPlayingProcessed.value = false;
    currentSource = null;
  };
  
  currentSource.start();
  isPlayingProcessed.value = true;
}

function stopPlayback() {
  if (currentSource) {
    currentSource.stop();
    currentSource = null;
  }
  isPlaying.value = false;
  isPlayingProcessed.value = false;
}

async function processAudio() {
  if (!audioBuffer.value || !props.selectedToneStack) return;
  
  isProcessing.value = true;
  progress.value = 0;
  
  try {
    // Convert audio buffer to array
    const channelData = audioBuffer.value.getChannelData(0);
    const audioData = Array.from(channelData);
    
    progress.value = 25;
    
    // Process through tone stack
    const response = await $fetch('/api/audio/process', {
      method: 'POST',
      body: {
        toneStackId: props.selectedToneStack.id,
        controls: props.controls,
        sampleRate: audioBuffer.value.sampleRate,
        audioData
      }
    });
    
    progress.value = 75;
    
    if (response.success && response.data.processedAudio) {
      processedAudio.value = response.data.processedAudio;
      
      emit('audio-processed', {
        processedAudio: response.data.processedAudio,
        originalAudio: audioData
      });
    }
    
    progress.value = 100;
    
  } catch (error) {
    console.error('Error processing audio:', error);
  } finally {
    isProcessing.value = false;
    setTimeout(() => {
      progress.value = 0;
    }, 1000);
  }
}
</script>