import type { Status, SubStatus } from "./types";

// Content: forward flow, with any step allowed back to draft for edits.
const CONTENT: Record<Status, Status[]> = {
  idea: ["draft"], draft: ["needs_review", "idea"], needs_review: ["ready", "draft"], ready: ["published", "draft"], published: [],
};
export const canMoveContent = (from: Status, to: Status) => from === to || CONTENT[from].includes(to);

const SUB: Record<SubStatus, SubStatus[]> = {
  draft: ["submitted"], submitted: ["in_review"], in_review: ["changes_requested", "accepted"], changes_requested: ["submitted"], accepted: [],
};
export const canMoveSubmission = (from: SubStatus, to: SubStatus) => SUB[from].includes(to);
