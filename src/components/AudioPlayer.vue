<template>
  <ClientOnly>
    <div class="bg-gray-800 p-6 rounded-lg border border-gray-600">
      <h3 class="text-lg font-bold mb-4">Audio Processing</h3>
      
      <div class="space-y-4">
        <!-- Audio Controls -->
        <div class="flex items-center space-x-4">
          <button 
            @click="togglePlayback"
            :disabled="isProcessing"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-white font-medium transition-colors"
          >
            {{ isPlaying ? 'Stop' : 'Play Test Tone' }}
          </button>
          
          <button 
            @click="generateTestSignal"
            :disabled="isProcessing"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-white font-medium transition-colors"
          >
            Generate Guitar Test
          </button>
        </div>

        <!-- Test Tone Controls -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Test Frequency: {{ testFrequency }}Hz</label>
            <input 
              v-model.number="testFrequency"
              type="range" 
              min="80" 
              max="2000" 
              step="10"
              class="w-full"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Volume: {{ Math.round(volume * 100) }}%</label>
            <input 
              v-model.number="volume"
              type="range" 
              min="0" 
              max="1" 
              step="0.01"
              class="w-full"
            >
          </div>
        </div>

        <!-- Audio Canvas Visualization -->
        <div class="bg-gray-700 rounded p-4">
          <canvas 
            ref="audioCanvas" 
            width="600" 
            height="100"
            class="w-full h-24 bg-gray-900 rounded"
          ></canvas>
        </div>

        <!-- Status -->
        <div class="text-sm text-gray-400">
          <p v-if="isProcessing">Processing audio...</p>
          <p v-else-if="isPlaying">Playing test tone at {{ testFrequency }}Hz</p>
          <p v-else>Ready to play audio</p>
        </div>
      </div>
    </div>
    <template #fallback>
      <div class="bg-gray-800 p-6 rounded-lg border border-gray-600">
        <h3 class="text-lg font-bold mb-4">Audio Processing</h3>
        <div class="text-gray-400">Loading audio controls...</div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const props = defineProps<{
  toneStackId?: string;
  controls?: Record<string, number>;
}>();

const emit = defineEmits<{
  audioProcessed: [data: { frequencyResponse: any[]; processedAudio: number[] }];
}>();

// Audio state
const isPlaying = ref(false);
const isProcessing = ref(false);
const testFrequency = ref(440);
const volume = ref(0.3);
const audioCanvas = ref<HTMLCanvasElement>();

// Audio context and nodes
let audioContext: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let animationId: number | null = null;

onMounted(() => {
  if (process.client) {
    initializeAudio();
  }
});

onUnmounted(() => {
  if (process.client) {
    cleanup();
  }
});

async function initializeAudio() {
  if (!process.client) return;
  
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.connect(audioContext.destination);
  } catch (error) {
    console.error('Failed to initialize audio:', error);
  }
}

async function togglePlayback() {
  if (isPlaying.value) {
    stopPlayback();
  } else {
    await startPlayback();
  }
}

async function startPlayback() {
  if (!audioContext || !analyser) return;
  
  try {
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();
    
    oscillator.frequency.setValueAtTime(testFrequency.value, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume.value, audioContext.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(analyser);
    
    oscillator.start();
    isPlaying.value = true;
    
    startVisualization();
    
  } catch (error) {
    console.error('Failed to start playback:', error);
  }
}

function stopPlayback() {
  if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
    oscillator = null;
  }
  
  if (gainNode) {
    gainNode.disconnect();
    gainNode = null;
  }
  
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  
  isPlaying.value = false;
}

function startVisualization() {
  if (!analyser || !audioCanvas.value) return;
  
  const canvas = audioCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  function draw() {
    if (!isPlaying.value) return;
    
    animationId = requestAnimationFrame(draw);
    
    analyser!.getByteTimeDomainData(dataArray);
    
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#60a5fa';
    ctx.beginPath();
    
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * canvas.height / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.stroke();
  }
  
  draw();
}

async function generateTestSignal() {
  isProcessing.value = true;
  
  try {
    // Simulate processing with tone stack
    const response = await $fetch('/api/audio/analyze', {
      method: 'POST',
      body: {
        toneStackId: props.toneStackId || 'fender-tmb',
        controls: props.controls || { bass: 0.5, mid: 0.5, treble: 0.5 },
        sampleRate: 44100
      }
    });
    
    if (response.success) {
      emit('audioProcessed', {
        frequencyResponse: response.data.frequencyResponse,
        processedAudio: []
      });
    }
    
  } catch (error) {
    console.error('Failed to process audio:', error);
  } finally {
    isProcessing.value = false;
  }
}

function cleanup() {
  stopPlayback();
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}

// Watch for control changes
watch([testFrequency, volume], () => {
  if (oscillator && gainNode && audioContext) {
    oscillator.frequency.setValueAtTime(testFrequency.value, audioContext.currentTime);
    gainNode.gain.setValueAtTime(volume.value, audioContext.currentTime);
  }
});
</script>