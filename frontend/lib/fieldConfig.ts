/**
 * Configuration for field types
 * Plain text paths store innerText only (no HTML)
 * All other paths store sanitized innerHTML (preserves styling)
 */

export const PLAIN_TEXT_PATHS = new Set<string>([
  // Add paths that should be plain text only (no HTML)
  // Examples:
  // "header.email",
  // "header.phone",
  // "experience.0.startDate",
  // "experience.0.endDate",
]);

export const isPlainTextPath = (path: string): boolean => {
  return PLAIN_TEXT_PATHS.has(path);
};

