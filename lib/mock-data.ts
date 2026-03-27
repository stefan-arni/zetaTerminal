import type { CronConfig, UploadedFile, WorkflowPerformance } from "@/lib/types";

export const MOCK_FILES: UploadedFile[] = [
  {
    id: "file-001",
    name: "bluffingface-brand-kit.pdf",
    type: "application/pdf",
    size: 3_200_000,
    content: "BluffingFace Brand Kit: 3D online poker platform. Tagline: 'Probably one of your most loving face.' Primary colors: deep navy #0F172A, electric green #22C55E. Voice: fun, competitive, community-driven. Target: recreational poker players 21-40 who want a social, visually immersive experience.",
    uploadedAt: "2026-03-10T10:00:00Z",
    category: "brand",
  },
  {
    id: "file-002",
    name: "go-to-market-plan.md",
    type: "text/markdown",
    size: 22_000,
    content: "# BluffingFace GTM Plan\n\n## Phase 1: Build the Core Table (Now)\nGoal: 50-100 regular daily players by end of Q2 2026.\n\n## Channels\n- Jake's IG (30k followers) → Discord → Sign-up\n- Poker agent partnerships (access to player pools)\n- Referral program: Give $10, Get $10\n- High hand promos: $200 for hitting a high hand\n\n## Key Challenge\nNeed a consistent daily game at 6-7pm ET. Scattered acquisition is worse than none — players who log into an empty lobby churn instantly.\n\n## Metrics That Matter\n- Daily active tables at peak hour\n- Discord → sign-up conversion rate\n- Day 7 and Day 30 retention\n- Referral loop velocity",
    uploadedAt: "2026-03-10T10:05:00Z",
    category: "document",
  },
  {
    id: "file-003",
    name: "player-acquisition-funnel.csv",
    type: "text/csv",
    size: 4_500,
    content: "Stage,Count,Conversion\nJake IG Impressions,15000,—\nIG Story Link Clicks,1200,8%\nDiscord Joins,340,28%\nPlatform Sign-ups,95,28%\nFirst Game Played,42,44%\nPlayed 3+ Times,18,43%\nDaily Regular,8,44%",
    uploadedAt: "2026-03-15T14:30:00Z",
    category: "data",
  },
];

export const MOCK_WORKFLOWS: CronConfig[] = [
  {
    id: "wf-001",
    name: "Daily table activation — Discord",
    description: "Post a daily game reminder in Discord at 5:30pm ET to fill the 6pm table. Include current sign-up count, any promo running that night, and a direct join link.",
    type: "daily-activation",
    schedule: {
      frequency: "daily",
      dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
      timeOfDay: "17:30",
      timezone: "America/New_York",
    },
    channel: "discord",
    contentBrief: "Write a short, hype Discord message (2-3 sentences) announcing tonight's game. Mention the time (6pm ET), any active promo (high hand bonus, referral bonus), and how many players are already confirmed. Tone: casual, competitive, fun. End with a call to action to click the join link.",
    status: "active",
    createdAt: "2026-03-12T14:00:00Z",
    lastRunAt: "2026-03-26T21:30:00Z",
    nextRunAt: "2026-03-27T21:30:00Z",
  },
  {
    id: "wf-002",
    name: "Jake's IG story — game night teaser",
    description: "Draft an Instagram story script for Jake to post every afternoon, teasing tonight's game and driving traffic to Discord.",
    type: "influencer-content",
    schedule: {
      frequency: "daily",
      dayOfWeek: [1, 2, 3, 4, 5],
      timeOfDay: "15:00",
      timezone: "America/New_York",
    },
    channel: "instagram-stories",
    contentBrief: "Write a quick IG story script (spoken, 15-20 seconds) for Jake. He should tease tonight's game, mention any promo, and tell people to hit the link in bio for the Discord. Keep it natural — Jake's voice is chill but competitive. Vary the hook each day: sometimes a bad beat story, sometimes a promo highlight, sometimes a challenge.",
    status: "active",
    createdAt: "2026-03-12T14:00:00Z",
    lastRunAt: "2026-03-26T19:00:00Z",
    nextRunAt: "2026-03-27T19:00:00Z",
  },
  {
    id: "wf-003",
    name: "Lapsed player re-engagement",
    description: "Identify players who haven't played in 5+ days and send them a personalized nudge via Discord DM or email with a reason to come back tonight.",
    type: "retention-sequence",
    schedule: {
      frequency: "daily",
      dayOfWeek: [1, 2, 3, 4, 5],
      timeOfDay: "16:00",
      timezone: "America/New_York",
    },
    channel: "discord",
    contentBrief: "Draft a short, personal re-engagement message for lapsed players. Reference how many days since they last played. Give them a specific reason to come back: a promo, a rival who's been winning, a new feature. Tone: friendly, not desperate. Include the direct game link.",
    status: "active",
    createdAt: "2026-03-14T10:00:00Z",
    lastRunAt: "2026-03-26T20:00:00Z",
    nextRunAt: "2026-03-27T20:00:00Z",
  },
  {
    id: "wf-004",
    name: "Weekly referral leaderboard",
    description: "Post a weekly referral leaderboard in Discord showing top referrers and their rewards. Drives competitive referral behavior.",
    type: "referral-push",
    schedule: {
      frequency: "weekly",
      dayOfWeek: [5],
      timeOfDay: "12:00",
      timezone: "America/New_York",
    },
    channel: "discord",
    contentBrief: "Create a referral leaderboard post for Discord. Show the top 5 referrers this week with their referral count and total rewards earned. Celebrate the leader. Remind everyone about the Give $10 / Get $10 program and how to share their referral link. Tone: competitive, celebratory.",
    status: "draft",
    createdAt: "2026-03-18T16:00:00Z",
  },
  {
    id: "wf-005",
    name: "Agent partnership check-in",
    description: "Weekly outreach template for poker agents — update them on player activity, promos, and ask about upcoming player groups they can route to BluffingFace.",
    type: "agent-outreach",
    schedule: {
      frequency: "weekly",
      dayOfWeek: [1],
      timeOfDay: "10:00",
      timezone: "America/New_York",
    },
    channel: "email",
    contentBrief: "Draft a professional but warm check-in email for poker agents. Include: this week's player count and growth, any new promos they can share with their players, ask if they have any groups looking for a new platform this week. Keep it short — agents are busy. End with a specific ask.",
    status: "active",
    createdAt: "2026-03-20T10:00:00Z",
    lastRunAt: "2026-03-24T14:00:00Z",
    nextRunAt: "2026-03-31T14:00:00Z",
  },
];

