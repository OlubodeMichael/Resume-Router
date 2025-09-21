import { ryanTemplate } from '@/Templates/html/ryan';
import { compileTemplate } from './compile';
import { ResumeData } from '@/types/resume';
export type TemplateId =
  | 'ryan'
 

export const TEMPLATE_IDS = new Set<TemplateId>([
  'ryan',
]);
const TEMPLATES: Record<TemplateId, string> = {
  ryan: ryanTemplate,
};

export function renderTemplateHtml(id: TemplateId, data: ResumeData): string {
  const base = TEMPLATES[id];
  if (!base) throw new Error(`Unknown template: ${id}`);
  return compileTemplate(base, data);
}

export function listTemplateIds(): TemplateId[] {
  return Object.keys(TEMPLATES) as TemplateId[];
}