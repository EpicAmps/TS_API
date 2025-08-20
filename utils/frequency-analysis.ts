import type { BiQuadCoefficients, FrequencyResponse } from '~/types/audio';

export function calculateFrequencyResponse(
  coefficients: BiQuadCoefficients[],
  sampleRate: number,
  numPoints: number = 512
): FrequencyResponse[] {
  const response: FrequencyResponse[] = [];
  const nyquist = sampleRate / 2;
  
  for (let i = 0; i < numPoints; i++) {
    const frequency = (i / numPoints) * nyquist;
    const omega = 2 * Math.PI * frequency / sampleRate;
    
    let totalMagnitude = 1;
    let totalPhase = 0;
    
    // Calculate combined response of all filters
    for (const coeffs of coefficients) {
      const { magnitude, phase } = calculateSingleFilterResponse(coeffs, omega);
      totalMagnitude *= magnitude;
      totalPhase += phase;
    }
    
    response.push({
      frequency,
      magnitude: 20 * Math.log10(Math.abs(totalMagnitude)), // Convert to dB
      phase: totalPhase * 180 / Math.PI // Convert to degrees
    });
  }
  
  return response;
}

function calculateSingleFilterResponse(
  coeffs: BiQuadCoefficients,
  omega: number
): { magnitude: number; phase: number } {
  const { b0, b1, b2, a1, a2 } = coeffs;
  
  // Calculate numerator (zeros)
  const numReal = b0 + b1 * Math.cos(omega) + b2 * Math.cos(2 * omega);
  const numImag = -b1 * Math.sin(omega) - b2 * Math.sin(2 * omega);
  
  // Calculate denominator (poles)  
  const denReal = 1 + a1 * Math.cos(omega) + a2 * Math.cos(2 * omega);
  const denImag = -a1 * Math.sin(omega) - a2 * Math.sin(2 * omega);
  
  // Calculate magnitude and phase
  const numMag = Math.sqrt(numReal * numReal + numImag * numImag);
  const denMag = Math.sqrt(denReal * denReal + denImag * denImag);
  
  const magnitude = numMag / denMag;
  const phase = Math.atan2(numImag, numReal) - Math.atan2(denImag, denReal);
  
  return { magnitude, phase };
}

export function generateTestTone(
  frequency: number,
  duration: number,
  sampleRate: number,
  amplitude: number = 0.5
): number[] {
  const samples = Math.floor(duration * sampleRate);
  const tone = new Array(samples);
  
  for (let i = 0; i < samples; i++) {
    tone[i] = amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate);
  }
  
  return tone;
}

export function generateGuitarTestLoop(sampleRate: number = 44100): number[] {
  // Generate a simple guitar-like test signal with harmonics
  const duration = 2; // 2 seconds
  const samples = Math.floor(duration * sampleRate);
  const signal = new Array(samples);
  
  const fundamental = 220; // A3
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Fundamental + harmonics with decay envelope
    const envelope = Math.exp(-t * 2) * (1 + 0.3 * Math.sin(2 * Math.PI * 5 * t));
    
    signal[i] = envelope * (
      0.8 * Math.sin(2 * Math.PI * fundamental * t) +
      0.4 * Math.sin(2 * Math.PI * fundamental * 2 * t) +
      0.2 * Math.sin(2 * Math.PI * fundamental * 3 * t) +
      0.1 * Math.sin(2 * Math.PI * fundamental * 4 * t)
    ) * 0.3;
  }
  
  return signal;
}