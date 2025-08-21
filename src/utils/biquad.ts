import type { BiQuadCoefficients } from '~/types/audio';

export class BiQuadFilter {
  private x1 = 0;
  private x2 = 0;
  private y1 = 0;
  private y2 = 0;
  
  constructor(private coeffs: BiQuadCoefficients) {}

  process(input: number): number {
    const output = this.coeffs.b0 * input + 
                   this.coeffs.b1 * this.x1 + 
                   this.coeffs.b2 * this.x2 - 
                   this.coeffs.a1 * this.y1 - 
                   this.coeffs.a2 * this.y2;

    this.x2 = this.x1;
    this.x1 = input;
    this.y2 = this.y1;
    this.y1 = output;

    return output;
  }

  reset(): void {
    this.x1 = this.x2 = this.y1 = this.y2 = 0;
  }

  updateCoefficients(coeffs: BiQuadCoefficients): void {
    this.coeffs = coeffs;
  }
}

export class ToneStackProcessor {
  private filters: BiQuadFilter[] = [];

  constructor(coefficients: BiQuadCoefficients[]) {
    this.filters = coefficients.map(coeffs => new BiQuadFilter(coeffs));
  }

  processBuffer(input: number[]): number[] {
    return input.map(sample => this.processSample(sample));
  }

  processSample(input: number): number {
    return this.filters.reduce((sample, filter) => filter.process(sample), input);
  }

  updateCoefficients(coefficients: BiQuadCoefficients[]): void {
    this.filters.forEach((filter, index) => {
      if (coefficients[index]) {
        filter.updateCoefficients(coefficients[index]);
      }
    });
  }

  reset(): void {
    this.filters.forEach(filter => filter.reset());
  }
}

// Tone stack coefficient calculators based on TS_API implementations
export function calculateFenderTMBCoefficients(
  bass: number, 
  mid: number, 
  treble: number, 
  sampleRate: number
): BiQuadCoefficients[] {
  const nyquist = sampleRate / 2;
  
  // Simplified Fender TMB implementation
  const bassFreq = 100 + (bass * 150); // 100-250 Hz
  const midFreq = 500 + (mid * 1000);  // 500-1500 Hz  
  const trebleFreq = 3000 + (treble * 5000); // 3-8 kHz

  return [
    calculateLowShelf(bassFreq, bass * 12 - 6, 0.7, sampleRate),
    calculatePeaking(midFreq, mid * 12 - 6, 1.0, sampleRate),
    calculateHighShelf(trebleFreq, treble * 12 - 6, 0.7, sampleRate)
  ];
}

export function calculateMarshallCoefficients(
  bass: number,
  mid: number, 
  treble: number,
  sampleRate: number
): BiQuadCoefficients[] {
  // Marshall-style tone stack
  const bassFreq = 80 + (bass * 120);
  const midFreq = 400 + (mid * 800);
  const trebleFreq = 2500 + (treble * 4500);

  return [
    calculateLowShelf(bassFreq, bass * 15 - 7.5, 0.8, sampleRate),
    calculatePeaking(midFreq, mid * 15 - 7.5, 1.2, sampleRate),
    calculateHighShelf(trebleFreq, treble * 15 - 7.5, 0.8, sampleRate)
  ];
}

export function calculateVoxCoefficients(
  cut: number,
  sampleRate: number
): BiQuadCoefficients[] {
  // Vox-style cut control (high frequency roll-off)
  const cutoffFreq = 1000 + (cut * 4000); // 1-5 kHz
  
  return [
    calculateLowPass(cutoffFreq, 0.7, sampleRate)
  ];
}

// BiQuad coefficient calculation helpers
function calculateLowShelf(freq: number, gain: number, q: number, sampleRate: number): BiQuadCoefficients {
  const w = 2 * Math.PI * freq / sampleRate;
  const cosw = Math.cos(w);
  const sinw = Math.sin(w);
  const A = Math.pow(10, gain / 40);
  const beta = Math.sqrt(A) / q;

  const b0 = A * ((A + 1) - (A - 1) * cosw + beta * sinw);
  const b1 = 2 * A * ((A - 1) - (A + 1) * cosw);
  const b2 = A * ((A + 1) - (A - 1) * cosw - beta * sinw);
  const a0 = (A + 1) + (A - 1) * cosw + beta * sinw;
  const a1 = -2 * ((A - 1) + (A + 1) * cosw);
  const a2 = (A + 1) + (A - 1) * cosw - beta * sinw;

  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: a1 / a0,
    a2: a2 / a0
  };
}

function calculateHighShelf(freq: number, gain: number, q: number, sampleRate: number): BiQuadCoefficients {
  const w = 2 * Math.PI * freq / sampleRate;
  const cosw = Math.cos(w);
  const sinw = Math.sin(w);
  const A = Math.pow(10, gain / 40);
  const beta = Math.sqrt(A) / q;

  const b0 = A * ((A + 1) + (A - 1) * cosw + beta * sinw);
  const b1 = -2 * A * ((A - 1) + (A + 1) * cosw);
  const b2 = A * ((A + 1) + (A - 1) * cosw - beta * sinw);
  const a0 = (A + 1) - (A - 1) * cosw + beta * sinw;
  const a1 = 2 * ((A - 1) - (A + 1) * cosw);
  const a2 = (A + 1) - (A - 1) * cosw - beta * sinw;

  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: a1 / a0,
    a2: a2 / a0
  };
}

function calculatePeaking(freq: number, gain: number, q: number, sampleRate: number): BiQuadCoefficients {
  const w = 2 * Math.PI * freq / sampleRate;
  const cosw = Math.cos(w);
  const sinw = Math.sin(w);
  const A = Math.pow(10, gain / 40);
  const alpha = sinw / (2 * q);

  const b0 = 1 + alpha * A;
  const b1 = -2 * cosw;
  const b2 = 1 - alpha * A;
  const a0 = 1 + alpha / A;
  const a1 = -2 * cosw;
  const a2 = 1 - alpha / A;

  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: a1 / a0,
    a2: a2 / a0
  };
}

function calculateLowPass(freq: number, q: number, sampleRate: number): BiQuadCoefficients {
  const w = 2 * Math.PI * freq / sampleRate;
  const cosw = Math.cos(w);
  const sinw = Math.sin(w);
  const alpha = sinw / (2 * q);

  const b0 = (1 - cosw) / 2;
  const b1 = 1 - cosw;
  const b2 = (1 - cosw) / 2;
  const a0 = 1 + alpha;
  const a1 = -2 * cosw;
  const a2 = 1 - alpha;

  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: a1 / a0,
    a2: a2 / a0
  };
}