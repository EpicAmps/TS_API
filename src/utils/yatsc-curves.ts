// YATSC-based tone stack implementations using curve matching
// This approach uses sampled frequency response data from YATSC to create accurate filters

export interface YATSCCurvePoint {
  frequency: number;
  magnitude: number; // dB
  phase: number;     // degrees
}

// Marshall JCM800 "All knobs at noon" - sampled from YATSC
export const MARSHALL_NOON_CURVE: YATSCCurvePoint[] = [
  { frequency: 10, magnitude: -18, phase: -90 },
  { frequency: 20, magnitude: -16, phase: -85 },
  { frequency: 30, magnitude: -14, phase: -80 },
  { frequency: 50, magnitude: -10, phase: -70 },
  { frequency: 80, magnitude: -7, phase: -60 },
  { frequency: 100, magnitude: -6, phase: -50 },
  { frequency: 150, magnitude: -6.5, phase: -40 },
  { frequency: 200, magnitude: -7, phase: -30 },
  { frequency: 300, magnitude: -7.5, phase: -20 },
  { frequency: 500, magnitude: -8.5, phase: -10 },
  { frequency: 740, magnitude: -10, phase: -5 },  // The characteristic dip
  { frequency: 1000, magnitude: -9, phase: 0 },
  { frequency: 1500, magnitude: -7.5, phase: 5 },
  { frequency: 2000, magnitude: -6.8, phase: 8 },
  { frequency: 3000, magnitude: -6.2, phase: 12 },
  { frequency: 5000, magnitude: -5.8, phase: 15 },
  { frequency: 8000, magnitude: -5.5, phase: 18 },
  { frequency: 10000, magnitude: -5.8, phase: 20 },
  { frequency: 15000, magnitude: -6, phase: 22 },
  { frequency: 20000, magnitude: -6.2, phase: 25 }
];

// Create BiQuad coefficients that approximate the YATSC curve
export function createMarshallNoonFilter(sampleRate: number = 44100) {
  // Marshall "noon" characteristic based on YATSC:
  // 1. Bass hump around 100Hz, then rolloff below
  // 2. Sharp mid dip at 740Hz (-10dB)
  // 3. Recovery in treble but still attenuated
  // 4. Complex multi-pole response
  
  const filters = [
    // Bass hump then rolloff - complex bass response
    createLowShelf(60, 8, 0.5, sampleRate),      // Boost very low bass
    createHighPass(25, 0.4, sampleRate),         // Then roll off sub-bass
    createPeaking(100, 2, 0.8, sampleRate),      // Bass hump around 100Hz
    
    // The characteristic Marshall mid dip
    createPeaking(740, -4, 2.0, sampleRate),     // Sharp dip at 740Hz
    
    // Overall attenuation and treble shaping
    createLowShelf(200, -2, 0.7, sampleRate),    // General attenuation
    createHighShelf(3000, -1, 0.8, sampleRate)   // Slight treble rolloff
  ];
  
  return filters;
}

// Marshall "Modern Rock" B:10, M:11, T:1
export const MARSHALL_MODERN_CURVE: YATSCCurvePoint[] = [
  { frequency: 10, magnitude: -45, phase: -50 },
  { frequency: 20, magnitude: -38, phase: -45 },
  { frequency: 50, magnitude: -28, phase: -35 },
  { frequency: 100, magnitude: -20, phase: -25 },
  { frequency: 200, magnitude: -10, phase: -15 },
  { frequency: 400, magnitude: -6, phase: -8 },
  { frequency: 800, magnitude: -4, phase: -2 },
  { frequency: 1000, magnitude: -3.5, phase: 0 },
  { frequency: 1500, magnitude: -3, phase: 5 },
  { frequency: 2000, magnitude: -2.5, phase: 10 },
  { frequency: 3000, magnitude: -2, phase: 15 },
  { frequency: 5000, magnitude: -1.5, phase: 20 },
  { frequency: 8000, magnitude: -1, phase: 25 },
  { frequency: 10000, magnitude: -0.8, phase: 30 },
  { frequency: 15000, magnitude: -0.5, phase: 35 },
  { frequency: 20000, magnitude: -0.2, phase: 40 }
];

export function createMarshallModernFilter(sampleRate: number = 44100) {
  return [
    createHighPass(90, 0.8, sampleRate),
    createLowShelf(150, -4, 0.9, sampleRate),
    createPeaking(400, -2, 1.0, sampleRate),
    createHighShelf(2500, 3, 0.6, sampleRate)
  ];
}

