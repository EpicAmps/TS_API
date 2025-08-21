<template>
  <div class="bg-gray-800 p-6 rounded-lg border border-gray-600">
    <h3 class="text-lg font-bold mb-4">Frequency Response</h3>
    <div class="h-80 w-full">
      <v-chart 
        class="chart" 
        :option="chartOption" 
        :theme="'dark'"
        autoresize
      />
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
    Array.from({ length: 100 }, (_, i) => 20 * Math.pow(10, i / 25));
  const sampleMags = magnitudes.length > 0 ? magnitudes :
    sampleFreqs.map(f => -3 * Math.log10(1 + Math.pow(f / 1000, 2)));

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
      min: 20,
      max: 20000,
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
      min: -20,
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