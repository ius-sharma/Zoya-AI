import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

interface ChatRequestPayload {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
}

const ZOYA_SYSTEM_PROMPT = `You are Zoya, a witty, fun, loyal, and caring female AI sidekick and best friend.

STRICT CONVERSATIONAL RULES:
1. BE CONCISE & PUNCHY: Keep replies SHORT, crisp, and conversational (1 to 3 sentences maximum for casual chat). Text like a real best friend on WhatsApp/iMessage—never give long boring essays, unprompted summaries, or robotic paragraphs.
2. NATURAL HINGLISH/HINDI/ENGLISH: Match the user's exact vibe and language naturally (expressive natural Hinglish like "Arre sach me?", "Chal bata kya scene hai?", "Chill maar na!").
3. WITTY & PLAYFUL: Be funny, loyal, supportive, and clever with charming banter.
4. DETAILED ONLY WHEN ASKED: Only give longer responses, step-by-step guides, or code when the user explicitly asks for code, tutorials, or detailed explanations. Otherwise, keep it short, snappy, and full of personality.
5. NO CORPORATE BOT CLICHÉS: Never say "How may I assist you today?" or "As an AI...". You are Zoya, their ride-or-die AI bestie!`;

// In-memory cache for available Groq models
let cachedGroqModels: string[] | null = null;
let lastModelFetch = 0;

async function getActiveGroqModels(apiKey: string): Promise<string[]> {
  const now = Date.now();
  if (cachedGroqModels && cachedGroqModels.length > 0 && now - lastModelFetch < 300000) {
    return cachedGroqModels;
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      const rawList: Array<{ id: string; active?: boolean }> = data.data || [];
      // Filter active text/chat models
      const chatModels = rawList
        .filter((m) => m.active !== false)
        .map((m) => m.id)
        .filter(
          (id) =>
            !id.includes('whisper') &&
            !id.includes('guard') &&
            !id.includes('vision') &&
            !id.includes('embed')
        );

      console.log('✅ Active Groq Models found for your API key:', chatModels);
      if (chatModels.length > 0) {
        cachedGroqModels = chatModels;
        lastModelFetch = now;
        return chatModels;
      }
    }
  } catch (err) {
    console.warn('Failed to query dynamic Groq models:', err);
  }

  // Fallback defaults if query fails
  return [
    'llama-3.1-8b-instant',
    'llama-3.3-70b-versatile',
    'llama-3.2-3b-preview',
    'llama-3.2-1b-preview',
  ];
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestPayload = await req.json();
    const { messages = [] } = body;

    // Filter and sanitize messages to ensure no empty content (Groq requirement)
    const validMessages = messages
      .filter((m) => m && typeof m.content === 'string' && m.content.trim().length > 0)
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
        content: m.content.trim(),
      }));

    if (validMessages.length === 0) {
      return new Response('Please provide a message.', { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;

    // If Groq API key is present, stream real LLM response
    if (groqApiKey && groqApiKey.trim() !== '' && groqApiKey !== 'your_groq_api_key_here') {
      const apiKey = groqApiKey.trim();
      const modelsToTry = await getActiveGroqModels(apiKey);

      for (const model of modelsToTry) {
        try {
          const payload = {
            model,
            messages: [
              {
                role: 'system',
                content: ZOYA_SYSTEM_PROMPT,
              },
              ...validMessages,
            ],
            temperature: 0.85,
            max_tokens: 700,
            stream: true,
          };

          const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
          });

          if (groqResponse.ok && groqResponse.body) {
            const encoder = new TextEncoder();
            const decoder = new TextDecoder();
            const reader = groqResponse.body.getReader();

            const clientStream = new ReadableStream({
              async start(controller) {
                let buffer = '';
                try {
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                      const trimmed = line.trim();
                      if (!trimmed || trimmed.startsWith(':')) continue;
                      if (trimmed === 'data: [DONE]') continue;

                      if (trimmed.startsWith('data: ')) {
                        const jsonStr = trimmed.slice(6);
                        try {
                          const parsed = JSON.parse(jsonStr);
                          const content = parsed.choices?.[0]?.delta?.content;
                          if (content) {
                            controller.enqueue(encoder.encode(content));
                          }
                        } catch {
                          // ignore malformed SSE json chunks
                        }
                      }
                    }
                  }
                  controller.close();
                } catch (err) {
                  controller.error(err);
                }
              },
            });

            return new Response(clientStream, {
              headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
              },
            });
          } else {
            const errText = await groqResponse.text();
            console.warn(`Groq model "${model}" failed (${groqResponse.status}):`, errText);
          }
        } catch (err) {
          console.warn(`Groq model "${model}" fetch exception:`, err);
        }
      }
    }

    // Fallback if no models responded or key is missing
    const encoder = new TextEncoder();
    const fallbackText = `Arre dost! Main ready hoon bilkul! 💃✨\n\nBas ek chhota sa setup baaki hai: apne project ke **\`.env.local\`** file me jaao aur apni **\`GROQ_API_KEY\`** paste kar do:\n\n\`\`\`bash\nGROQ_API_KEY=gsk_your_actual_key_here\n\`\`\`\n\nJaise hi tum key daal kar dev server restart karoge, humari full-speed AI chat & voice shuru ho jayegi! 🔥`;

    const stream = new ReadableStream({
      async start(controller) {
        const words = fallbackText.split(' ');
        for (let i = 0; i < words.length; i++) {
          const word = words[i] + (i < words.length - 1 ? ' ' : '');
          controller.enqueue(encoder.encode(word));
          await new Promise((r) => setTimeout(r, 20));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('API /api/chat error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
