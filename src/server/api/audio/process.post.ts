import { getToneStackById } from '~/data/tone-stacks';
import { 
  calculateFenderTMBCoefficients,
  calculateMarshallCoefficients,
  calculateVoxCoefficients,
  ToneStackProcessor
} from '~/utils/biquad';
import { calculateFrequencyResponse } from '~/utils/frequency-analysis';
import type { AudioProcessingRequest, AudioProcessingResponse } from '~/types/audio';

export default defineEventHandler(async (event) => {
  const body = await readBody<AudioProcessingRequest>(event);
  
  const { toneStackId, controls, sampleRate = 44100, audioData } = body;
  
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

    // Calculate filter coefficients based on tone stack type and controls
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
        // Generic 3-band EQ for other tone stacks
        coefficients = calculateFenderTMBCoefficients(
          controls.bass ?? 0.5,
          controls.mid ?? 0.5,
          controls.treble ?? 0.5,
          sampleRate
        );
    }

    // Calculate frequency response
    const frequencyResponse = calculateFrequencyResponse(coefficients, sampleRate);
    
    // Process audio if provided
    let processedAudio;
    if (audioData && audioData.length > 0) {
      const processor = new ToneStackProcessor(coefficients);
      processedAudio = processor.processBuffer(audioData);
    }

    const response: AudioProcessingResponse = {
      processedAudio,
      frequencyResponse,
      filterCoefficients: coefficients
    };

    return {
      success: true,
      data: response
    };
    
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process audio'
    });
  }
});