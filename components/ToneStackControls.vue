<template>
  <div class="tone-controls bg-gray-800 p-6 rounded-lg border border-gray-600">
    <h3 class="text-xl font-bold mb-4 text-center">{{ toneStack?.name }} Controls</h3>
    
    <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
      <!-- Bass Control -->
      <div v-if="'bass' in controls" class="control-group">
        <label class="block text-sm font-medium mb-2 text-center">Bass</label>
        <div class="knob-container">
          <div 
            class="knob mx-auto"
            :style="{ transform: `rotate(${(controls.bass - 0.5) * 270}deg)` }"
            @mousedown="startDrag('bass', $event)"
          ></div>
          <div class="text-xs text-center mt-2 text-gray-400">
            {{ Math.round(controls.bass * 100) }}%
          </div>
        </div>
      </div>

      <!-- Mid Control -->
      <div v-if="'mid' in controls" class="control-group">
        <label class="block text-sm font-medium mb-2 text-center">Mid</label>
        <div class="knob-container">
          <div 
            class="knob mx-auto"
            :style="{ transform: `rotate(${(controls.mid - 0.5) * 270}deg)` }"
            @mousedown="startDrag('mid', $event)"
          ></div>
          <div class="text-xs text-center mt-2 text-gray-400">
            {{ Math.round(controls.mid * 100) }}%
          </div>
        </div>
      </div>

      <!-- Treble Control -->
      <div v-if="'treble' in controls" class="control-group">
        <label class="block text-sm font-medium mb-2 text-center">Treble</label>
        <div class="knob-container">
          <div 
            class="knob mx-auto"
            :style="{ transform: `rotate(${(controls.treble - 0.5) * 270}deg)` }"
            @mousedown="startDrag('treble', $event)"
          ></div>
          <div class="text-xs text-center mt-2 text-gray-400">
            {{ Math.round(controls.treble * 100) }}%
          </div>
        </div>
      </div>

      <!-- Cut Control (Vox) -->
      <div v-if="'cut' in controls" class="control-group">
        <label class="block text-sm font-medium mb-2 text-center">Cut</label>
        <div class="knob-container">
          <div 
            class="knob mx-auto"
            :style="{ transform: `rotate(${(controls.cut - 0.5) * 270}deg)` }"
            @mousedown="startDrag('cut', $event)"
          ></div>
          <div class="text-xs text-center mt-2 text-gray-400">
            {{ Math.round(controls.cut * 100) }}%
          </div>
        </div>
      </div>

      <!-- Tone Control (RAT) -->
      <div v-if="'tone' in controls" class="control-group">
        <label class="block text-sm font-medium mb-2 text-center">Filter</label>
        <div class="knob-container">
          <div 
            class="knob mx-auto"
            :style="{ transform: `rotate(${(controls.tone - 0.5) * 270}deg)` }"
            @mousedown="startDrag('tone', $event)"
          ></div>
          <div class="text-xs text-center mt-2 text-gray-400">
            {{ Math.round(controls.tone * 100) }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ToneStackPreset } from '~/types/audio';

interface Props {
  toneStack: ToneStackPreset | null;
  controls: Record<string, number>;
}

interface Emits {
  (e: 'update:controls', controls: Record<string, number>): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

let isDragging = false;
let currentControl = '';
let startY = 0;
let startValue = 0;

function startDrag(controlName: string, event: MouseEvent) {
  isDragging = true;
  currentControl = controlName;
  startY = event.clientY;
  startValue = props.controls[controlName];
  
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  event.preventDefault();
}

function onDrag(event: MouseEvent) {
  if (!isDragging) return;
  
  const deltaY = startY - event.clientY; // Inverted for natural feel
  const sensitivity = 0.005;
  const newValue = Math.max(0, Math.min(1, startValue + deltaY * sensitivity));
  
  const newControls = { ...props.controls };
  newControls[currentControl] = newValue;
  
  emit('update:controls', newControls);
}

function stopDrag() {
  isDragging = false;
  currentControl = '';
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag);
  document.removeEventHandler('mouseup', stopDrag);
});
</script>

<style scoped>
.knob {
  transition: transform 0.1s ease-out;
}

.knob::after {
  transform-origin: center 28px;
}

.control-group {
  user-select: none;
}
</style>