export const APP_NAME = "Zeta Terminal";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ACCEPTED_FILE_TYPES = [
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/pdf",
  "application/json",
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const FILE_CATEGORY_LABELS: Record<string, string> = {
  brand: "Brand Asset",
  document: "Document",
  design: "Design File",
  data: "Data",
  "landing-page": "Landing Page",
  competitor: "Competitor",
  social: "Social Profile",
  other: "Other",
};

export const WORKFLOW_TYPE_LABELS: Record<string, string> = {
  "daily-activation": "Daily Activation",
  "retention-sequence": "Retention Sequence",
  "referral-push": "Referral Push",
  "influencer-content": "Influencer Content",
  "community-engagement": "Community Engagement",
  "promo-event": "Promo Event",
  "agent-outreach": "Agent Outreach",
  "social-post": "Social Post",
};

export const CHANNEL_LABELS: Record<string, string> = {
  discord: "Discord",
  "instagram-feed": "IG Feed",
  "instagram-stories": "IG Stories",
  twitter: "Twitter / X",
  email: "Email",
  sms: "SMS",
  "in-app": "In-App",
};

export const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
  custom: "Custom",
};

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const NAV_ITEMS = [
  { label: "Command Center", href: "/", icon: "LayoutDashboard" as const },
  { label: "Strategy", href: "/chat", icon: "MessageSquare" as const },
  { label: "Automations", href: "/workflows", icon: "Workflow" as const },
  { label: "Assets", href: "/files", icon: "FolderOpen" as const },
];

export const STORAGE_KEYS = {
  files: "zeta-files",
  chat: "zeta-chat",
  workflows: "zeta-workflows",
};
