'use client';

import { useAuth } from '@/context/authProvider';
import { TemplateProvider, useTemplate } from '@/context/TemplateProvider';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { PdfItem } from '@/lib/templates';

// Generate a default resume ID for template selection
// In a real app, this would come from the current resume being worked on
const DEFAULT_RESUME_ID = 'current-resume';

// Modal component for viewing PDFs
function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (backdropRef.current && e.target === backdropRef.current) onClose();
    };
    const el = backdropRef.current;
    el?.addEventListener('click', onClick);
    return () => el?.removeEventListener('click', onClick);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-6"
    >
      <div className="w-full max-w-6xl h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 truncate flex-1 mx-4">{title}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 transition-colors duration-200 group"
            aria-label="Close modal"
          >
            <svg 
              className="w-5 h-5 text-gray-500 group-hover:text-gray-700" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="w-full h-[calc(100%-73px)] bg-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}

function TemplateGrid({ items }: { items: PdfItem[] }) {
  const { selectedId, setSelectedTemplate, loading, dirty } = useTemplate();
  const [openUrl, setOpenUrl] = useState<string | null>(null);
  
  // Generate template IDs from template titles
  const itemsWithIds = items.map((item) => ({
    ...item,
    id: `template-${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`
  }));

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleViewTemplate = (pdfUrl: string) => {
    setOpenUrl(pdfUrl);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
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
                    className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium text-gray-900 hover:bg-white transition-colors"
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
                  isSelected ? 'text-blue-900' : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {item.title}
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

      {/* Modal viewer */}
      {openUrl && (
        <Modal onClose={() => setOpenUrl(null)} title={itemsWithIds.find(i => i.pdfUrl === openUrl)?.title || 'template'}>
          <iframe
            src={`${openUrl}#toolbar=0&view=FitH`}
            className="w-full h-full"
            title={itemsWithIds.find(i => i.pdfUrl === openUrl)?.title || 'template'}
          />
        </Modal>
      )}
    </div>
  );
}

export function TemplateSelectionWrapper({ items }: { items: PdfItem[] }) {
  const { user } = useAuth();
  
  if (!user?.id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to select templates.</p>
      </div>
    );
  }

  return (
    <TemplateProvider resumeId={DEFAULT_RESUME_ID} profileKey={user.id}>
      <TemplateGrid items={items} />
    </TemplateProvider>
  );
}
