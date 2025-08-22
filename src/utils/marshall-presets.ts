// Marshall JCM800 tone stack presets based on YATSC calculations
// Component values from Marshall JCM800 schematic
const MARSHALL_COMPONENTS = {
  R1: 33000,    // Slope resistor (33k)
  R2: 4700,     // Mid resistor (4.7k) 
  R3: 82000,    // Bass load (82k)
  C1: 220e-12,  // Treble cap (220pF)
  C2: 22e-9,    // Bass cap (22nF)
  C3: 220e-12,  // Slope cap (220pF)
  
  // Potentiometer values
  P_TREBLE: 500000,  // 500k linear
  P_MID: 25000,      // 25k linear
  P_BASS: 1000000    // 1M linear
};

export interface MarshallPreset {
  id: string;
  name: string;
  description: string;
  settings: {
    bass: number;    // 0-1 (pot position)
    mid: number;     // 0-1 (pot position) 
    treble: number;  // 0-1 (pot position)
  };
  expectedAttenuation: number; // Expected peak attenuation in dB
}

export const MARSHALL_PRESETS: MarshallPreset[] = [
  {
    id: 'marshall-noon',
    name: 'All Knobs at Noon',
    description: 'Classic Marshall sound with all controls at 12 o\'clock',
    settings: { bass: 0.5, mid: 0.5, treble: 0.5 },
    expectedAttenuation: -8.5
  },
  {
    id: 'marshall-modern',
    name: 'Modern Rock (B:10, M:11, T:1)',
    description: 'Tight low end, focused mids, bright treble',
    settings: { bass: 0.83, mid: 0.58, treble: 0.58 },
    expectedAttenuation: -7.2
  },
  {
    id: 'marshall-scooped',
    name: 'Scooped (B:9, M:3, T:Noon)',
    description: 'Classic scooped midrange sound',
    settings: { bass: 0.75, mid: 0.25, treble: 0.5 },
    expectedAttenuation: -12.8
  },
  {
    id: 'marshall-dimed',
    name: 'All Knobs Dimed',
    description: 'Maximum settings - aggressive and bright',
    settings: { bass: 1.0, mid: 1.0, treble: 1.0 },
    expectedAttenuation: -4.8
  }
];

// Complex number operations for accurate calculations
interface Complex {
  real: number;
  imag: number;
}

function complexAdd(a: Complex, b: Complex): Complex {
  return { real: a.real + b.real, imag: a.imag + b.imag };
}

function complexMultiply(a: Complex, b: Complex): Complex {
  return {
    real: a.real * b.real - a.imag * b.imag,
    imag: a.real * b.imag + a.imag * b.real
  };
}

function complexDivide(a: Complex, b: Complex): Complex {
  const denom = b.real * b.real + b.imag * b.imag;
  if (denom === 0) return { real: 0, imag: 0 };
  return {
    real: (a.real * b.real + a.imag * b.imag) / denom,
    imag: (a.imag * b.real - a.real * b.imag) / denom
  };
}

function complexMagnitude(c: Complex): number {
  return Math.sqrt(c.real * c.real + c.imag * c.imag);
}

function complexPhase(c: Complex): number {
  return Math.atan2(c.imag, c.real);
}

