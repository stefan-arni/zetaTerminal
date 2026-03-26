import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const AGENT_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "suggest_workflow",
      description:
        "Suggest a new recurring marketing automation to the user. Use this when you have enough context about their business, audience, and growth bottleneck to propose a specific automated workflow. The user will see a card with the details and can accept or reject it.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Short, descriptive name for the automation",
          },
          description: {
            type: "string",
            description:
              "What this automation does, why it matters for their growth, and what outcome to expect",
          },
          type: {
            type: "string",
            enum: [
              "daily-activation",
              "retention-sequence",
              "referral-push",
              "influencer-content",
              "community-engagement",
              "promo-event",
              "agent-outreach",
              "social-post",
            ],
          },
          channel: {
            type: "string",
            enum: [
              "discord",
              "instagram-feed",
              "instagram-stories",
              "twitter",
              "email",
              "sms",
              "in-app",
            ],
          },
          frequency: {
            type: "string",
            enum: ["daily", "weekly", "biweekly", "monthly"],
          },
          dayOfWeek: {
            type: "array",
            items: { type: "number" },
            description: "Days of week (0=Sun, 1=Mon, ..., 6=Sat)",
          },
          timeOfDay: {
            type: "string",
            description: "Time in HH:MM 24h format",
          },
          contentBrief: {
            type: "string",
            description:
              "Detailed instructions for what content to generate each time this automation runs. Include tone, length, key elements to include, and any personalization notes.",
          },
        },
        required: [
          "name",
          "description",
          "type",
          "channel",
          "frequency",
          "timeOfDay",
          "contentBrief",
        ],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "modify_workflow",
      description: "Modify an existing automation's configuration.",
      parameters: {
        type: "object",
        properties: {
          workflowId: { type: "string" },
          changes: {
            type: "object",
            description: "Key-value pairs of fields to update",
          },
        },
        required: ["workflowId", "changes"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "pause_workflow",
      description: "Pause or resume an existing automation.",
      parameters: {
        type: "object",
        properties: {
          workflowId: { type: "string" },
          action: { type: "string", enum: ["pause", "resume"] },
        },
        required: ["workflowId", "action"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "request_file_info",
      description:
        "Ask the user to upload a specific type of file when you need more context — brand assets, funnel data, competitor info, audience demographics, etc.",
      parameters: {
        type: "object",
        properties: {
          fileType: {
            type: "string",
            description: "What kind of file is needed",
          },
          reason: {
            type: "string",
            description: "Why this file would help you build better automations",
          },
        },
        required: ["fileType", "reason"],
      },
    },
  },
];
