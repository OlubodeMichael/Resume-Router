"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";

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
        className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Rewrite {formatSectionType(sectionType)} Section
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
            disabled={isProcessing}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Selection Options */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What would you like to rewrite?
              </label>
              
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="rewriteOption"
                    value="entire"
                    checked={selectedOption === "entire"}
                    onChange={() => setSelectedOption("entire")}
                    className="mt-1"
                    disabled={isProcessing}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Entire Section</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Rewrite the entire {formatSectionType(sectionType).toLowerCase()} section
                    </div>
                  </div>
                </label>

                {hasBullets && (
                  <label className="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="rewriteOption"
                      value="custom"
                      checked={selectedOption === "custom"}
                      onChange={() => setSelectedOption("custom")}
                      className="mt-1"
                      disabled={isProcessing}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Specific Bullet Points</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Select specific bullet points to rewrite
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Bullet Selection (if custom option) */}
            {selectedOption === "custom" && hasBullets && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select bullet points to rewrite:
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {bullets.map((bullet, index) => (
                    <label
                      key={index}
                      className="flex items-start gap-3 p-2 rounded hover:bg-white cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBullets.includes(index)}
                        onChange={() => handleToggleBullet(index)}
                        className="mt-1"
                        disabled={isProcessing}
                      />
                      <span className="flex-1 text-sm text-gray-700">{bullet}</span>
                    </label>
                  ))}
                </div>
                {selectedBullets.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2">
                    Please select at least one bullet point
                  </p>
                )}
              </div>
            )}

            {/* Custom Prompt */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Instructions (Optional)
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., Make it more concise, focus on technical achievements, use action verbs..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                disabled={isProcessing}
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide specific instructions for how you want the content rewritten
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={!canProceed || isProcessing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Rewrite with AI
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


