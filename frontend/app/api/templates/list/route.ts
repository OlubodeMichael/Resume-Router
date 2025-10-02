import { getPdfItemsWithThumbs } from '@/lib/templates';

export const revalidate = 3600;

export async function GET() {
  const items = await getPdfItemsWithThumbs();
  return new Response(JSON.stringify({ items }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
