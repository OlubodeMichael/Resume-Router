export type ResumeContent = Record<string, any>;

export type ResumeDraftEnvelope = {
  v: 1;
  resumeId: string;
  content: ResumeContent;   // <-- JSON saved to DB
  lastEditedAt: number;
  lastSyncedAt?: number;
  source: "local" | "server";
  cachedAt?: number;
};

