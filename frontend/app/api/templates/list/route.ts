import { getPdfItemsWithThumbs } from '@/lib/templates';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const items = await getPdfItemsWithThumbs();
  return new Response(JSON.stringify({ items }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
