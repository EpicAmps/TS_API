<template>
  <div class="frequency-chart">
    <h3 class="text-lg font-bold mb-4">Frequency Response</h3>
    <div class="chart-container relative">
      <canvas 
        ref="chartCanvas" 
        :width="chartWidth" 
        :height="chartHeight"
        class="w-full h-64 bg-gray-900 rounded border border-gray-600"
      ></canvas>
      
      <!-- Chart Labels -->
      <div class="chart-labels mt-2 flex justify-between text-xs text-gray-400">
        <span>20 Hz</span>
        <span>200 Hz</span>
        <span>2 kHz</span>
        <span>20 kHz</span>
      </div>
      
      <div class="magnitude-labels absolute left-0 top-0 h-64 flex flex-col justify-between text-xs text-gray-400 -ml-8">
        <span>+20 dB</span>
        <span>0 dB</span>
        <span>-20 dB</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FrequencyResponse } from '~/types/audio';

interface Props {
  frequencyResponse: FrequencyResponse[];
}

const props = defineProps<Props>();

const chartCanvas = ref<HTMLCanvasElement>();
const chartWidth = 800;
const chartHeight = 256;

watch(() => props.frequencyResponse, () => {
  drawChart();
}, { immediate: true });

onMounted(() => {
  drawChart();
});

function drawChart() {
  if (!chartCanvas.value || !props.frequencyResponse.length) return;
  
  const canvas = chartCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Clear canvas
  ctx.clearRect(0, 0, chartWidth, chartHeight);
  
  // Draw grid
  drawGrid(ctx);
  
  // Draw frequency response
  drawFrequencyResponse(ctx);
}

function drawGrid(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1;
  
  // Horizontal grid lines (dB)
  for (let db = -20; db <= 20; db += 10) {
    const y = dbToY(db);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(chartWidth, y);
    ctx.stroke();
  }
  
  // Vertical grid lines (frequency)
  const frequencies = [50, 100, 200, 500, 1000, 2000, 5000, 10000];
  frequencies.forEach(freq => {
    const x = freqToX(freq);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, chartHeight);
    ctx.stroke();
  });
  
  // Center line (0 dB)
  ctx.strokeStyle = '#6B7280';
  ctx.lineWidth = 2;
  const centerY = dbToY(0);
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(chartWidth, centerY);
  ctx.stroke();
}

function drawFrequencyResponse(ctx: CanvasRenderingContext2D) {
  if (!props.frequencyResponse.length) return;
  
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  props.frequencyResponse.forEach((point, index) => {
    const x = freqToX(point.frequency);
    const y = dbToY(point.magnitude);
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.stroke();
}

function freqToX(frequency: number): number {
  // Logarithmic frequency scale from 20 Hz to 20 kHz
  const minFreq = 20;
  const maxFreq = 20000;
  const logMin = Math.log10(minFreq);
  const logMax = Math.log10(maxFreq);
  const logFreq = Math.log10(Math.max(frequency, minFreq));
  
  return ((logFreq - logMin) / (logMax - logMin)) * chartWidth;
}

function dbToY(db: number): number {
  // Map dB range (-20 to +20) to canvas height
  const minDb = -20;
  const maxDb = 20;
  const normalizedDb = (db - minDb) / (maxDb - minDb);
  
  return chartHeight - (normalizedDb * chartHeight);
}
</script>