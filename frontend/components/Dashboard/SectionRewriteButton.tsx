"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { extractSectionContent } from "@/lib/sectionUtils";

interface SectionRewriteButtonProps {
  sectionType: string;
  sectionElement: HTMLElement;
  onRewrite: (sectionType: string, originalContent: string) => void;
  disabled?: boolean;
}

/**
 * Button component that appears on section hover for AI rewrite functionality
 * Shows a sparkles/wand icon and handles click to initiate rewrite
 */
export default function SectionRewriteButton({
  sectionType,
  sectionElement,
  onRewrite,
  disabled = false,
}: SectionRewriteButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSectionEmpty, setIsSectionEmpty] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Check if section is empty or locked (e.g., header section)
  useEffect(() => {
    if (!sectionElement) {
      setIsSectionEmpty(true);
      return;
    }

    // Don't allow rewrite for header section
    if (sectionType === "header") {
      setIsSectionEmpty(true);
      return;
    }

    // Extract content and check if it's empty
    try {
      const content = extractSectionContent(sectionElement);
      setIsSectionEmpty(!content || content.trim().length === 0);
    } catch (error) {
      console.error("Error checking section content:", error);
      setIsSectionEmpty(true);
    }
  }, [sectionElement, sectionType]);

  // Handle hover state on the section element
  useEffect(() => {
    if (!sectionElement || disabled || isSectionEmpty) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    sectionElement.addEventListener("mouseenter", handleMouseEnter);
    sectionElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      sectionElement.removeEventListener("mouseenter", handleMouseEnter);
      sectionElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [sectionElement, disabled, isSectionEmpty]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || isSectionEmpty || isLoading) return;

    try {
      setIsLoading(true);
      
      // Extract section content
      const originalContent = extractSectionContent(sectionElement);
      
      if (!originalContent || originalContent.trim().length === 0) {
        console.warn("Section content is empty, cannot rewrite");
        return;
      }

      // Call the rewrite handler
      onRewrite(sectionType, originalContent);
    } catch (error) {
      console.error("Error initiating rewrite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if section is empty or disabled
  if (disabled || isSectionEmpty) return null;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`absolute top-2 right-2 z-40 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white transition-all duration-200 ${
        isHovered
          ? "opacity-100 scale-100 shadow-lg"
          : "opacity-0 scale-95 pointer-events-none"
      } ${
        isLoading
          ? "cursor-wait"
          : "cursor-pointer hover:bg-blue-700 active:scale-95"
      }`}
      aria-label={`Rewrite ${sectionType} section with AI`}
      title={`Rewrite ${sectionType} section with AI`}
      onMouseEnter={(e) => {
        e.stopPropagation();
        setIsHovered(true);
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        setIsHovered(false);
      }}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
    </button>
  );
}

