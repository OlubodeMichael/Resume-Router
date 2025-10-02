import { getPdfItemsWithThumbs } from '@/lib/templates';
import { TemplateSelectionWrapper } from '@/components/Templates/TemplateSelectionWrapper';

export const revalidate = 3600;

export default async function Templates() {
  const items = await getPdfItemsWithThumbs(); // server cache + CDN cache
  return (
    <div className="px-6 py-8">
      <h1 className="text-center text-2xl font-semibold text-gray-900 mb-8">Templates</h1>
      <TemplateSelectionWrapper items={items} />
      
      {/* Credits Section */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            Templates created by the open source community. Special thanks to{' '}
            <a href="https://github.com/ryanfitzgerald" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Jake Ryan</a>,{' '}
            <a href="https://www.linkedin.com/in/--parth-patel--/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Parth Patel</a>,{' '}
            <a href="https://www.linkedin.com/in/noah-reeves-michael/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Noah Reeves</a>,{' '}
            <a href="https://www.linkedin.com/in/yao-wang-odu/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Yao Wang</a>,{' '}
            <a href="https://www.linkedin.com/in/erik-cupsa/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Erik Cupsa</a>,{' '}
            <a href="https://github.com/mattyDoe" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Matty Doe</a>, and{' '}
            <a href="https://www.linkedin.com/in/abdullahalhinaey/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Abdullah AL Hinaey</a> for their amazing work.
          </p>
        </div>
      </div>
    </div>
  );
}
