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
  const frequencies = props.frequencyData?.map(d => d.frequency) || [];
  const magnitudes = props.frequencyData?.map(d => d.magnitude) || [];
  
  // Generate sample data if no real data provided
  const sampleFreqs = frequencies.length > 0 ? frequencies : 
    Array.from({ length: 200 }, (_, i) => 10 * Math.pow(10, i / 50));
  const sampleMags = magnitudes.length > 0 ? magnitudes :
    sampleFreqs.map(f => -6 * Math.log10(1 + Math.pow(f / 500, 1.5)));

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
      min: 10,
      max: 100000,
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1000) return `${value / 1000}k`;
          if (value >= 10000) return `${value / 1000}k`;
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
      max: 10
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