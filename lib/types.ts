// ── Files ──

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  uploadedAt: string;
  category: FileCategory;
  sourceUrl?: string;
}

export type FileCategory =
  | "brand"
  | "document"
  | "design"
  | "data"
  | "landing-page"
  | "competitor"
  | "social"
  | "other";

// ── Chat ──

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  toolCalls?: ToolCallResult[];
}

export interface ToolCallResult {
  toolName: string;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
}

// ── Cron / Workflows ──

export interface CronConfig {
  id: string;
  name: string;
  description: string;
  type: WorkflowType;
  schedule: CronSchedule;
  channel: Channel;
  contentBrief: string;
  status: "active" | "paused" | "draft";
  createdAt: string;
  lastRunAt?: string;
  nextRunAt?: string;
}

export type WorkflowType =
  | "daily-activation"
  | "retention-sequence"
  | "referral-push"
  | "influencer-content"
  | "community-engagement"
  | "promo-event"
  | "agent-outreach"
  | "social-post";

export type Channel =
  | "discord"
  | "instagram-feed"
  | "instagram-stories"
  | "twitter"
  | "email"
  | "sms"
  | "in-app";

export interface CronSchedule {
  frequency: "daily" | "weekly" | "biweekly" | "monthly" | "custom";
  dayOfWeek?: number[];
  timeOfDay: string;
  timezone: string;
  customCron?: string;
}

// ── Performance / Debrief ──

export interface WorkflowPerformance {
  workflowId: string;
  period: string;
  runs: number;
  impressions: number;
  clicks: number;
  conversions: number;
  engagementRate: number;
  topContent: string;
  trend: "up" | "down" | "flat";
  notes: string;
}
