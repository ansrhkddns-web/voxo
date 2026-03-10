'use server';

import {
  createGeneratedDraftPost,
  toDraftErrorMessage,
} from '@/lib/ai/generateDraft';

export async function generatePostDraft(formData: FormData) {
  try {
    const result = await createGeneratedDraftPost({
      artistName: String(formData.get('artistName') || ''),
      songTitle: String(formData.get('songTitle') || ''),
      language: String(formData.get('language') || 'English'),
      categoryId: String(formData.get('categoryId') || ''),
      concept: String(formData.get('concept') || ''),
    });

    return { success: true, postId: result.postId };
  } catch (error: unknown) {
    console.error('Gemini AI action error:', error);
    return { success: false, error: toDraftErrorMessage(error) };
  }
}
