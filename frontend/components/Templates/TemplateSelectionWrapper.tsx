'use client';

import { useAuth } from '@/hooks/authProvider';
import { TemplateProvider, useTemplate } from '@/hooks/TemplateProvider';
import Image from 'next/image';
import type { PdfItem } from '@/lib/templates';
import Loading from '@/components/loading';

// Generate a default resume ID for template selection
// In a real app, this would come from the current resume being worked on
const DEFAULT_RESUME_ID = 'current-resume';


function TemplateGrid({ items }: { items: PdfItem[] }) {
  const { selectedId, setSelectedTemplate, loading, dirty } = useTemplate();
  
  // Generate template IDs from template titles with unique suffixes
  const itemsWithIds = items.map((item, index) => ({
    ...item,
    id: `template-${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}-${index}`
  }));

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleViewTemplate = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank');
  };

  if (loading) {
    return (
      <Loading message="Loading templates..." className=""/>
    );
  }

  return (
    <div>
      {/* Selection Status */}
      {selectedId && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Selected Template: {itemsWithIds.find(item => item.id === selectedId)?.title || 'Unknown'}
              </p>
              {dirty && (
                <p className="text-xs text-blue-700 mt-1">
                  Changes saved locally. Will be saved to database when you finish building your resume.
                </p>
              )}
            </div>
            {dirty && (
              <div className="flex items-center text-xs text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Unsaved
              </div>
            )}
          </div>
        </div>
      )}

      {/* Template Grid with Selection */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {itemsWithIds.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <div
              key={item.id}
              className={`group relative transition-all duration-200 ${
                isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              {/* Thumbnail */}
              <div className={`aspect-[8.5/11] w-full overflow-hidden rounded-lg border transition-all duration-200 ${
                isSelected 
                  ? 'border-blue-500 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700 group-hover:border-gray-300'
              } bg-white dark:bg-gray-800 group-hover:shadow-md`}>
                {item.thumbUrl ? (
                  <Image
                    src={item.thumbUrl}
                    alt={`${item.title} thumbnail`}
                    width={340}
                    height={440}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                  </svg>
                </div>
              )}

              {/* Action Buttons */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTemplate(item.pdfUrl);
                    }}
                    className="bg-gray-600 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-white transition-colors hover:text-gray-900"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateSelect(item.id);
                    }}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="mt-3">
                <h3 className={`text-sm font-medium truncate ${
                  isSelected ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {item.title.charAt(0).toUpperCase() + item.title.slice(1)} Template
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      {!selectedId && (
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Click &quot;View&quot; to preview a template or &quot;Select&quot; to choose it. Your selection will be saved locally and can be applied when building your resume.
          </p>
        </div>
      )}

    </div>
  );
}

export function TemplateSelectionWrapper({ items }: { items: PdfItem[] }) {
  const { user } = useAuth();

  if (!user) {
    return <Loading message="Loading templates..." className=""/>
  }

  return (
    <TemplateProvider resumeId={DEFAULT_RESUME_ID} profileKey={user.id}>
      <TemplateGrid items={items} />
    </TemplateProvider>
  );
}
