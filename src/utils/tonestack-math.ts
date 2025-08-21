// Tone stack circuit analysis based on YATSC implementation
// https://github.com/why-trv/yet-another-tonestack-calculator

export interface ComplexNumber {
  real: number;
  imag: number;
}

export interface ToneStackCircuit {
  // Component values in standard units
  R1: number;  // Ohms
  R2: number;  // Ohms  
  R3: number;  // Ohms
  C1: number;  // Farads
  C2: number;  // Farads
  C3?: number; // Farads (optional)
  
  // Control positions (0-1)
  treble: number;
  bass: number;
  mid?: number;
}

export interface FrequencyPoint {
  frequency: number;
  magnitude: number; // in dB
  phase: number;     // in degrees
}

// Complex number operations
export const complex = {
  add: (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({
    real: a.real + b.real,
    imag: a.imag + b.imag
  }),
  
  multiply: (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({
    real: a.real * b.real - a.imag * b.imag,
    imag: a.real * b.imag + a.imag * b.real
  }),
  
  divide: (a: ComplexNumber, b: ComplexNumber): ComplexNumber => {
    const denom = b.real * b.real + b.imag * b.imag;
    return {
      real: (a.real * b.real + a.imag * b.imag) / denom,
      imag: (a.imag * b.real - a.real * b.imag) / denom
    };
  },
  
  magnitude: (c: ComplexNumber): number => 
    Math.sqrt(c.real * c.real + c.imag * c.imag),
  
  phase: (c: ComplexNumber): number => 
    Math.atan2(c.imag, c.real),
    
  fromPolar: (magnitude: number, phase: number): ComplexNumber => ({
    real: magnitude * Math.cos(phase),
    imag: magnitude * Math.sin(phase)
  })
};

// Calculate complex impedance of a resistor
export function resistorImpedance(R: number): ComplexNumber {
  return { real: R, imag: 0 };
}

// Calculate complex impedance of a capacitor at frequency ω
export function capacitorImpedance(C: number, omega: number): ComplexNumber {
  return { real: 0, imag: -1 / (omega * C) };
}

// Calculate parallel impedance of two complex impedances
export function parallelImpedance(Z1: ComplexNumber, Z2: ComplexNumber): ComplexNumber {
  const numerator = complex.multiply(Z1, Z2);
  const denominator = complex.add(Z1, Z2);
  return complex.divide(numerator, denominator);
}

// Calculate series impedance
export function seriesImpedance(Z1: ComplexNumber, Z2: ComplexNumber): ComplexNumber {
  return complex.add(Z1, Z2);
}

// Fender TMB tone stack analysis (most common)
export function calculateFenderTMBResponse(
  circuit: ToneStackCircuit,
  frequency: number
): ComplexNumber {
  const omega = 2 * Math.PI * frequency;
  
  // Component impedances
  const ZR1 = resistorImpedance(circuit.R1 * circuit.treble); // Treble pot
  const ZR2 = resistorImpedance(circuit.R2 * circuit.bass);   // Bass pot
  const ZR3 = resistorImpedance(circuit.R3);                 // Slope resistor
  const ZC1 = capacitorImpedance(circuit.C1, omega);         // Treble cap
  const ZC2 = capacitorImpedance(circuit.C2, omega);         // Bass cap
  
  // Circuit analysis using nodal analysis
  // This is a simplified version - full implementation would solve the complete circuit
  
  // Treble path: R1 in series with C1
  const treblePath = seriesImpedance(ZR1, ZC1);
  
  // Bass path: R2 in series with C2
  const bassPath = seriesImpedance(ZR2, ZC2);
  
  // Mid path: R3
  const midPath = ZR3;
  
  // Combine paths (simplified - actual circuit is more complex)
  const totalImpedance = parallelImpedance(
    parallelImpedance(treblePath, bassPath),
    midPath
  );
  
  // Calculate transfer function H(jω) = Vout/Vin
  // This is a simplified calculation - real implementation needs full nodal analysis
  const inputImpedance = { real: 1000000, imag: 0 }; // 1MΩ input
  const transferFunction = complex.divide(totalImpedance, 
    complex.add(totalImpedance, inputImpedance));
  
  return transferFunction;
}

// Marshall tone stack (different topology)
export function calculateMarshallResponse(
  circuit: ToneStackCircuit,
  frequency: number
): ComplexNumber {
  const omega = 2 * Math.PI * frequency;
  
  // Marshall has a different circuit topology
  // Simplified implementation
  const ZR1 = resistorImpedance(circuit.R1 * circuit.treble);
  const ZR2 = resistorImpedance(circuit.R2 * circuit.bass);
  const ZR3 = resistorImpedance(circuit.R3 * (circuit.mid || 0.5));
  const ZC1 = capacitorImpedance(circuit.C1, omega);
  const ZC2 = capacitorImpedance(circuit.C2, omega);
  
  // Different circuit arrangement for Marshall
  const path1 = seriesImpedance(ZR1, ZC1);
  const path2 = parallelImpedance(ZR2, ZC2);
  const combined = seriesImpedance(path1, parallelImpedance(path2, ZR3));
  
  const inputImpedance = { real: 1000000, imag: 0 };
  return complex.divide(combined, complex.add(combined, inputImpedance));
}

// Vox cut control (simple high-frequency roll-off)
export function calculateVoxResponse(
  circuit: ToneStackCircuit,
  frequency: number
): ComplexNumber {
  const omega = 2 * Math.PI * frequency;
  
  const ZR = resistorImpedance(circuit.R1 * (circuit.treble || 0.5)); // Cut control
  const ZC = capacitorImpedance(circuit.C1, omega);
  
  // Simple RC low-pass filter
  const totalZ = seriesImpedance(ZR, ZC);
  return complex.divide(ZC, totalZ);
}

// Calculate frequency response for a tone stack
export function calculateToneStackFrequencyResponse(
  toneStackId: string,
  circuit: ToneStackCircuit,
  startFreq: number = 10,
  endFreq: number = 20000,
  numPoints: number = 512
): FrequencyPoint[] {
  const response: FrequencyPoint[] = [];
  
  // Generate logarithmic frequency sweep
  const logStart = Math.log10(startFreq);
  const logEnd = Math.log10(endFreq);
  const logStep = (logEnd - logStart) / (numPoints - 1);
  
  for (let i = 0; i < numPoints; i++) {
    const frequency = Math.pow(10, logStart + i * logStep);
    
    let transferFunction: ComplexNumber;
    
    // Calculate transfer function based on tone stack type
    switch (toneStackId) {
      case 'fender-tmb':
        transferFunction = calculateFenderTMBResponse(circuit, frequency);
        break;
      case 'marshall-jcm800':
        transferFunction = calculateMarshallResponse(circuit, frequency);
        break;
      case 'vox-ac30':
        transferFunction = calculateVoxResponse(circuit, frequency);
        break;
      default:
        transferFunction = calculateFenderTMBResponse(circuit, frequency);
    }
    
    // Convert to magnitude (dB) and phase (degrees)
    const magnitude = complex.magnitude(transferFunction);
    const magnitudeDB = 20 * Math.log10(magnitude);
    const phaseDeg = complex.phase(transferFunction) * 180 / Math.PI;
    
    response.push({
      frequency,
      magnitude: magnitudeDB,
      phase: phaseDeg
    });
  }
  
  return response;
}

// Convert component values to proper units
export function convertComponentValues(preset: any): ToneStackCircuit {
  const components = preset.components;
  
  // Find components by their labels/IDs
  const treblePot = components.find((c: any) => c.label.toLowerCase().includes('treble'));
  const bassPot = components.find((c: any) => c.label.toLowerCase().includes('bass'));
  const midRes = components.find((c: any) => c.label.toLowerCase().includes('mid'));
  const trebleCap = components.find((c: any) => c.label.toLowerCase().includes('treble') && c.type === 'capacitor');
  const bassCap = components.find((c: any) => c.label.toLowerCase().includes('bass') && c.type === 'capacitor');
  
  return {
    R1: treblePot?.value || 250000,
    R2: bassPot?.value || 250000,
    R3: midRes?.value || 25000,
    C1: (trebleCap?.value || 0.00025) * 1e-6, // Convert µF to F
    C2: (bassCap?.value || 0.022) * 1e-6,     // Convert µF to F
    treble: preset.controls.treble || 0.5,
    bass: preset.controls.bass || 0.5,
    mid: preset.controls.mid || 0.5
  };
}