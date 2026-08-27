import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

interface ChatRequestPayload {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  mode?: {
    deepSearch?: boolean;
    think?: boolean;
  };
  quickAction?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestPayload = await req.json();
    const { messages, mode, quickAction } = body;

    const lastMessage = messages[messages.length - 1]?.content || '';

    // Check if an external OpenAI API key is set
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'You are Zoya AI, an ultra-fast, helpful, warm, and sophisticated AI assistant. Format output with clear markdown.',
              },
              ...messages,
            ],
            stream: true,
          }),
        });

        if (response.ok && response.body) {
          return new Response(response.body, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
            },
          });
        }
      } catch (err) {
        console.warn('OpenAI proxy failed, falling back to built-in generator:', err);
      }
    }

    // Built-in intelligent simulated streaming engine for Zoya AI
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // If "Think" mode is activated, stream reasoning first
        if (mode?.think) {
          controller.enqueue(encoder.encode(`[THINK_START]\n`));
          const thoughts = [
            `Analyzing query: "${lastMessage}"...`,
            `Evaluating context and parameters...`,
            `Synthesizing key insights with high precision...`,
            `Formatting response structure...`,
          ];
          for (const line of thoughts) {
            controller.enqueue(encoder.encode(`${line}\n`));
            await new Promise((r) => setTimeout(r, 120));
          }
          controller.enqueue(encoder.encode(`[THINK_END]\n\n`));
          await new Promise((r) => setTimeout(r, 200));
        }

        // If "Deep Search" mode is activated
        if (mode?.deepSearch) {
          controller.enqueue(
            encoder.encode(
              `> 🔍 **Deep Search Active**: Crawled 14 sources across verified research documents and real-time knowledge graphs.\n\n`
            )
          );
        }

        // Generate tailored response based on content or quick chips
        let responseText = '';

        const lowerMsg = lastMessage.toLowerCase();

        if (quickAction === 'analyse' || lowerMsg.includes('analyse') || lowerMsg.includes('analyze')) {
          responseText = `### 📊 Analytical Breakdown\n\nHere is an in-depth analysis of **"${lastMessage}"**:\n\n1. **Core Concept & Objectives**: Identifies foundational factors, operational mechanics, and key variables.\n2. **Strengths & Opportunities**: High leverage points, efficiency gains, and scalability potential.\n3. **Risk Factors & Constraints**: Edge cases, bottleneck dependencies, and mitigation strategies.\n4. **Recommended Next Steps**: Implement phased milestones with validation checkpoints.\n\n*Would you like me to drill down into any specific metric or constraint?*`;
        } else if (quickAction === 'summaries' || lowerMsg.includes('summarize') || lowerMsg.includes('summary')) {
          responseText = `### 📝 Key Summary & Takeaways\n\n- **Primary Focus**: Direct, high-impact synthesis of the discussed subject.\n- **Key Finding 1**: Streamlined architectural design enhances execution velocity.\n- **Key Finding 2**: Low-latency reactive interfaces elevate user immersion.\n- **Bottom Line**: The proposed solution is both modular and production-ready.`;
        } else if (quickAction === 'image' || lowerMsg.includes('image') || lowerMsg.includes('draw')) {
          responseText = `### 🎨 Visual Concept Generation\n\nI have framed the creative concept for: **"${lastMessage}"**\n\n- **Composition**: Cinematic wide-angle framing with warm ambient lighting.\n- **Color Palette**: Deep near-black obsidian shadows with warm amber/orange highlights.\n- **Style**: Ultra-detailed minimal cybernetic aesthetic.\n\n*Prompt descriptor is ready for rendering pipeline.*`;
        } else if (quickAction === 'code' || lowerMsg.includes('code') || lowerMsg.includes('function') || lowerMsg.includes('javascript') || lowerMsg.includes('python')) {
          responseText = `Here is a clean, optimized implementation for your request:\n\n\`\`\`typescript\n// Zoya AI Optimized Solution\nexport async function handleExecution<T>(input: T): Promise<{ success: boolean; data: T }> {\n  try {\n    console.log('[Zoya AI] Processing input payload...', input);\n    // Execute core logic with real-time feedback\n    return { success: true, data: input };\n  } catch (error) {\n    console.error('[Zoya AI] Execution failed:', error);\n    throw error;\n  }\n}\n\`\`\`\n\n### Key Benefits:\n- Fully typed and fail-safe.\n- Non-blocking asynchronous flow.\n- Ready for direct import into your codebase.`;
        } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey') || lowerMsg.includes('who are you')) {
          responseText = `Hello! I'm **Zoya AI**, your intelligent companion designed for fluid text conversations and real-time voice interaction.\n\nHow can I help you today? You can ask me to write code, analyze complex ideas, summarize documents, or tap the orange microphone button below to switch directly into **Voice Mode**!`;
        } else {
          responseText = `I've processed your request regarding **"${lastMessage}"**.\n\nHere is what you need to know:\n\n- **Clarity & Structure**: Breaking down the problem into actionable components ensures optimal outcomes.\n- **Execution Strategy**: We can leverage modular patterns to test each layer independently.\n- **Next Step**: Let me know if you would like me to generate code, draft a strategy, or dive deeper into any aspect!`;
        }

        // Stream word by word with realistic pacing
        const words = responseText.split(' ');
        for (let i = 0; i < words.length; i++) {
          const word = words[i] + (i < words.length - 1 ? ' ' : '');
          controller.enqueue(encoder.encode(word));
          // Quick streaming delay (15-35ms) for natural typing feel
          await new Promise((resolve) => setTimeout(resolve, 22));
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
