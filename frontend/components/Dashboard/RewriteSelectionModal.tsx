"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, Sparkles } from "lucide-react";

interface RewriteSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: string;
  sectionContent: string; // Original content to analyze
  onConfirm: (selectedContent: string, customPrompt?: string) => void;
  isProcessing?: boolean;
}

/**
 * Modal for selecting which part of a section to rewrite and optionally providing a custom prompt
 */
export default function RewriteSelectionModal({
  isOpen,
  onClose,
  sectionType,
  sectionContent,
  onConfirm,
  isProcessing = false,
}: RewriteSelectionModalProps) {
  const [selectedOption, setSelectedOption] = useState<"entire" | "custom">("entire");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedBullets, setSelectedBullets] = useState<number[]>([]);
  const [bullets, setBullets] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Parse bullets from content
  useEffect(() => {
    if (sectionContent) {
      // Extract bullet points (lines starting with •, -, *, or numbered)
      const lines = sectionContent.split("\n").map((l) => l.trim()).filter(Boolean);
      const extractedBullets: string[] = [];

      lines.forEach((line) => {
        // Check if it's a bullet point
        if (
          line.startsWith("•") ||
          line.startsWith("-") ||
          line.startsWith("*") ||
          /^\d+[\.\)]\s/.test(line)
        ) {
          // Remove bullet marker
          const cleanLine = line.replace(/^[•\-\*]\s*/, "").replace(/^\d+[\.\)]\s*/, "");
          if (cleanLine) {
            extractedBullets.push(cleanLine);
          }
        }
      });

      setBullets(extractedBullets);
    }
  }, [sectionContent]);

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

  // Format section type for display
  const formatSectionType = (type: string): string => {
    return type
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const handleToggleBullet = (index: number) => {
    setSelectedBullets((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleConfirm = () => {
    let contentToRewrite = sectionContent;

    // If custom selection and bullets are selected, extract only those bullets
    if (selectedOption === "custom" && selectedBullets.length > 0) {
      const selectedBulletTexts = selectedBullets
        .sort((a, b) => a - b)
        .map((idx) => bullets[idx])
        .join("\n");
      contentToRewrite = selectedBulletTexts;
    }

    // If no bullets selected in custom mode, use entire content
    if (selectedOption === "custom" && selectedBullets.length === 0) {
      contentToRewrite = sectionContent;
    }

    onConfirm(contentToRewrite, customPrompt.trim() || undefined);
  };

  const hasBullets = bullets.length > 0;
  const canProceed = selectedOption === "entire" || (selectedOption === "custom" && selectedBullets.length > 0);

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
        className="relative bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 tracking-tight">
                AI Rewrite
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatSectionType(sectionType)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
            disabled={isProcessing}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Selection Options */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Selection Type
              </label>
              
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                  <input
                    type="radio"
                    name="rewriteOption"
                    value="entire"
                    checked={selectedOption === "entire"}
                    onChange={() => setSelectedOption("entire")}
                    className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    disabled={isProcessing}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                      Entire Section
                    </div>
                    <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Rewrite all content in this section
                    </div>
                  </div>
                </label>

                {hasBullets && (
                  <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                    <input
                      type="radio"
                      name="rewriteOption"
                      value="custom"
                      checked={selectedOption === "custom"}
                      onChange={() => setSelectedOption("custom")}
                      className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                      disabled={isProcessing}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                        Select Bullet Points
                      </div>
                      <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Choose specific bullets to rewrite
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Bullet Selection (if custom option) */}
            {selectedOption === "custom" && hasBullets && (
              <div className="border-t border-gray-100 pt-5">
                <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
                  Select Bullets
                </label>
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {bullets.map((bullet, index) => (
                      <label
                        key={index}
                        className="flex items-start gap-3 p-2.5 rounded-md hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBullets.includes(index)}
                          onChange={() => handleToggleBullet(index)}
                          className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                          disabled={isProcessing}
                        />
                        <span className="flex-1 text-xs text-gray-700 leading-relaxed">{bullet}</span>
                      </label>
                    ))}
                  </div>
                  {selectedBullets.length === 0 && (
                    <p className="text-xs text-amber-600 mt-3 px-2 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                      Select at least one bullet point to continue
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Custom Prompt */}
            {(selectedOption === "entire" || selectedOption === "custom") && (
              <div className="border-t border-gray-100 pt-5">
                <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2.5">
                  Custom Instructions
                  <span className="ml-1.5 text-gray-400 font-normal normal-case">(Optional)</span>
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., Make it more concise, focus on technical achievements, use action verbs..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white transition-all"
                  rows={3}
                  disabled={isProcessing}
                />
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Provide specific guidance for how you&apos;d like the content rewritten
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={!canProceed || isProcessing}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:hover:shadow-md"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Rewrite with AI</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


