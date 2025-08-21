<template>
  <div class="bg-gray-800 p-6 rounded-lg border border-gray-600">
    <h3 class="text-lg font-bold mb-4">Frequency Response</h3>
    <div class="h-80 w-full">
      <ClientOnly>
        <v-chart 
          class="chart" 
          :option="chartOption" 
          :theme="'dark'"
          autoresize
        />
        <template #fallback>
          <div class="h-full flex items-center justify-center text-gray-400">
            Loading chart...
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import VChart from 'vue-echarts';

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);

const props = defineProps<{
  frequencyData?: Array<{ frequency: number; magnitude: number; phase: number }>;
}>();

const chartOption = computed(() => {
  console.log('Chart data:', props.frequencyData);
  
  const frequencies = props.frequencyData?.map(d => d.frequency) || [];
  const magnitudes = props.frequencyData?.map(d => -Math.abs(d.magnitude)) || [];
  
  console.log('Frequencies length:', frequencies.length);
  console.log('Magnitudes:', magnitudes.slice(0, 5));
  
  // Use real data if available, otherwise generate more realistic sample data
  let sampleFreqs, sampleMags;
  
  if (frequencies.length > 0 && magnitudes.length > 0) {
    sampleFreqs = frequencies;
    sampleMags = magnitudes;
    console.log('Using real API data');
  } else {
    console.log('Using sample data');
    // Generate more realistic tone stack response curve
    sampleFreqs = [];
    for (let i = 0; i < 200; i++) {
      sampleFreqs.push(10 * Math.pow(10, i / 40)); // 10Hz to 100kHz
    }
    sampleMags = sampleFreqs.map(f => {
      // Simulate typical guitar tone stack response
      let mag = 0;
      if (f < 100) {
        mag = -20 * Math.log10(f / 100 + 1); // Bass rolloff
      } else if (f < 500) {
        mag = -3;
      } else if (f < 1000) {
        mag = -8 + 3 * Math.sin(Math.PI * (f - 500) / 1000);
      } else if (f < 3000) {
        mag = -5;
      } else if (f < 8000) {
        mag = -2 + 4 * Math.sin(Math.PI * (f - 3000) / 10000);
      } else {
        mag = -15 + 10 * Math.exp(-(f - 8000) / 5000);
      }
      return Math.max(mag, -40);
    });
  }

  return {
    backgroundColor: 'transparent',
    grid: {
      left: '10%',
      right: '10%',
      top: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'log',
      name: 'Frequency (Hz)',
      nameLocation: 'middle',
      nameGap: 30,
      min: 1,
      max: 100000,
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1000) return `${value / 1000}k`;
          return value.toString();
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'Magnitude (dB)',
      nameLocation: 'middle',
      nameGap: 50,
      min: -48,
      max: 0
    },
    series: [
      {
        name: 'Frequency Response',
        type: 'line',
        data: sampleFreqs.map((freq, i) => [freq, sampleMags[i]]),
        smooth: true,
        lineStyle: {
          color: '#60a5fa',
          width: 2
        },
        symbol: 'none'
      }
    ],
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const point = params[0];
        return `Frequency: ${point.value[0].toFixed(0)} Hz<br/>Magnitude: ${point.value[1].toFixed(2)} dB`;
      }
    }
  };
});
</script>

<style scoped>
.chart {
  height: 100%;
  width: 100%;
}
</style>