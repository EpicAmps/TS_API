// Tone stack calculations based on YATSC implementation
// https://github.com/why-trv/yet-another-tonestack-calculator

export interface ComplexNumber {
  real: number;
  imag: number;
}

export interface ToneStackParameters {
  R1: number;  // Ohms
  R2: number;  // Ohms  
  R3: number;  // Ohms
  C1: number;  // Farads
  C2: number;  // Farads
  C3?: number; // Farads
  
  treble: number; // 0-1
  bass: number;   // 0-1
  mid?: number;   // 0-1
}

export interface FrequencyPoint {
  frequency: number;
  magnitude: number; // dB
  phase: number;     // degrees
}

// Complex number operations
export function complexAdd(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return { real: a.real + b.real, imag: a.imag + b.imag };
}

export function complexSubtract(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return { real: a.real - b.real, imag: a.imag - b.imag };
}

export function complexMultiply(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return {
    real: a.real * b.real - a.imag * b.imag,
    imag: a.real * b.imag + a.imag * b.real
  };
}

export function complexDivide(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  const denom = b.real * b.real + b.imag * b.imag;
  if (denom === 0) return { real: 0, imag: 0 };
  return {
    real: (a.real * b.real + a.imag * b.imag) / denom,
    imag: (a.imag * b.real - a.real * b.imag) / denom
  };
}

export function complexMagnitude(c: ComplexNumber): number {
  return Math.sqrt(c.real * c.real + c.imag * c.imag);
}

export function complexPhase(c: ComplexNumber): number {
  return Math.atan2(c.imag, c.real);
}

// Calculate impedance of capacitor at frequency ω
export function capacitorImpedance(C: number, omega: number): ComplexNumber {
  if (C === 0 || omega === 0) return { real: 1e12, imag: 0 }; // Very high impedance
  return { real: 0, imag: -1 / (omega * C) };
}

// Calculate impedance of resistor
export function resistorImpedance(R: number): ComplexNumber {
  return { real: R, imag: 0 };
}

// Parallel impedance: 1/Z = 1/Z1 + 1/Z2
export function parallelImpedance(Z1: ComplexNumber, Z2: ComplexNumber): ComplexNumber {
  const invZ1 = complexDivide({ real: 1, imag: 0 }, Z1);
  const invZ2 = complexDivide({ real: 1, imag: 0 }, Z2);
  const invZtotal = complexAdd(invZ1, invZ2);
  return complexDivide({ real: 1, imag: 0 }, invZtotal);
}

// Series impedance: Z = Z1 + Z2
export function seriesImpedance(Z1: ComplexNumber, Z2: ComplexNumber): ComplexNumber {
  return complexAdd(Z1, Z2);
}

// Fender TMB tone stack - proper circuit analysis based on YATSC
export function calculateFenderTMBTransferFunction(
  params: ToneStackParameters,
  frequency: number
): ComplexNumber {
  const omega = 2 * Math.PI * frequency;
  
  // Fender TMB component values (from YATSC)
  const R1 = 250000;  // 250k treble pot
  const R2 = 1000000; // 1M bass pot  
  const R3 = 25000;   // 25k mid pot
  const C1 = 250e-12; // 250pF treble cap
  const C2 = 22e-9;   // 22nF bass cap
  const C3 = 250e-12; // 250pF slope resistor cap
  
  // Control positions (0-1)
  const treble = params.treble;
  const bass = params.bass;
  const mid = params.mid || 0.5;
  
  // Calculate complex impedances
  const s = { real: 0, imag: omega }; // jω
  
  const ZC1 = complexDivide({ real: 1, imag: 0 }, complexMultiply(s, { real: C1, imag: 0 }));
  const ZC2 = complexDivide({ real: 1, imag: 0 }, complexMultiply(s, { real: C2, imag: 0 }));
  const ZC3 = complexDivide({ real: 1, imag: 0 }, complexMultiply(s, { real: C3, imag: 0 }));
  
  // Potentiometer modeling - split into two resistors
  const R1a = { real: R1 * treble, imag: 0 };
  const R1b = { real: R1 * (1 - treble), imag: 0 };
  const R2a = { real: R2 * bass, imag: 0 };
  const R2b = { real: R2 * (1 - bass), imag: 0 };
  const R3_val = { real: R3, imag: 0 };
  
  // Simplified Fender TMB circuit analysis
  // This is a basic approximation of the complex nodal analysis
  
  // Treble path: R1a in series with C1, parallel with R1b
  const treblePath = parallelImpedance(
    seriesImpedance(R1a, ZC1),
    R1b
  );
  
  // Bass path: R2a in series with C2, parallel with R2b  
  const bassPath = parallelImpedance(
    seriesImpedance(R2a, ZC2),
    R2b
  );
  
  // Mid path through R3
  const midPath = R3_val;
  
  // Combine all paths
  const totalLoad = parallelImpedance(
    parallelImpedance(treblePath, bassPath),
    midPath
  );
  
  // Source impedance (typical tube amp)
  const sourceZ = { real: 100000, imag: 0 }; // 100k
  
  // Voltage divider: Vout/Vin = Zload / (Zsource + Zload)
  const transferFunction = complexDivide(
    totalLoad,
    complexAdd(sourceZ, totalLoad)
  );
  
  return transferFunction;
}

