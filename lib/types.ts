export type Status = "idea" | "draft" | "needs_review" | "ready" | "published";
export const STATUSES: Status[] = ["idea", "draft", "needs_review", "ready", "published"];
export const PLATFORMS = ["Instagram", "YouTube Shorts", "LinkedIn", "X"] as const;
export const CONTENT_TYPES = ["idea", "hook", "caption", "script", "carousel", "cta"] as const;
export type SubStatus = "draft" | "submitted" | "in_review" | "changes_requested" | "accepted";

export interface Challenge {
  id: string; title: string; difficulty: "Beginner" | "Intermediate"; days: number; description: string;
  outcomes: string[]; deliverables: string[]; rubric: { key: string; label: string; max: number }[];
}
export interface Project {
  id: string; challengeId: string; name: string; niche: string; audience: string; goal: string;
  platforms: string[]; tone: string; deadline: string;
}
export interface ContentItem {
  id: string; projectId: string; title: string; type: string; body: string; platform: string;
  status: Status; scheduledFor?: string; publishedAt?: string; demo?: boolean;
}
export interface Metric {
  id: string; projectId?: string; date: string; contentTitle: string; platform: string; impressions?: number; reach?: number;
  likes?: number; comments?: number; shares?: number; clicks?: number; conversions?: number; source: "Demo data" | "Manual" | "CSV";
}
export interface Submission {
  id: string; projectId: string; summary: string; evidenceUrl: string; status: SubStatus; submittedAt?: string;
  review?: { scores: Record<string, number>; feedback: string; reviewedAt: string };
}
export interface DB { challenges: Challenge[]; projects: Project[]; content: ContentItem[]; metrics: Metric[]; submissions: Submission[] }
