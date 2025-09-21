import { list } from '@vercel/blob';
import { unstable_cache } from 'next/cache';

export type PdfItem = {
  pdfUrl: string;
  thumbUrl?: string; // resolved, no probing needed
  title: string;
};

/** Build a map of available thumbnails under "Resume Template/Thumbs/" */
async function buildThumbsMap(): Promise<Map<string, string>> {
  const m = new Map<string, string>(); // key: lowercase pathname, val: url
  let cursor: string | undefined;

  do {
    const { blobs, cursor: next } = await list({
      prefix: 'Resume Template/Thumbs/',
      cursor,
      limit: 1000,
    });
    for (const b of blobs) {
      const lc = b.pathname.toLowerCase();
      if (lc.endsWith('.webp') || lc.endsWith('.png')) {
        // If both .webp and .png exist, keep .webp (insert webp after png to override or vice-versa)
        // We prefer webp: if a webp arrives later, it will overwrite the png
        m.set(lc, b.url);
      }
    }
    cursor = next ?? undefined;
  } while (cursor);

  return m;
}

/** Collect PDFs and attach exact thumb URL if present (pref .webp, then .png) */
async function _fetchPdfItems(): Promise<PdfItem[]> {
  const thumbs = await buildThumbsMap();
  const items: PdfItem[] = [];
  let cursor: string | undefined;

  do {
    const { blobs, cursor: next } = await list({
      prefix: 'Resume Template/',
      cursor,
      limit: 1000,
    });

    for (const b of blobs) {
      const lc = b.pathname.toLowerCase();
      if (!lc.endsWith('.pdf')) continue;

      const title =
        b.pathname.split('/').pop()?.replace(/\.pdf$/i, '') || 'template';

      // Build candidate *pathnames* (not URLs) in Thumbs/ with same nested path
      const thumbsBase = b.pathname
        .replace(/^Resume Template\//, 'Resume Template/Thumbs/')
        .replace(/\.pdf$/i, '');

      const webpKey = `${thumbsBase}.webp`.toLowerCase();
      const pngKey = `${thumbsBase}.png`.toLowerCase();

      const thumbUrl = thumbs.get(webpKey) ?? thumbs.get(pngKey);

      items.push({ pdfUrl: b.url, thumbUrl, title });
    }

    cursor = next ?? undefined;
  } while (cursor);

  return items;
}

/** Cached accessor (1h TTL) + tag for on-demand revalidation */
export const getPdfItemsWithThumbs = unstable_cache(
  _fetchPdfItems,
  ['blob-pdf-items-with-thumbs'],
  { revalidate: 60 * 60, tags: ['blob:templates'] }
);

/** If you still need just the URLs list somewhere else */
export const getPdfUrls = unstable_cache(
  async () => (await _fetchPdfItems()).map(i => i.pdfUrl),
  ['blob-pdf-urls'],
  { revalidate: 60 * 60, tags: ['blob:templates'] }
);
