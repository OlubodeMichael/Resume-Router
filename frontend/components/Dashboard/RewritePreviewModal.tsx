"use client";

import React, { useEffect, useRef } from "react";
import { X, Check, RotateCw, Loader2 } from "lucide-react";

interface RewritePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: string;
  originalContent: string; // Plain text or HTML
  rewrittenContent: string | null; // Plain text or HTML
  onAccept: (rewrittenContent: string) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
  creditCost?: number; // Optional: show cost
}

/**
 * Modal component showing side-by-side comparison of original vs rewritten content
 * Allows user to Accept, Regenerate, or Cancel
 */
export default function RewritePreviewModal({
  isOpen,
  onClose,
  sectionType,
  originalContent,
  rewrittenContent,
  onAccept,
  onRegenerate,
  isRegenerating = false,
  creditCost,
}: RewritePreviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const originalScrollRef = useRef<HTMLDivElement>(null);
  const rewrittenScrollRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Sync scrolling between both panels
  const handleOriginalScroll = () => {
    if (originalScrollRef.current && rewrittenScrollRef.current) {
      rewrittenScrollRef.current.scrollTop = originalScrollRef.current.scrollTop;
    }
  };

  const handleRewrittenScroll = () => {
    if (originalScrollRef.current && rewrittenScrollRef.current) {
      originalScrollRef.current.scrollTop = rewrittenScrollRef.current.scrollTop;
    }
  };

  // Format section type for display
  const formatSectionType = (type: string): string => {
    return type
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Convert plain text or JSON array to HTML with line breaks
  const formatContent = (content: string): string => {
    if (!content) return "";
    
    // If content already contains HTML tags, return as is
    if (content.includes("<")) {
      return content;
    }
    
    // Check if content is a JSON array (for bullets)
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.every(item => typeof item === "string")) {
        // Format as bullet points
        return parsed
          .map((bullet: string) => `<p class="mb-1">• ${escapeHtml(bullet.trim())}</p>`)
          .join("");
      }
    } catch {
      // Not JSON, continue with plain text processing
    }
    
    // Convert plain text to HTML with line breaks
    return content
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return "<br>";
        
        // Check if it's a bullet point
        if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
          const bulletText = trimmed.replace(/^[•\-\*]\s*/, "");
          return `<p class="mb-1">• ${escapeHtml(bulletText)}</p>`;
        }
        
        return `<p class="mb-2">${escapeHtml(trimmed)}</p>`;
      })
      .join("");
  };

  const escapeHtml = (text: string): string => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed top-0 right-0 bottom-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      style={{ left: 'var(--sidebar-width, 64px)' }}
    >
      {/* Backdrop - covers entire viewport including sidebar */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
        style={{ left: 0, width: '100vw', zIndex: 0 }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Rewrite Preview: {formatSectionType(sectionType)}
            </h2>
            {creditCost && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {creditCost} credit{creditCost !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Side by side comparison */}
        <div className="flex-1 flex overflow-hidden">
          {/* Original Content */}
          <div className="flex-1 flex flex-col border-r border-gray-200">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Original
              </h3>
            </div>
            <div
              ref={originalScrollRef}
              onScroll={handleOriginalScroll}
              className="flex-1 overflow-y-auto px-4 py-4 text-sm text-gray-700"
              style={{ maxHeight: "calc(90vh - 200px)" }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: formatContent(originalContent),
                }}
                className="prose prose-sm max-w-none"
              />
            </div>
          </div>

          {/* Rewritten Content */}
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                Rewritten
              </h3>
            </div>
            <div
              ref={rewrittenScrollRef}
              onScroll={handleRewrittenScroll}
              className="flex-1 overflow-y-auto px-4 py-4 text-sm text-gray-700"
              style={{ maxHeight: "calc(90vh - 200px)" }}
            >
              {isRegenerating ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-sm">Regenerating...</p>
                  </div>
                </div>
              ) : rewrittenContent ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatContent(rewrittenContent),
                  }}
                  className="prose prose-sm max-w-none"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>No rewritten content available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RotateCw className="w-4 h-4" />
                  Regenerate
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (rewrittenContent) {
                  onAccept(rewrittenContent);
                }
              }}
              disabled={!rewrittenContent || isRegenerating}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Accept Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


