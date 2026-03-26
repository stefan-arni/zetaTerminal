import OpenAI from "openai";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { AGENT_TOOLS } from "@/lib/ai/tools";
import type { CronConfig, UploadedFile } from "@/lib/types";

function getClient() {
  return new OpenAI();
}

interface ChatRequest {
  messages: OpenAI.ChatCompletionMessageParam[];
  files: UploadedFile[];
  workflows: CronConfig[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;
    const { messages, files, workflows } = body;

    const systemPrompt = buildSystemPrompt(files, workflows);

    const client = getClient();
    const stream = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      tools: AGENT_TOOLS,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
            );
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: String(err) })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
