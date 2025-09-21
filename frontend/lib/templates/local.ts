// lib/templateSelection/local.ts
const baseKey = 'rr:selectedTemplateId';

function key(profileKey?: string) {
  return profileKey ? `${baseKey}:${profileKey}` : baseKey;
}

export function getLocalTemplateId(profileKey?: string): string {
  if (typeof window === 'undefined') return '';
  try { return localStorage.getItem(key(profileKey)) || ''; } catch { return ''; }
}

export function setLocalTemplateId(id: string, profileKey?: string) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key(profileKey), id); } catch {}
}

export function clearLocalTemplateId(profileKey?: string) {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(key(profileKey)); } catch {}
}
