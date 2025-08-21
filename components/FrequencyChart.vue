<template>
  <div class="bg-gray-800 p-6 rounded-lg border border-gray-600">
    <h3 class="text-lg font-bold mb-4">Frequency Response</h3>
    <div class="h-64 w-full">
      <Line
        :data="chartData"
        :options="chartOptions"
        class="w-full h-full"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions
} from 'chart.js';
import type { FrequencyResponse } from '~/types/audio';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  frequencyResponse: FrequencyResponse[];
}

const props = defineProps<Props>();

const chartData = computed(() => ({
  labels: props.frequencyResponse.map(point => 
    point.frequency < 1000 
      ? `${Math.round(point.frequency)}Hz`
      : `${(point.frequency / 1000).toFixed(1)}kHz`
  ),
  datasets: [
    {
      label: 'Magnitude (dB)',
      data: props.frequencyResponse.map(point => point.magnitude),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 0,
      pointHoverRadius: 4
    }
  ]
}));

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      titleColor: '#f9fafb',
      bodyColor: '#f9fafb',
      borderColor: '#374151',
      borderWidth: 1,
      callbacks: {
        title: (context) => {
          const frequency = props.frequencyResponse[context[0].dataIndex].frequency;
          return frequency < 1000 
            ? `${Math.round(frequency)} Hz`
            : `${(frequency / 1000).toFixed(1)} kHz`;
        },
        label: (context) => {
          return `${context.parsed.y.toFixed(2)} dB`;
        }
      }
    }
  },
  scales: {
    x: {
      type: 'category',
      display: true,
      title: {
        display: true,
        text: 'Frequency',
        color: '#9ca3af'
      },
      ticks: {
        color: '#9ca3af',
        maxTicksLimit: 8
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      }
    },
    y: {
      type: 'linear',
      display: true,
      title: {
        display: true,
        text: 'Magnitude (dB)',
        color: '#9ca3af'
      },
      ticks: {
        color: '#9ca3af'
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      }
    }
  },
  interaction: {
    mode: 'index',
    intersect: false
  }
};
</script>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions
} from 'chart.js';
import type { FrequencyResponse } from '~/types/audio';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  frequencyResponse: FrequencyResponse[];
}

const props = defineProps<Props>();

const chartData = computed(() => ({
  labels: props.frequencyResponse.map(point => 
    point.frequency < 1000 
      ? `${Math.round(point.frequency)}Hz`
      : `${(point.frequency / 1000).toFixed(1)}kHz`
  ),
  datasets: [
    {
      label: 'Magnitude (dB)',
      data: props.frequencyResponse.map(point => point.magnitude),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 0,
      pointHoverRadius: 4
    }
  ]
}));

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      titleColor: '#f9fafb',
      bodyColor: '#f9fafb',
      borderColor: '#374151',
      borderWidth: 1,
      callbacks: {
        title: (context) => {
          const frequency = props.frequencyResponse[context[0].dataIndex].frequency;
          return frequency < 1000 
            ? `${Math.round(frequency)} Hz`
            : `${(frequency / 1000).toFixed(1)} kHz`;
        },
        label: (context) => {
          return `${context.parsed.y.toFixed(2)} dB`;
        }
      }
    }
  },
  scales: {
    x: {
      type: 'category',
      display: true,
      title: {
        display: true,
        text: 'Frequency',
        color: '#9ca3af'
      },
      ticks: {
        color: '#9ca3af',
        maxTicksLimit: 8
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      }
    },
    y: {
      type: 'linear',
      display: true,
      title: {
        display: true,
        text: 'Magnitude (dB)',
        color: '#9ca3af'
      },
      ticks: {
        color: '#9ca3af'
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      }
    }
  },
  interaction: {
    mode: 'index',
    intersect: false
  }
};
</script>