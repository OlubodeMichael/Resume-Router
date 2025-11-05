// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML while preserving styling (bold, italic, colors, etc.)
 * This allows formatting tags and inline styles to be saved to JSON
 */
export function sanitizeHtml(dirty: string) {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'p','br','strong','b','em','i','u','s','code','span',
      'ul','ol','li','a','h1','h2','h3','h4','mark','small','sub','sup'
    ],
    ALLOWED_ATTR: ['href','target','rel','style','class','id'],
    // Note: ALLOWED_STYLES is not available in this version of DOMPurify
    // The 'style' attribute in ALLOWED_ATTR allows inline styles to be preserved
    FORBID_TAGS: ['img','iframe','script'],
  } as Parameters<typeof DOMPurify.sanitize>[1])
}