/**
 * Generate mock performance data for any set of workflows.
 * Used for the weekly debrief demo — gives each workflow realistic-looking
 * metrics with some clear winners, losers, and trends the AI can analyze.
 */
export function generateMockPerformance(
  workflows: CronConfig[]
): WorkflowPerformance[] {
  return workflows
    .filter((w) => w.status === "active")
    .map((w) => {
      // Deterministic-ish "randomness" seeded by workflow id
      const seed = w.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const r = (min: number, max: number) =>
        Math.floor(min + ((seed * 9301 + 49297) % 233280) / 233280 * (max - min));

      const isDaily = w.schedule.frequency === "daily";
      const runs = isDaily ? r(5, 7) : r(1, 2);
      const impressions = runs * r(80, 400);
      const clicks = Math.floor(impressions * (r(3, 18) / 100));
      const conversions = Math.floor(clicks * (r(5, 30) / 100));
      const engagementRate = +(clicks / Math.max(impressions, 1) * 100).toFixed(1);

      const trends: Array<"up" | "down" | "flat"> = ["up", "down", "flat"];
      const trend = trends[seed % 3];

      const topContentOptions: Record<string, string[]> = {
        "daily-activation": [
          "\"Tonight's table is 🔥 — 8 players confirmed, high hand bonus active\" (32 clicks)",
          "\"Tuesday 6pm ET — who's in? Last night's winner took $340\" (28 clicks)",
        ],
        "influencer-content": [
          "Jake's story about the bad beat at the final table (1.2K views, 89 link clicks)",
          "\"Watch me play this hand wrong\" reel — 3.4K views, 142 profile visits",
        ],
        "retention-sequence": [
          "\"Hey [name], the table's been empty without you\" — 18% reply rate",
          "\"You left $10 referral credit on the table\" — 24% re-engagement",
        ],
        "referral-push": [
          "Leaderboard post drove 6 new referral shares in 24hrs",
          "\"Top referrer this week won $50 bonus\" — 12 new referral link copies",
        ],
        "agent-outreach": [
          "Monday check-in email — 3/5 agents replied, 1 confirmed new player group",
          "Agent Mike routed 8 players after seeing this week's promo sheet",
        ],
      };

      const contentOpts = topContentOptions[w.type] ?? [
        `Best performing content from ${w.name}`,
      ];
      const topContent = contentOpts[seed % contentOpts.length];

      const noteOptions: Record<string, string[]> = {
        up: [
          "Engagement up 40% vs last week — the more personal tone is landing better.",
          "Strong week. Click-through rate doubled after switching to evening send times.",
          "New high. The competitive angle in copy is resonating with this audience.",
        ],
        down: [
          "Engagement dropped 25% — possible audience fatigue. Need to rotate messaging.",
          "Lower week. Tuesday and Wednesday posts underperformed — midweek may not be the slot.",
          "Decline likely due to repeating the same CTA. Time to test a new hook.",
        ],
        flat: [
          "Steady performance. Consistent but not growing — worth testing a new format.",
          "Flat week. The formula works but isn't breaking through. Try a bold creative test.",
          "Holding steady. Good baseline, but we should experiment to find the next gear.",
        ],
      };

      const notes = noteOptions[trend][seed % noteOptions[trend].length];

      return {
        workflowId: w.id,
        period: "Mar 19 – Mar 26, 2026",
        runs,
        impressions,
        clicks,
        conversions,
        engagementRate,
        topContent,
        trend,
        notes,
      };
    });
}
