import { getToneStackById } from '~/data/tone-stacks';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tone stack ID is required'
    });
  }

  try {
    const toneStack = getToneStackById(id);
    
    if (!toneStack) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tone stack not found'
      });
    }

    return {
      success: true,
      data: toneStack
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch tone stack'
    });
  }
});