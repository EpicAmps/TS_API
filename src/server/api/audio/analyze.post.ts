import { getToneStackById } from '~/data/tone-stacks';
import { 
  calculateFrequencyResponse,
  presetToParameters
} from '~/utils/tonestack-math';

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

    // Convert to parameters
    const params = presetToParameters(toneStack, controls);
    
    // Calculate frequency response
    const frequencyResponse = calculateFrequencyResponse(
      toneStackId,
      params,
      10,    // 10 Hz start
      20000, // 20 kHz end  
      512    // Number of points
    );

    return {
      success: true,
      data: {
        toneStack,
        frequencyResponse,
        params,
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