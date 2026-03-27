import OpenAI from "openai";
import type { CronConfig, WorkflowPerformance } from "@/lib/types";
import { WORKFLOW_TYPE_LABELS, CHANNEL_LABELS, FREQUENCY_LABELS } from "@/lib/constants";

function getClient() {
  return new OpenAI();
}

interface DebriefRequest {
  workflows: CronConfig[];
  performance: WorkflowPerformance[];
}

function buildDebriefPrompt(
  workflows: CronConfig[],
  performance: WorkflowPerformance[]
): string {
  const perfByWorkflow = new Map(performance.map((p) => [p.workflowId, p]));

  const report = workflows
    .filter((w) => w.status === "active")
    .map((w) => {
      const p = perfByWorkflow.get(w.id);
      if (!p) return "";
      return `### ${w.name}
- Type: ${WORKFLOW_TYPE_LABELS[w.type]} | Channel: ${CHANNEL_LABELS[w.channel]} | ${FREQUENCY_LABELS[w.schedule.frequency]}
- Runs this week: ${p.runs}
- Impressions: ${p.impressions} | Clicks: ${p.clicks} | Conversions: ${p.conversions}
- Engagement rate: ${p.engagementRate}% (trend: ${p.trend})
- Top performing content: ${p.topContent}
- Notes: ${p.notes}`;
    })
    .filter(Boolean)
    .join("\n\n");

  return `You are FirstCMO, a senior brand strategist delivering a weekly marketing debrief to a startup founder.

## Context
This is the founder's weekly marketing debrief. They have ${workflows.length} automations running. Below is the performance data from this past week.

## Performance Data
${report}

## Your Task
Deliver a clear, structured weekly debrief. The founder is a technical person who doesn't know marketing — explain everything in plain language. Structure it as:

1. **This Week's Headline** — One sentence summary. What's the single most important thing that happened?

2. **What Worked** — Which automations performed well? WHY did they work? Connect cause to effect. "The Discord activation posts at 5:30pm got 2x the engagement of morning posts — evening timing aligns with when your players are actually online and thinking about tonight's game."

3. **What Didn't** — Which automations underperformed? Diagnose WHY. Don't just say "engagement was down" — explain the likely cause. "The retention DMs had a 25% drop — you've been using the same template for 2 weeks and the message feels automated now. People stop responding to messages that don't feel personal."

4. **The Pattern** — What trend or insight connects multiple data points? "Across all your channels, content with a competitive angle (leaderboards, challenges, rivalry) consistently outperforms informational content. Your audience responds to status and competition, not features."

5. **Next Week's Moves** — 2-3 specific, concrete adjustments. Not vague advice. "Switch your Discord activation post from informational to challenge-based: 'Who's taking the throne tonight?' instead of 'Game at 6pm.' Rotate your retention DM templates — write 3 new variants with different hooks."

Be direct, opinionated, and specific. Use the actual numbers. This should feel like a 1:1 with a marketing lead who actually looked at the data, not a generic report.`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DebriefRequest;
    const { workflows, performance } = body;

    const client = getClient();
    const prompt = buildDebriefPrompt(workflows, performance);

    const stream = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2000,
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: "Give me my weekly debrief. What happened, why, and what should I change?",
        },
      ],
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
