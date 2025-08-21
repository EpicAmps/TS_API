import type { ToneStackPreset } from '~/types/audio';

export const toneStackPresets: ToneStackPreset[] = [
  {
    id: 'fender-tmb',
    name: 'Fender TMB',
    brand: 'Fender',
    description: 'Classic Fender Treble-Mid-Bass tone stack found in Twin Reverb and other amps',
    components: [
      { id: 'R1', type: 'resistor', value: 56000, unit: 'Ω', label: 'Slope Resistor' },
      { id: 'R2', type: 'resistor', value: 6800, unit: 'Ω', label: 'Mid Resistor' },
      { id: 'R3', type: 'resistor', value: 100000, unit: 'Ω', label: 'Bass Load' },
      { id: 'C1', type: 'capacitor', value: 250e-12, unit: 'F', label: 'Treble Cap' },
      { id: 'C2', type: 'capacitor', value: 22e-9, unit: 'F', label: 'Bass Cap' },
      { id: 'C3', type: 'capacitor', value: 250e-12, unit: 'F', label: 'Slope Cap' },
      { id: 'P1', type: 'potentiometer', value: 250000, unit: 'Ω', label: 'Treble' },
      { id: 'P2', type: 'potentiometer', value: 25000, unit: 'Ω', label: 'Mid' },
      { id: 'P3', type: 'potentiometer', value: 250000, unit: 'Ω', label: 'Bass' }
    ],
    controls: {
      bass: 0.5,
      mid: 0.5,
      treble: 0.5
    }
  },
  {
    id: 'marshall-jcm800',
    name: 'Marshall JCM800',
    brand: 'Marshall',
    description: 'Aggressive Marshall tone stack with pronounced midrange character',
    components: [
      { id: 'R1', type: 'resistor', value: 33000, unit: 'Ω', label: 'Slope Resistor' },
      { id: 'R2', type: 'resistor', value: 4700, unit: 'Ω', label: 'Mid Resistor' },
      { id: 'R3', type: 'resistor', value: 82000, unit: 'Ω', label: 'Bass Load' },
      { id: 'C1', type: 'capacitor', value: 220e-12, unit: 'F', label: 'Treble Cap' },
      { id: 'C2', type: 'capacitor', value: 22e-9, unit: 'F', label: 'Bass Cap' },
      { id: 'C3', type: 'capacitor', value: 220e-12, unit: 'F', label: 'Slope Cap' },
      { id: 'P1', type: 'potentiometer', value: 500000, unit: 'Ω', label: 'Treble' },
      { id: 'P2', type: 'potentiometer', value: 25000, unit: 'Ω', label: 'Mid' },
      { id: 'P3', type: 'potentiometer', value: 1000000, unit: 'Ω', label: 'Bass' }
    ],
    controls: {
      bass: 0.7,
      mid: 0.8,
      treble: 0.6
    }
  },
  {
    id: 'vox-ac30',
    name: 'Vox AC30',
    brand: 'Vox',
    description: 'Simple but effective Vox cut control for taming brightness',
    components: [
      { id: 'R1', type: 'resistor', value: 1000000, unit: 'Ω', label: 'Cut Resistor' },
      { id: 'C1', type: 'capacitor', value: 4.7e-9, unit: 'F', label: 'Cut Cap' },
      { id: 'P1', type: 'potentiometer', value: 1000000, unit: 'Ω', label: 'Cut' }
    ],
    controls: {
      cut: 0.3
    }
  },
  {
    id: 'boneyard-ray',
    name: 'Boneyard Ray',
    brand: 'Custom',
    description: 'Modern high-gain tone stack with extended frequency response',
    components: [
      { id: 'R1', type: 'resistor', value: 47000, unit: 'Ω', label: 'Slope Resistor' },
      { id: 'R2', type: 'resistor', value: 3900, unit: 'Ω', label: 'Mid Resistor' },
      { id: 'R3', type: 'resistor', value: 120000, unit: 'Ω', label: 'Bass Load' },
      { id: 'C1', type: 'capacitor', value: 150e-12, unit: 'F', label: 'Treble Cap' },
      { id: 'C2', type: 'capacitor', value: 33e-9, unit: 'F', label: 'Bass Cap' },
      { id: 'C3', type: 'capacitor', value: 150e-12, unit: 'F', label: 'Slope Cap' },
      { id: 'P1', type: 'potentiometer', value: 500000, unit: 'Ω', label: 'Treble' },
      { id: 'P2', type: 'potentiometer', value: 50000, unit: 'Ω', label: 'Mid' },
      { id: 'P3', type: 'potentiometer', value: 500000, unit: 'Ω', label: 'Bass' }
    ],
    controls: {
      bass: 0.6,
      mid: 0.7,
      treble: 0.8
    }
  },
  {
    id: 'rat-distortion',
    name: 'RAT Distortion',
    brand: 'ProCo',
    description: 'Classic RAT pedal tone control with simple but effective filtering',
    components: [
      { id: 'R1', type: 'resistor', value: 1000, unit: 'Ω', label: 'Filter Resistor' },
      { id: 'C1', type: 'capacitor', value: 3.3e-9, unit: 'F', label: 'Filter Cap' },
      { id: 'P1', type: 'potentiometer', value: 100000, unit: 'Ω', label: 'Filter' }
    ],
    controls: {
      tone: 0.5
    }
  }
];

export function getToneStackById(id: string): ToneStackPreset | undefined {
  return toneStackPresets.find(preset => preset.id === id);
}

export function getAllToneStacks(): ToneStackPreset[] {
  return toneStackPresets;
}