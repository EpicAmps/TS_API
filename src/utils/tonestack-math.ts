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

// Fender TMB tone stack - based on YATSC's fender_tmb implementation
export function calculateFenderTMBTransferFunction(
  params: ToneStackParameters,
  frequency: number
): ComplexNumber {
  const omega = 2 * Math.PI * frequency;
  
  // Component values from YATSC
  const R1 = 250000;  // Treble pot
  const R2 = 1000000; // Bass pot  
  const R3 = 25000;   // Mid pot
  const C1 = 250e-12; // 250pF treble cap
  const C2 = 22e-9;   // 22nF bass cap
  const C3 = 250e-12; // 250pF additional cap
  
  // Control positions
  const treble = params.treble;
  const bass = params.bass;
  const mid = params.mid || 0.5;
  
  // Calculate impedances
  const ZC1 = capacitorImpedance(C1, omega);
  const ZC2 = capacitorImpedance(C2, omega);
  const ZC3 = capacitorImpedance(C3, omega);
  
  const ZR1_treble = resistorImpedance(R1 * treble);
  const ZR1_inv_treble = resistorImpedance(R1 * (1 - treble));
  const ZR2_bass = resistorImpedance(R2 * bass);
  const ZR2_inv_bass = resistorImpedance(R2 * (1 - bass));
  const ZR3 = resistorImpedance(R3);
  
  // Simplified transfer function calculation
  // This is a basic approximation - full YATSC uses complete nodal analysis
  const treblePath = seriesImpedance(ZR1_treble, ZC1);
  const bassPath = seriesImpedance(ZR2_bass, ZC2);
  const midPath = ZR3;
  
  const totalZ = parallelImpedance(parallelImpedance(treblePath, bassPath), midPath);
  const sourceZ = resistorImpedance(100000); // 100k source impedance
  
  return complexDivide(totalZ, complexAdd(totalZ, sourceZ));
}

// Marshall tone stack - different topology
export function calculateMarshallTransferFunction(
  params: ToneStackParameters,
  frequency: number
): ComplexNumber {
  const omega = 2 * Math.PI * frequency;
  
  // Marshall component values
  const R1 = 500000;  // Treble pot
  const R2 = 1000000; // Bass pot
  const R3 = 25000;   // Mid pot  
  const C1 = 220e-12; // 220pF
  const C2 = 22e-9;   // 22nF
  
  const treble = params.treble;
  const bass = params.bass;
  const mid = params.mid || 0.5;
  
  const ZC1 = capacitorImpedance(C1, omega);
  const ZC2 = capacitorImpedance(C2, omega);
  
  const ZR1 = resistorImpedance(R1 * treble);
  const ZR2 = resistorImpedance(R2 * bass);
  const ZR3 = resistorImpedance(R3 * mid);
  
  // Marshall has different circuit topology
  const path1 = seriesImpedance(ZR1, ZC1);
  const path2 = parallelImpedance(ZR2, ZC2);
  const combined = seriesImpedance(path1, parallelImpedance(path2, ZR3));
  
  const sourceZ = resistorImpedance(100000);
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
  
  const ZR = resistorImpedance(R1 * cut);
  const ZC = capacitorImpedance(C1, omega);
  
  // Simple RC low-pass filter
  const totalZ = seriesImpedance(ZR, ZC);
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
      // Use Fender-style for now
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
  
  for (let i = 0; i < numPoints; i++) {
    const logFreq = logStart + (i / (numPoints - 1)) * (logEnd - logStart);
    const frequency = Math.pow(10, logFreq);
    
    const transferFunction = calculateToneStackResponse(toneStackId, params, frequency);
    const magnitude = complexMagnitude(transferFunction);
    const phase = complexPhase(transferFunction);
    
    // Convert to dB
    const magnitudeDB = 20 * Math.log10(Math.max(magnitude, 1e-10)); // Prevent log(0)
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