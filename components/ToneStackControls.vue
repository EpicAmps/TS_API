<template>
  <div class="bg-gray-800 p-6 rounded-lg border border-gray-600">
    <h3 class="text-lg font-bold mb-4">Tone Controls</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="(value, control) in controls"
        :key="control"
        class="space-y-2"
      >
        <label class="block text-sm font-medium capitalize">
          {{ control }}
        </label>
        <div class="flex items-center space-x-3">
          <input
            :value="value"
            @input="updateControl(control, parseFloat(($event.target as HTMLInputElement).value))"
            type="range"
            min="0"
            max="1"
            step="0.01"
            class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <span class="text-sm font-mono w-12 text-right">
            {{ Math.round(value * 100) }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ToneStackPreset } from '~/types/audio';

interface Props {
  toneStack: ToneStackPreset;
  controls: Record<string, number>;
}

interface Emits {
  (e: 'update:controls', controls: Record<string, number>): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function updateControl(controlName: string, value: number) {
  const updatedControls = {
    ...props.controls,
    [controlName]: value
  };
  emit('update:controls', updatedControls);
}
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #1e40af;
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #1e40af;
}
</style>