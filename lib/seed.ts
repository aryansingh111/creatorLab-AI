import type { Challenge, DB } from "./types";

export const CHALLENGES: Challenge[] = [
  {
    id: "fin-14", title: "14-day personal-finance content experiment", difficulty: "Beginner", days: 14,
    description: "Launch a 14-day content experiment for a fictional Indian personal-finance education brand.",
    outcomes: ["Define a specific audience and a measurable content goal.", "Create a content plan across at least two formats (e.g. short video and carousel).", "Use AI to draft content, then fact-check, edit, and approve it.", "Record post-level performance using a provided CSV or manual data.", "Explain what performed well, what did not, and what to test next."],
    deliverables: ["Audience brief", "10 content ideas", "5 finished drafts", "14-day calendar", "Metrics dashboard", "One-page reflection"],
    rubric: [
      { key: "audience", label: "Audience and objective", max: 20 }, { key: "quality", label: "Quality and originality", max: 20 },
      { key: "accuracy", label: "Accuracy and responsible AI use", max: 20 }, { key: "execution", label: "Execution and consistency", max: 15 },
      { key: "analytics", label: "Analytics and interpretation", max: 15 }, { key: "reflection", label: "Reflection and next experiment", max: 10 },
    ],
  },
  {
    id: "edu-7", title: "7-day study-tips short-video sprint", difficulty: "Intermediate", days: 7,
    description: "Plan and test seven short videos for a fictional exam-preparation brand.",
    outcomes: ["Write a measurable goal.", "Test two hook styles.", "Compare results with the engagement-rate formula."],
    deliverables: ["Goal statement", "7 scripts", "Results table", "Next-test plan"],
    rubric: [
      { key: "audience", label: "Audience and objective", max: 25 }, { key: "quality", label: "Quality and originality", max: 25 },
      { key: "analytics", label: "Analytics and interpretation", max: 30 }, { key: "reflection", label: "Reflection", max: 20 },
    ],
  },
];

export const SEED: DB = {
  challenges: CHALLENGES,
  projects: [{
    id: "p1", challengeId: "fin-14", name: "RupeeWise 14-day experiment", niche: "Personal finance education (India)",
    audience: "First-job earners aged 22–28 in metro cities", goal: "Reach 30,000 people and 500 saves in 14 days",
    platforms: ["Instagram", "YouTube Shorts"], tone: "Friendly", deadline: "2026-11-17",
  }],
  content: [
    { id: "c1", projectId: "p1", title: "SIP myths in 30 seconds", type: "script", platform: "Instagram", status: "published", scheduledFor: "2026-11-03", publishedAt: "2026-11-03", body: "[0-3s] Hook: Is SIP really risk-free?\n[3-25s] Three myths and the facts.\n[25-30s] CTA: save this.", demo: true },
    { id: "c2", projectId: "p1", title: "Emergency fund carousel", type: "carousel", platform: "Instagram", status: "published", scheduledFor: "2026-11-05", publishedAt: "2026-11-05", body: "Slide 1: How many months do you need?\nSlide 2: Where to park it.\nSlide 3: Common mistakes.", demo: true },
    { id: "c3", projectId: "p1", title: "Old vs new tax regime", type: "script", platform: "YouTube Shorts", status: "published", scheduledFor: "2026-11-08", publishedAt: "2026-11-08", body: "Compare both regimes using one salary example. Verify slabs on the official site before posting.", demo: true },
    { id: "c4", projectId: "p1", title: "Credit score basics", type: "caption", platform: "Instagram", status: "needs_review", scheduledFor: "2026-11-11", body: "Your credit score is a habit report card. Three habits that move it.", demo: true },
    { id: "c5", projectId: "p1", title: "Budgeting with 50/30/20", type: "idea", platform: "YouTube Shorts", status: "idea", scheduledFor: "2026-11-13", body: "Show the rule on a ₹40,000 salary.", demo: true },
  ],
  metrics: [
    { id: "m1", projectId: "p1", date: "2026-11-03", contentTitle: "SIP myths in 30 seconds", platform: "Instagram", impressions: 5400, reach: 4100, likes: 320, comments: 41, shares: 58, clicks: 96, conversions: 12, source: "Demo data" },
    { id: "m2", projectId: "p1", date: "2026-11-05", contentTitle: "Emergency fund carousel", platform: "Instagram", impressions: 3900, reach: 3000, likes: 210, comments: 22, shares: 35, clicks: 70, source: "Demo data" },
    { id: "m3", projectId: "p1", date: "2026-11-08", contentTitle: "Old vs new tax regime", platform: "YouTube Shorts", impressions: 8800, reach: 7200, likes: 540, comments: 88, shares: 120, clicks: 210, conversions: 31, source: "Demo data" },
  ],
  submissions: [{ id: "s1", projectId: "p1", summary: "", evidenceUrl: "", status: "draft" }],
};
