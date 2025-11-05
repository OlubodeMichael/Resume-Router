import type { ResumeDraftEnvelope } from "@/types/content";

const keyFor = (id: string) => `resume-edited-content-${id}`;

export function loadLocal(id: string): ResumeDraftEnvelope | null {
  try {
    const raw = localStorage.getItem(keyFor(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.v === 1 ? parsed : null;
  } catch { 
    return null; 
  }
}

export function saveLocal(envelope: ResumeDraftEnvelope): void {
  try {
    localStorage.setItem(keyFor(envelope.resumeId), JSON.stringify(envelope));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function clearLocal(id: string): void {
  try {
    localStorage.removeItem(keyFor(id));
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