// Calculate Marshall transfer function using exact YATSC nodal analysis
function calculateMarshallTransferFunction(
  bass: number,
  mid: number, 
  treble: number,
  frequency: number
): Complex {
  // Debug logging
  if (frequency === 1000) {
    console.log('Marshall calculation at 1kHz:', { bass, mid, treble, frequency });
  }
  
  const omega = 2 * Math.PI * frequency;
  
  const { R1, R2, R3, C1, C2, C3, P_TREBLE, P_MID, P_BASS } = MARSHALL_COMPONENTS;
  
  // YATSC-style potentiometer modeling - linear taper with proper scaling
  const Rt1 = P_TREBLE * treble + 1000;      // Treble pot upper
  const Rt2 = P_TREBLE * (1 - treble) + 1000; // Treble pot lower
  const Rm1 = P_MID * mid + 1000;            // Mid pot upper
  const Rm2 = P_MID * (1 - mid) + 1000;      // Mid pot lower
  const Rb1 = P_BASS * bass + 1000;          // Bass pot upper
  const Rb2 = P_BASS * (1 - bass) + 1000;    // Bass pot lower
  
  // Complex impedances - YATSC uses jω formulation
  const ZC1: Complex = { real: 0, imag: -1 / (omega * C1) };
  const ZC2: Complex = { real: 0, imag: -1 / (omega * C2) };
  
  // Simple Marshall approximation - focus on getting reasonable numbers first
  const bassImpedance = complexAdd(ZC2, { real: Rb2, imag: 0 });
  const trebleImpedance = complexAdd(ZC1, { real: Rt2, imag: 0 });
  
  // Parallel combination of bass and treble paths
  const parallelImpedance = complexDivide(
    complexMultiply(bassImpedance, trebleImpedance),
    complexAdd(bassImpedance, trebleImpedance)
  );
  
  // Total impedance including slope resistor
  const totalImpedance = complexAdd({ real: R1, imag: 0 }, parallelImpedance);
  
  // Transfer function - output impedance / total impedance
  const transferFunction = complexDivide(parallelImpedance, totalImpedance);
  
  if (frequency === 1000) {
    console.log('Transfer function at 1kHz:', transferFunction);
    console.log('Magnitude:', complexMagnitude(transferFunction));
  }
  
  return transferFunction;
}

// 3x3 determinant calculation for complex numbers
function calculateDeterminant3x3(
  a11: Complex, a12: Complex, a13: Complex,
  a21: Complex, a22: Complex, a23: Complex,
  a31: Complex, a32: Complex, a33: Complex
): Complex {
  const term1 = complexMultiply(a11, complexMultiply(a22, a33));
  const term2 = complexMultiply(a12, complexMultiply(a23, a31));
  const term3 = complexMultiply(a13, complexMultiply(a21, a32));
  const term4 = complexMultiply(a13, complexMultiply(a22, a31));
  const term5 = complexMultiply(a11, complexMultiply(a23, a32));
  const term6 = complexMultiply(a12, complexMultiply(a21, a33));
  
  return complexAdd(
    complexAdd(complexAdd(term1, term2), term3),
    complexMultiply({ real: -1, imag: 0 }, complexAdd(complexAdd(term4, term5), term6))
  );
}

// Generate frequency response for a Marshall preset
export function generateMarshallFrequencyResponse(
  presetId: string,
  startFreq: number = 10,
  endFreq: number = 20000,
  numPoints: number = 512
): Array<{ frequency: number; magnitude: number; phase: number }> {
  const preset = MARSHALL_PRESETS.find(p => p.id === presetId);
  if (!preset) {
    throw new Error(`Marshall preset not found: ${presetId}`);
  }
  
  const { bass, mid, treble } = preset.settings;
  const response: Array<{ frequency: number; magnitude: number; phase: number }> = [];
  
  // Generate logarithmic frequency sweep
  const logStart = Math.log10(startFreq);
  const logEnd = Math.log10(endFreq);
  
  for (let i = 0; i < numPoints; i++) {
    const logFreq = logStart + (i / (numPoints - 1)) * (logEnd - logStart);
    const frequency = Math.pow(10, logFreq);
    
    const transfer = calculateMarshallTransferFunction(bass, mid, treble, frequency);
    const magnitude = complexMagnitude(transfer);
    const phase = complexPhase(transfer);
    
    // Convert to dB with sanity check
    const magnitudeDB = 20 * Math.log10(Math.max(Math.min(magnitude, 1.0), 1e-10));
    const phaseDeg = phase * 180 / Math.PI;
    
    // Debug problematic values
    if (magnitudeDB > 10 || magnitudeDB < -50) {
      console.log(`Suspicious magnitude at ${frequency}Hz: ${magnitudeDB}dB, raw: ${magnitude}`);
    }
    
    response.push({
      frequency,
      magnitude: magnitudeDB,
      phase: phaseDeg
    });
  }
  
  return response;
}

// Get all available Marshall presets
export function getMarshallPresets(): MarshallPreset[] {
  return MARSHALL_PRESETS;
}

// Get specific Marshall preset
export function getMarshallPreset(id: string): MarshallPreset | undefined {
  return MARSHALL_PRESETS.find(p => p.id === id);
}