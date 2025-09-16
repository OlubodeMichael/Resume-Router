'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

type Item = { pdfUrl: string; thumbUrl?: string; title: string };

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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-[92vw] max-w-5xl h-[85vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-sm font-medium truncate">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
        <div className="w-full h-[calc(100%-44px)]">{children}</div>
      </div>
    </div>
  );
}

export function PdfGrid({ items }: { items: Item[] }) {
  const [openUrl, setOpenUrl] = useState<string | null>(null);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map(({ pdfUrl, thumbUrl, title }) => (
          <div
            key={pdfUrl}
            className="group cursor-pointer relative"
            onClick={() => setOpenUrl(pdfUrl)}
          >
            {/* Thumbnail */}
            <div className="aspect-[8.5/11] w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-shadow duration-200 group-hover:shadow-md">
              {thumbUrl ? (
                <Image
                  src={thumbUrl}
                  alt={`${title} thumbnail`}
                  width={340}
                  height={440}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
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

            {/* View button on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-white text-sm font-medium">View</span>
              </div>
            </div>

            {/* Title */}
            <div className="mt-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Modal viewer */}
      {openUrl && (
        <Modal onClose={() => setOpenUrl(null)} title={items.find(i => i.pdfUrl === openUrl)?.title || 'template'}>
          <iframe
            src={`${openUrl}#toolbar=0&view=FitH`}
            className="w-full h-full"
            title={items.find(i => i.pdfUrl === openUrl)?.title || 'template'}
          />
        </Modal>
      )}
    </>
  );
}