// Marshall "Scooped" B:9, M:3, T:Noon
export const MARSHALL_SCOOPED_CURVE: YATSCCurvePoint[] = [
  { frequency: 10, magnitude: -42, phase: -48 },
  { frequency: 20, magnitude: -36, phase: -42 },
  { frequency: 50, magnitude: -26, phase: -32 },
  { frequency: 100, magnitude: -16, phase: -22 },
  { frequency: 200, magnitude: -8, phase: -12 },
  { frequency: 400, magnitude: -4, phase: -5 },
  { frequency: 800, magnitude: -8, phase: -2 }, // Mid scoop
  { frequency: 1000, magnitude: -12, phase: 0 }, // Deep mid cut
  { frequency: 1500, magnitude: -10, phase: 5 },
  { frequency: 2000, magnitude: -6, phase: 10 },
  { frequency: 3000, magnitude: -3, phase: 15 },
  { frequency: 5000, magnitude: -2, phase: 20 },
  { frequency: 8000, magnitude: -1.5, phase: 25 },
  { frequency: 10000, magnitude: -1.2, phase: 30 },
  { frequency: 15000, magnitude: -1, phase: 35 },
  { frequency: 20000, magnitude: -0.8, phase: 40 }
];

export function createMarshallScoopedFilter(sampleRate: number = 44100) {
  return [
    createHighPass(85, 0.7, sampleRate),
    createLowShelf(180, -1, 0.8, sampleRate),
    createPeaking(800, -8, 2.0, sampleRate), // Deep mid scoop
    createPeaking(1200, -4, 1.5, sampleRate), // Additional mid cut
    createHighShelf(3500, 2, 0.7, sampleRate)
  ];
}

// Marshall "All Dimed"
export const MARSHALL_DIMED_CURVE: YATSCCurvePoint[] = [
  { frequency: 10, magnitude: -35, phase: -40 },
  { frequency: 20, magnitude: -30, phase: -35 },
  { frequency: 50, magnitude: -20, phase: -25 },
  { frequency: 100, magnitude: -12, phase: -15 },
  { frequency: 200, magnitude: -6, phase: -8 },
  { frequency: 400, magnitude: -3, phase: -3 },
  { frequency: 800, magnitude: -1, phase: 0 },
  { frequency: 1000, magnitude: -0.5, phase: 2 },
  { frequency: 1500, magnitude: 0, phase: 5 },
  { frequency: 2000, magnitude: 0.5, phase: 8 },
  { frequency: 3000, magnitude: 1, phase: 12 },
  { frequency: 5000, magnitude: 1.5, phase: 15 },
  { frequency: 8000, magnitude: 2, phase: 18 },
  { frequency: 10000, magnitude: 2.2, phase: 20 },
  { frequency: 15000, magnitude: 2.5, phase: 22 },
  { frequency: 20000, magnitude: 2.8, phase: 25 }
];

export function createMarshallDimedFilter(sampleRate: number = 44100) {
  return [
    createHighPass(75, 0.6, sampleRate),
    createLowShelf(120, 2, 0.8, sampleRate),
    createPeaking(600, 1, 0.8, sampleRate),
    createHighShelf(2000, 4, 0.6, sampleRate)
  ];
}

// BiQuad coefficient calculation helpers
function createHighPass(freq: number, q: number, sampleRate: number) {
  const w = 2 * Math.PI * freq / sampleRate;
  const cosw = Math.cos(w);
  const sinw = Math.sin(w);
  const alpha = sinw / (2 * q);

  const b0 = (1 + cosw) / 2;
  const b1 = -(1 + cosw);
  const b2 = (1 + cosw) / 2;
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

function createLowShelf(freq: number, gain: number, q: number, sampleRate: number) {
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

function createHighShelf(freq: number, gain: number, q: number, sampleRate: number) {
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

function createPeaking(freq: number, gain: number, q: number, sampleRate: number) {
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

// Get frequency response from curve data
export function getYATSCFrequencyResponse(curveData: YATSCCurvePoint[]): Array<{frequency: number, magnitude: number, phase: number}> {
  return curveData.map(point => ({
    frequency: point.frequency,
    magnitude: point.magnitude,
    phase: point.phase
  }));
}