// Marshall tone stack - different topology
export function calculateMarshallTransferFunction(
  params: ToneStackParameters,
  frequency: number
): ComplexNumber {
  const omega = 2 * Math.PI * frequency;
  
  // Marshall component values
  const R1 = 500000;  // 500k treble pot
  const R2 = 1000000; // 1M bass pot
  const R3 = 25000;   // 25k mid pot  
  const C1 = 220e-12; // 220pF
  const C2 = 22e-9;   // 22nF
  
  const treble = params.treble;
  const bass = params.bass;
  const mid = params.mid || 0.5;
  
  const s = { real: 0, imag: omega };
  
  const ZC1 = complexDivide({ real: 1, imag: 0 }, complexMultiply(s, { real: C1, imag: 0 }));
  const ZC2 = complexDivide({ real: 1, imag: 0 }, complexMultiply(s, { real: C2, imag: 0 }));
  
  const R1_val = { real: R1 * treble, imag: 0 };
  const R2_val = { real: R2 * bass, imag: 0 };
  const R3_val = { real: R3 * mid, imag: 0 };
  
  // Marshall has different circuit topology - more aggressive midrange scoop
  const highPath = seriesImpedance(R1_val, ZC1);
  const lowPath = parallelImpedance(R2_val, ZC2);
  const combined = seriesImpedance(highPath, parallelImpedance(lowPath, R3_val));
  
  const sourceZ = { real: 100000, imag: 0 };
  return complexDivide(combined, complexAdd(combined, sourceZ));
}

// Vox AC30 cut control - simple high-frequency roll-off
export function calculateVoxTransferFunction(
  params: ToneStackParameters,
  frequency: number
): ComplexNumber {
  const omega = 2 * Math.PI * frequency;
  
  // Vox cut control values
  const R1 = 1000000; // 1M pot
  const C1 = 4.7e-9;  // 4.7nF
  
  const cut = params.treble; // Using treble control for cut
  
  const s = { real: 0, imag: omega };
  const ZR = { real: R1 * cut, imag: 0 };
  const ZC = complexDivide({ real: 1, imag: 0 }, complexMultiply(s, { real: C1, imag: 0 }));
  
  // Simple RC low-pass filter
  const totalZ = complexAdd(ZR, ZC);
  return complexDivide(ZC, totalZ);
}

// Generic tone stack calculation dispatcher
export function calculateToneStackResponse(
  toneStackId: string,
  params: ToneStackParameters,
  frequency: number
): ComplexNumber {
  switch (toneStackId) {
    case 'fender-tmb':
      return calculateFenderTMBTransferFunction(params, frequency);
    case 'marshall-jcm800':
      return calculateMarshallTransferFunction(params, frequency);
    case 'vox-ac30':
      return calculateVoxTransferFunction(params, frequency);
    case 'boneyard-ray':
      // Use modified Fender-style for now
      return calculateFenderTMBTransferFunction(params, frequency);
    case 'rat-distortion':
      // Use Vox-style for RAT
      return calculateVoxTransferFunction(params, frequency);
    default:
      return calculateFenderTMBTransferFunction(params, frequency);
  }
}

// Calculate frequency response over a range
export function calculateFrequencyResponse(
  toneStackId: string,
  params: ToneStackParameters,
  startFreq: number = 10,
  endFreq: number = 20000,
  numPoints: number = 512
): FrequencyPoint[] {
  const response: FrequencyPoint[] = [];
  
  // Generate logarithmic frequency sweep
  const logStart = Math.log10(startFreq);
  const logEnd = Math.log10(endFreq);
  
  // Calculate reference magnitude at 1kHz for normalization
  const refTransferFunction = calculateToneStackResponse(toneStackId, params, 1000);
  const refMagnitude = complexMagnitude(refTransferFunction);
  
  for (let i = 0; i < numPoints; i++) {
    const logFreq = logStart + (i / (numPoints - 1)) * (logEnd - logStart);
    const frequency = Math.pow(10, logFreq);
    
    const transferFunction = calculateToneStackResponse(toneStackId, params, frequency);
    const magnitude = complexMagnitude(transferFunction);
    const phase = complexPhase(transferFunction);
    
    // Normalize to reference and convert to dB
    const normalizedMagnitude = magnitude / refMagnitude;
    const magnitudeDB = 20 * Math.log10(Math.max(normalizedMagnitude, 1e-10));
    const phaseDeg = phase * 180 / Math.PI;
    
    response.push({
      frequency,
      magnitude: magnitudeDB,
      phase: phaseDeg
    });
  }
  
  return response;
}

// Convert tone stack preset to parameters
export function presetToParameters(preset: any, controls: any): ToneStackParameters {
  return {
    R1: 250000,  // Will be overridden by specific implementations
    R2: 1000000,
    R3: 25000,
    C1: 250e-12,
    C2: 22e-9,
    treble: controls.treble ?? 0.5,
    bass: controls.bass ?? 0.5,
    mid: controls.mid ?? 0.5
  };
}