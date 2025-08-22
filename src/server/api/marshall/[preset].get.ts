import { 
  MARSHALL_NOON_CURVE,
  MARSHALL_MODERN_CURVE, 
  MARSHALL_SCOOPED_CURVE,
  MARSHALL_DIMED_CURVE,
  getYATSCFrequencyResponse,
  createMarshallNoonFilter,
  createMarshallModernFilter,
  createMarshallScoopedFilter,
  createMarshallDimedFilter
} from '~/utils/yatsc-curves';

export default defineEventHandler(async (event) => {
  const presetId = getRouterParam(event, 'preset');
  
  if (!presetId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Marshall preset ID is required'
    });
  }

  try {
    let frequencyResponse;
    let filterCoefficients;
    let presetInfo;
    
    switch (presetId) {
      case 'marshall-noon':
        frequencyResponse = getYATSCFrequencyResponse(MARSHALL_NOON_CURVE);
        filterCoefficients = createMarshallNoonFilter();
        presetInfo = {
          name: 'All Knobs at Noon',
          description: 'Classic Marshall sound with all controls at 12 o\'clock',
          settings: 'Bass: 5, Mid: 5, Treble: 5'
        };
        break;
        
      case 'marshall-modern':
        frequencyResponse = getYATSCFrequencyResponse(MARSHALL_MODERN_CURVE);
        filterCoefficients = createMarshallModernFilter();
        presetInfo = {
          name: 'Modern Rock',
          description: 'Tight low end, focused mids, bright treble',
          settings: 'Bass: 10, Mid: 11, Treble: 1'
        };
        break;
        
      case 'marshall-scooped':
        frequencyResponse = getYATSCFrequencyResponse(MARSHALL_SCOOPED_CURVE);
        filterCoefficients = createMarshallScoopedFilter();
        presetInfo = {
          name: 'Scooped',
          description: 'Classic scooped midrange sound',
          settings: 'Bass: 9, Mid: 3, Treble: Noon'
        };
        break;
        
      case 'marshall-dimed':
        frequencyResponse = getYATSCFrequencyResponse(MARSHALL_DIMED_CURVE);
        filterCoefficients = createMarshallDimedFilter();
        presetInfo = {
          name: 'All Knobs Dimed',
          description: 'Maximum settings - aggressive and bright',
          settings: 'Bass: 10, Mid: 10, Treble: 10'
        };
        break;
        
      default:
      throw createError({
        statusCode: 404,
        statusMessage: `Marshall preset not found: ${presetId}. Available: marshall-noon, marshall-modern, marshall-scooped, marshall-dimed`
      });
    }


    return {
      success: true,
      data: {
        preset: presetInfo,
        frequencyResponse,
        filterCoefficients,
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