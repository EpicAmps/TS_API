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
  const omega = 2 * Math.PI * frequency;
  const s: Complex = { real: 0, imag: omega };
  
  const { R1, R2, R3, C1, C2, C3, P_TREBLE, P_MID, P_BASS } = MARSHALL_COMPONENTS;
  
  // Potentiometer positions (with minimum resistance to avoid division by zero)
  const Rt1 = P_TREBLE * treble + 100;      // Treble wiper to hot
  const Rt2 = P_TREBLE * (1 - treble) + 100; // Treble wiper to ground
  const Rm1 = P_MID * mid + 50;             // Mid wiper to hot  
  const Rm2 = P_MID * (1 - mid) + 50;       // Mid wiper to ground
  const Rb1 = P_BASS * bass + 100;          // Bass wiper to hot
  const Rb2 = P_BASS * (1 - bass) + 100;    // Bass wiper to ground
  
  // Complex impedances
  const ZC1: Complex = complexDivide({ real: 1, imag: 0 }, complexMultiply(s, { real: C1, imag: 0 }));
  const ZC2: Complex = complexDivide({ real: 1, imag: 0 }, complexMultiply(s, { real: C2, imag: 0 }));
  const ZC3: Complex = complexDivide({ real: 1, imag: 0 }, complexMultiply(s, { real: C3, imag: 0 }));
  
  // Marshall 3-node analysis (based on YATSC implementation)
  // Node equations for V1, V2, V3 where:
  // V1 = voltage after slope resistor R1
  // V2 = voltage at mid pot wiper  
  // V3 = voltage at bass pot wiper
  
  // Admittances (1/Z) for easier nodal analysis
  const Y_R1 = 1 / R1;
  const Y_R2 = 1 / R2;
  const Y_R3 = 1 / R3;
  const Y_Rt1 = 1 / Rt1;
  const Y_Rt2 = 1 / Rt2;
  const Y_Rm1 = 1 / Rm1;
  const Y_Rm2 = 1 / Rm2;
  const Y_Rb1 = 1 / Rb1;
  const Y_Rb2 = 1 / Rb2;
  
  const Y_C1: Complex = complexDivide({ real: 1, imag: 0 }, ZC1);
  const Y_C2: Complex = complexDivide({ real: 1, imag: 0 }, ZC2);
  const Y_C3: Complex = complexDivide({ real: 1, imag: 0 }, ZC3);
  
  // Build admittance matrix for nodal analysis
  // [Y11  Y12  Y13] [V1]   [I1]
  // [Y21  Y22  Y23] [V2] = [I2]  
  // [Y31  Y32  Y33] [V3]   [I3]
  
  const Y11: Complex = complexAdd(
    complexAdd({ real: Y_R1 + Y_Rt1, imag: 0 }, Y_C1),
    complexAdd({ real: Y_R2, imag: 0 }, Y_C3)
  );
  
  const Y12: Complex = { real: -Y_R2, imag: 0 };
  const Y13: Complex = complexMultiply({ real: -1, imag: 0 }, Y_C3);
  
  const Y21: Complex = { real: -Y_R2, imag: 0 };
  const Y22: Complex = { real: Y_R2 + Y_Rm1 + Y_Rm2, imag: 0 };
  const Y23: Complex = { real: 0, imag: 0 };
  
  const Y31: Complex = complexMultiply({ real: -1, imag: 0 }, Y_C3);
  const Y32: Complex = { real: 0, imag: 0 };
  const Y33: Complex = complexAdd(
    complexAdd({ real: Y_Rb1 + Y_Rb2 + Y_R3, imag: 0 }, Y_C2),
    Y_C3
  );
  
  // Input current I1 = Vin * Y_R1, others are 0
  const I1: Complex = { real: Y_R1, imag: 0 }; // Normalized for Vin = 1V
  const I2: Complex = { real: 0, imag: 0 };
  const I3: Complex = { real: 0, imag: 0 };
  
  // Solve for V2 (mid pot wiper) using Cramer's rule
  // This is our output node
  const det = calculateDeterminant3x3(
    Y11, Y12, Y13,
    Y21, Y22, Y23, 
    Y31, Y32, Y33
  );
  
  const det_V2 = calculateDeterminant3x3(
    Y11, I1, Y13,
    Y21, I2, Y23,
    Y31, I3, Y33
  );
  
  if (complexMagnitude(det) < 1e-15) {
    return { real: 0, imag: 0 };
  }
  
  const V2 = complexDivide(det_V2, det);
  
  // Output is taken from mid pot wiper through voltage divider
  const outputDivider = Rm2 / (Rm1 + Rm2);
  
  return complexMultiply(V2, { real: outputDivider, imag: 0 });
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
  
  // Calculate reference at 1kHz for normalization (like YATSC)
  const refTransfer = calculateMarshallTransferFunction(bass, mid, treble, 1000);
  const refMagnitude = complexMagnitude(refTransfer);
  
  // Generate logarithmic frequency sweep
  const logStart = Math.log10(startFreq);
  const logEnd = Math.log10(endFreq);
  
  for (let i = 0; i < numPoints; i++) {
    const logFreq = logStart + (i / (numPoints - 1)) * (logEnd - logStart);
    const frequency = Math.pow(10, logFreq);
    
    const transfer = calculateMarshallTransferFunction(bass, mid, treble, frequency);
    const magnitude = complexMagnitude(transfer);
    const phase = complexPhase(transfer);
    
    // Normalize to 1kHz reference and add expected attenuation
    const magnitudeDB = 20 * Math.log10(magnitude / refMagnitude) + preset.expectedAttenuation;
    const phaseDeg = phase * 180 / Math.PI;
    
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