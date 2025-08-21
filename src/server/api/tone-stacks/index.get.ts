import { getAllToneStacks } from '~/data/tone-stacks';

export default defineEventHandler(async (event) => {
  try {
    const toneStacks = getAllToneStacks();
    
    return {
      success: true,
      data: toneStacks,
      count: toneStacks.length
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch tone stacks'
    });
  }
});