import { loadLocal, saveLocal } from "./resumeStorage";
import type { ResumeDraftEnvelope } from "@/types/content";

export async function getOrFetchResume(
  resumeId: string, 
  fetchFromServer: () => Promise<Record<string, unknown>>
): Promise<ResumeDraftEnvelope> {
  const cached = loadLocal(resumeId);
  if (cached) {
    return cached;
  }

  const content = await fetchFromServer(); // JSON from DB
  const env: ResumeDraftEnvelope = {
    v: 1,
    resumeId,
    content,
    lastEditedAt: Date.now(),
    lastSyncedAt: Date.now(),
    source: "server",
    cachedAt: Date.now(),
  };
  saveLocal(env);
  return env;
}

