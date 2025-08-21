import { getToneStackById } from '~/data/tone-stacks';
import { 
  calculateFenderTMBCoefficients,
  calculateMarshallCoefficients,
  calculateVoxCoefficients
} from '~/utils/biquad';
import { calculateFrequencyResponse } from '~/utils/frequency-analysis';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  const { toneStackId, controls, sampleRate = 44100 } = body;
  
  if (!toneStackId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tone stack ID is required'
    });
  }

  try {
    const toneStack = getToneStackById(toneStackId);
    
    if (!toneStack) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tone stack not found'
      });
    }

    // Calculate filter coefficients
    let coefficients;
    
    switch (toneStackId) {
      case 'fender-tmb':
        coefficients = calculateFenderTMBCoefficients(
          controls.bass ?? 0.5,
          controls.mid ?? 0.5,
          controls.treble ?? 0.5,
          sampleRate
        );
        break;
        
      case 'marshall-jcm800':
        coefficients = calculateMarshallCoefficients(
          controls.bass ?? 0.5,
          controls.mid ?? 0.5,
          controls.treble ?? 0.5,
          sampleRate
        );
        break;
        
      case 'vox-ac30':
        coefficients = calculateVoxCoefficients(
          controls.cut ?? 0.5,
          sampleRate
        );
        break;
        
      default:
        coefficients = calculateFenderTMBCoefficients(
          controls.bass ?? 0.5,
          controls.mid ?? 0.5,
          controls.treble ?? 0.5,
          sampleRate
        );
    }

    const frequencyResponse = calculateFrequencyResponse(coefficients, sampleRate);

    return {
      success: true,
      data: {
        toneStack,
        frequencyResponse,
        filterCoefficients: coefficients,
        controls
      }
    };
    
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to analyze tone stack'
    });
  }
});