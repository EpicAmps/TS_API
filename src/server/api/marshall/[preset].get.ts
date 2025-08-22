import { generateMarshallFrequencyResponse, getMarshallPreset } from '~/utils/marshall-presets';

export default defineEventHandler(async (event) => {
  const presetId = getRouterParam(event, 'preset');
  
  if (!presetId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Marshall preset ID is required'
    });
  }

  try {
    const preset = getMarshallPreset(presetId);
    
    if (!preset) {
      throw createError({
        statusCode: 404,
        statusMessage: `Marshall preset not found: ${presetId}`
      });
    }

    // Generate frequency response
    const frequencyResponse = generateMarshallFrequencyResponse(presetId);

    return {
      success: true,
      data: {
        preset,
        frequencyResponse,
        metadata: {
          componentValues: {
            R1: '33kΩ (slope)',
            R2: '4.7kΩ (mid)', 
            R3: '82kΩ (bass load)',
            C1: '220pF (treble)',
            C2: '22nF (bass)',
            C3: '220pF (slope)'
          },
          potentiometers: {
            treble: '500kΩ linear',
            mid: '25kΩ linear',
            bass: '1MΩ linear'
          }
        }
      }
    };
    
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate Marshall frequency response'
    });
  }
});