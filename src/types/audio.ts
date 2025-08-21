export interface ToneStackComponent {
  id: string;
  type: 'resistor' | 'capacitor' | 'potentiometer';
  value: number;
  unit: string;
  label: string;
  position?: { x: number; y: number };
}

export interface ToneStackPreset {
  id: string;
  name: string;
  brand: string;
  description: string;
  components: ToneStackComponent[];
  controls: {
    bass?: number;
    mid?: number;
    treble?: number;
    tone?: number;
    cut?: number;
  };
  schematicSvg?: string;
}

export interface BiQuadCoefficients {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

export interface FrequencyResponse {
  frequency: number;
  magnitude: number;
  phase: number;
}

export interface AudioProcessingRequest {
  toneStackId: string;
  controls: Record<string, number>;
  sampleRate: number;
  audioData?: number[];
}

export interface AudioProcessingResponse {
  processedAudio?: number[];
  frequencyResponse: FrequencyResponse[];
  filterCoefficients: BiQuadCoefficients[];
}