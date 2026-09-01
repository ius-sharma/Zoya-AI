import { NextRequest } from 'next/server';
import { LLMProvider, RagCitation, MemoryProfile } from '@/types/chat';
import { RagStore } from '@/utils/rag/store';

export const runtime = 'nodejs';

interface ChatRequestPayload {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  userName?: string;
  memoryProfile?: MemoryProfile;
  providerConfig?: {
    provider: LLMProvider;
    apiKey?: string;
    model?: string;
  };
  ragEnabled?: boolean;
}

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

      if (chatModels.length > 0) {
        cachedGroqModels = chatModels;
        lastModelFetch = now;
        return chatModels;
      }
    }
  } catch (err) {
    console.warn('Failed to query dynamic Groq models:', err);
  }

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
    const { messages = [], userName = 'Ayush', memoryProfile, providerConfig, ragEnabled = true } = body;

    const userDisplayName =
      typeof userName === 'string' && userName.trim()
        ? userName.trim()
        : memoryProfile?.userName?.trim() || 'Ayush';

    // Sanitize message history to remove any empty content
    const validMessages = messages
      .filter((m) => m && typeof m.content === 'string' && m.content.trim().length > 0)
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
        content: m.content.trim(),
      }));

    if (validMessages.length === 0) {
      return new Response('Please provide a message.', { status: 400 });
    }

    const lastUserMessage = [...validMessages].reverse().find((m) => m.role === 'user')?.content || '';

    // Check Local Knowledge Vault for relevant context (RAG)
    let ragContextBlock = '';
    let retrievedCitations: RagCitation[] = [];

    if (ragEnabled && lastUserMessage.trim()) {
      retrievedCitations = RagStore.query(lastUserMessage, 4);
      if (retrievedCitations.length > 0) {
        const contextEntries = retrievedCitations.map((cit, idx) => {
          const pageInfo = cit.pageNumber ? ` (Page ${cit.pageNumber})` : '';
          return `[Source ${idx + 1}: ${cit.fileName}${pageInfo}]\n"${cit.snippet}"`;
        });

        ragContextBlock = `\n\n=== LOCAL KNOWLEDGE VAULT (USER PRIVATE DOCUMENTS) ===
The following exact excerpts were retrieved from ${userDisplayName}'s local files. Use them to answer their question accurately.

${contextEntries.join('\n\n')}

STRICT LOCAL-RAG INSTRUCTIONS:
1. Ground your answer in the provided Local Knowledge Vault excerpts whenever relevant.
2. Explicitly cite the document name and page number (e.g. "According to your DBMS_Notes.pdf (Page 12)...") so ${userDisplayName} knows exactly where the answer comes from.
3. Maintain your signature witty, warm, supportive best-friend persona while providing precise answers.`;
      }
    }

    // Mini Memory context block
    let memoryContextBlock = '';
    if (memoryProfile && Array.isArray(memoryProfile.memories) && memoryProfile.memories.length > 0) {
      const memoryLines = memoryProfile.memories
        .map((m) => `- [${m.category.toUpperCase()}] ${m.key}: ${m.value}`)
        .join('\n');
      const isReturning = (memoryProfile.visitCount || 1) > 1;

      memoryContextBlock = `\n\n=== MINI MEMORY (THODI SI YAADDASHT - USER PROFILE & PREFERENCES) ===
You have persistent long-term memory about your friend ${userDisplayName}.
Here are the specific facts you remember about them:
${memoryLines}
Visit Count: ${memoryProfile.visitCount || 1} ${
        isReturning
          ? '(Returning user! Greet them warmly like an old buddy, e.g. "Arre ' + userDisplayName + ', wapas aa gaye!")'
          : ''
      }

MEMORY RULES & AUTOMATIC SAVING:
1. Seamlessly use these remembered facts to personalize your responses.
2. If ${userDisplayName} shares a new fact about themselves (such as their name, nickname, favorite food, hobby, job/student details, exam dates, or personal preferences), acknowledge it warmly.
3. When they share a new fact or ask you to remember something, append an exact tag at the end of your response:
<memory_save key="Descriptive Key" value="Exact Fact" category="preference|identity|goal|fact" />`;
    } else {
      memoryContextBlock = `\n\n=== MINI MEMORY (THODI SI YAADDASHT) ===
If ${userDisplayName} shares personal facts about themselves (e.g., "Mera naam Rahul hai", "Mujhe coffee pasand hai", "Mera exam 15 March ko hai"), acknowledge it warmly and emit an exact tag at the end of your response:
<memory_save key="Descriptive Key" value="Exact Fact" category="preference|identity|goal|fact" />`;
    }

    const dynamicSystemPrompt = `You are Zoya, a smart, witty, fun, loyal, and caring female AI sidekick and best friend.
You are chatting with your friend "${userDisplayName}". Naturally address ${userDisplayName} by their name occasionally like a close friend.

CORE CONVERSATIONAL & TECHNICAL RULES:
1. ALWAYS REPLY IN HINGLISH: You MUST always respond in natural, expressive Hinglish (a mix of Hindi and English). This is non-negotiable. Examples: "Arre ${userDisplayName}, ye toh easy hai!", "Chal bata kya scene hai?", "Dekh ${userDisplayName}, iska logic ye hai ki...", "Bhai mast question hai!". Even when explaining technical topics or code, your surrounding text MUST be in Hinglish. NEVER reply in pure formal English.
2. CONCISE IN CASUAL CHAT: Keep normal greetings and casual chitchat short, punchy, and conversational (1 to 3 sentences maximum).
3. NEVER USE ROLEPLAY ASTERISKS: NEVER output stage directions, emotional actions, or roleplay text in asterisks (e.g. NEVER write *waves excitedly*, *smiles*, *sighs*, *chuckles*, *giggles*, *blushes*). Text directly and naturally like a real human best friend on WhatsApp/Discord.
4. MANDATORY FULL CODE BLOCKS: Whenever ${userDisplayName} asks for code, scripts, programs, algorithms (e.g. Binary Search, sorting, React components, SQL queries), ALWAYS provide the complete, clean, runnable code inside standard markdown code blocks (\`\`\`language ... \`\`\`). NEVER just describe the code in words or skip the code block. Code comments can be in English but your explanation around the code MUST be in Hinglish.
5. PROFESSIONAL STRUCTURE: Use markdown headings, lists, and tables whenever explaining concepts, comparisons, or study notes.
6. NO CORPORATE BOT CLICHES: Never say "How may I assist you today?" or "As an AI...". You are Zoya, ${userDisplayName}'s ride-or-die AI bestie!${memoryContextBlock}${ragContextBlock}`;

    // Base headers with attached citations metadata
    const responseHeaders: Record<string, string> = {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    };


    if (retrievedCitations.length > 0) {
      responseHeaders['X-Rag-Citations'] = encodeURIComponent(JSON.stringify(retrievedCitations));
    }

    const provider = providerConfig?.provider || 'default';
    const userApiKey = providerConfig?.apiKey?.trim();
    const userModel = providerConfig?.model?.trim();

    // 1. ANTHROPIC CLAUDE PROVIDER
    if (provider === 'anthropic' && userApiKey) {
      const anthropicModel = userModel || 'claude-3-5-haiku-20241022';
      const anthropicMessages = validMessages.map((m) => ({
        role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
        content: m.content,
      }));

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': userApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: anthropicModel,
          max_tokens: 3000,
          system: dynamicSystemPrompt,
          messages: anthropicMessages,
          stream: true,
        }),
      });

      if (res.ok && res.body) {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const reader = res.body.getReader();

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
                  if (!trimmed.startsWith('data: ')) continue;
                  const jsonStr = trimmed.slice(6);
                  try {
                    const parsed = JSON.parse(jsonStr);
                    if (parsed.type === 'content_block_delta') {
                      const text = parsed.delta?.text;
                      if (text) controller.enqueue(encoder.encode(text));
                    }
                  } catch {
                    // Ignore parsing error for non-json SSE lines
                  }
                }
              }
              controller.close();
            } catch (err) {
              controller.error(err);
            }
          },
        });

        return new Response(clientStream, { headers: responseHeaders });
      }
    }

    // 2. OPENAI (ChatGPT) PROVIDER
    if (provider === 'openai' && userApiKey) {
      const openAiModel = userModel || 'gpt-4o-mini';
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userApiKey}`,
        },
        body: JSON.stringify({
          model: openAiModel,
          messages: [
            { role: 'system', content: dynamicSystemPrompt },
            ...validMessages,
          ],
          temperature: 0.7,
          stream: true,
        }),
      });

      if (res.ok && res.body) {
        return createOpenAICompatibleStream(res.body, responseHeaders);
      }
    }

    // 3. GOOGLE GEMINI PROVIDER (OpenAI-compatible endpoint)
    if (provider === 'gemini' && userApiKey) {
      const geminiModel = userModel || 'gemini-2.0-flash';
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userApiKey}`,
          },
          body: JSON.stringify({
            model: geminiModel,
            messages: [
              { role: 'system', content: dynamicSystemPrompt },
              ...validMessages,
            ],
            temperature: 0.7,
            stream: true,
          }),
        }
      );

      if (res.ok && res.body) {
        return createOpenAICompatibleStream(res.body, responseHeaders);
      }
    }

    // 4. USER'S CUSTOM GROQ KEY
    if (provider === 'groq' && userApiKey) {
      const customGroqModel = userModel || 'llama-3.3-70b-versatile';
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userApiKey}`,
        },
        body: JSON.stringify({
          model: customGroqModel,
          messages: [
            { role: 'system', content: dynamicSystemPrompt },
            ...validMessages,
          ],
          temperature: 0.7,
          stream: true,
        }),
      });

      if (res.ok && res.body) {
        return createOpenAICompatibleStream(res.body, responseHeaders);
      }
    }

    // 5. DEFAULT / FREE ZOYA CLOUD ENGINE (Built-in Server Groq API)
    const serverGroqKey = process.env.GROQ_API_KEY;
    if (serverGroqKey && serverGroqKey.trim() !== '' && serverGroqKey !== 'your_groq_api_key_here') {
      const apiKey = serverGroqKey.trim();
      const modelsToTry = await getActiveGroqModels(apiKey);

      for (const model of modelsToTry) {
        try {
          const payload = {
            model,
            messages: [
              {
                role: 'system',
                content: dynamicSystemPrompt,
              },
              ...validMessages,
            ],
            temperature: 0.7,
            max_tokens: 2500,
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
            return createOpenAICompatibleStream(groqResponse.body, responseHeaders);
          }
        } catch (err) {
          console.warn(`Default Groq model ${model} fetch failed:`, err);
        }
      }
    }

    // Friendly fallback if no provider or server key configured
    const encoder = new TextEncoder();
    const fallbackText = `Arre ${userDisplayName}! Main ready hoon!\n\nAap Settings me jaa kar apna koi bhi custom API key daal sakte hain (OpenAI, Claude, Gemini, ya Groq) ya server me **\`.env.local\`** me **\`GROQ_API_KEY\`** add kar lijiye!`;

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

    return new Response(stream, { headers: responseHeaders });
  } catch (err) {
    console.error('API /api/chat error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Helper to stream OpenAI-compatible SSE events
function createOpenAICompatibleStream(
  readableBody: ReadableStream<Uint8Array>,
  headers: Record<string, string> = {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  }
) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = readableBody.getReader();

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
                // Ignore malformed chunks
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

  return new Response(clientStream, { headers });
}
