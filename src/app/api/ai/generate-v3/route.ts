import { NextRequest } from 'next/server';
import type { DraftAgent, DraftGenerationInput } from '@/lib/ai/generateDraft';
import {
  createGeneratedDraftPost,
  toDraftErrorMessage,
} from '@/lib/ai/generateDraft';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type StreamPayload =
  | { message: string }
  | { currentAgent: DraftAgent; progress: number }
  | { postId: string };

function encodeSseEvent(event: string, payload: StreamPayload) {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

function toDraftInput(body: Partial<DraftGenerationInput>): DraftGenerationInput {
  return {
    artistName: body.artistName?.trim() || '',
    songTitle: body.songTitle?.trim() || '',
    language: body.language?.trim() || 'English',
    categoryId: body.categoryId?.trim() || '',
    concept: body.concept?.trim() || '',
  };
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, payload: StreamPayload) => {
        controller.enqueue(encoder.encode(encodeSseEvent(event, payload)));
      };

      try {
        const body = (await req.json()) as Partial<DraftGenerationInput>;
        const input = toDraftInput(body);

        if (!input.artistName || !input.songTitle) {
          sendEvent('error', { message: '아티스트명과 곡 제목은 꼭 입력해주세요.' });
          return;
        }

        sendEvent('state', { currentAgent: 'research', progress: 5 });
        sendEvent('log', { message: `Starting draft pipeline for ${input.artistName} - ${input.songTitle}` });

        const result = await createGeneratedDraftPost(input, {
          onLog(message) {
            sendEvent('log', { message });
          },
          onState(currentAgent, progress) {
            sendEvent('state', { currentAgent, progress });
          },
        });

        sendEvent('complete', { postId: result.postId });
      } catch (error: unknown) {
        console.error('AI draft pipeline error:', error);
        sendEvent('error', { message: toDraftErrorMessage(error) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
