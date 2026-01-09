"use client";

import React, { useEffect, useRef } from "react";
import { X, Check, RotateCw, Loader2, Sparkles } from "lucide-react";

interface RewritePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: string;
  originalContent: string; // Plain text or HTML
  rewrittenContent: string | null; // Plain text or HTML
  onAccept: (rewrittenContent: string) => void;
  onRegenerate: () => void; // Opens the selection modal again
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

  // Note: Scroll sync removed since content is now stacked vertically
  // Each section has independent scrolling

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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        style={{ left: 0, width: '100vw', zIndex: 0 }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                AI Rewrite Preview
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {formatSectionType(sectionType)}
              </p>
            </div>
            {creditCost && (
              <span className="ml-2 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                {creditCost} credit{creditCost !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Stacked vertically (column) comparison */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {/* Original Content */}
          <div className="flex-1 flex flex-col bg-white m-4 mb-2 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Original Content
                </h3>
              </div>
            </div>
            <div
              ref={originalScrollRef}
              className="flex-1 overflow-y-auto px-6 py-5 text-sm text-gray-700 bg-white"
              style={{ maxHeight: "calc(42vh - 120px)" }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: formatContent(originalContent),
                }}
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
              />
            </div>
          </div>

          {/* Rewritten Content */}
          <div className="flex-1 flex flex-col bg-white m-4 mt-2 rounded-xl border-2 border-blue-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                  AI Rewritten Content
                </h3>
              </div>
            </div>
            <div
              ref={rewrittenScrollRef}
              className="flex-1 overflow-y-auto px-6 py-5 text-sm text-gray-700 bg-white"
              style={{ maxHeight: "calc(42vh - 120px)" }}
            >
              {isRegenerating || !rewrittenContent ? (
                <div className="flex items-center justify-center h-full min-h-[250px]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        {isRegenerating ? 'Generating rewrite...' : 'Loading...'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Please wait while AI improves your content
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatContent(rewrittenContent),
                  }}
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="flex items-center justify-between px-6 py-5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-blue-700 bg-white border-2 border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-blue-300"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Regenerating...</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-4 h-4" />
                  <span>Regenerate</span>
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
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Accept Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


