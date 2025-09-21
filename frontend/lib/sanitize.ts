// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHtml(dirty: string) {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'p','br','strong','b','em','i','u','s','code','span',
      'ul','ol','li','a','h1','h2','h3','h4'
    ],
    ALLOWED_ATTR: ['href','target','rel','style'],
    FORBID_TAGS: ['img','iframe','script','style'],
  })
}
