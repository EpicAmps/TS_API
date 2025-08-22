import { getMarshallPresets } from '~/utils/marshall-presets';

export default defineEventHandler(async (event) => {
  try {
    const presets = getMarshallPresets();
    
    return {
      success: true,
      data: {
        presets,
        count: presets.length,
        description: 'Marshall JCM800 tone stack presets based on YATSC calculations'
      }
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch Marshall presets'
    });
  }
});