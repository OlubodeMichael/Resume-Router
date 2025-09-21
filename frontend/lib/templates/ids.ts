
import type { TemplateId } from './registry';

export function templateIdFromUrl(url: string): TemplateId | null {
  try {
    const base = decodeURIComponent(new URL(url).pathname).split('/').pop() || '';
    const id = base.replace(/\.pdf$/i, '').toLowerCase();
    return id as TemplateId;
  } catch {
    return null;
  }
}
