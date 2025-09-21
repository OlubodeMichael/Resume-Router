import { getPdfItemsWithThumbs } from '@/lib/templates';
import { TemplateSelectionWrapper } from '@/components/Templates/TemplateSelectionWrapper';

export const revalidate = 3600;

export default async function Templates() {
  const items = await getPdfItemsWithThumbs(); // server cache + CDN cache
  return (
    <div className="px-6 py-8">
      <h1 className="text-center text-2xl font-semibold text-gray-900 mb-8">Templates</h1>
      <TemplateSelectionWrapper items={items} />
    </div>
  );
}
