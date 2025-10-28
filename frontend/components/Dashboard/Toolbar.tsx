"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  Undo2, 
  Redo2, 
  Palette, 
  Highlighter, 
  List, 
  ListOrdered, 
  Bold, 
  Italic, 
  Strikethrough, 
  Underline, 
  Code, 
  Link, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  ChevronDown,
  Download
} from "lucide-react";
import { exportToPDF, exportVectorPDF, generateFilename } from "@/lib/exportUtils";

interface ToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
}

type ActiveMap = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  code: boolean;
  link: boolean;
  superscript: boolean;
  subscript: boolean;
  bulletList: boolean;
  numberedList: boolean;
  alignLeft: boolean;
  alignCenter: boolean;
  alignRight: boolean;
  justify: boolean;
};

// Helper function to round font size to whole number
const roundFontSize = (fontSize: string): string => {
  const match = fontSize.match(/^(\d+\.?\d*)px$/);
  if (match) {
    const value = parseFloat(match[1]);
    return `${Math.round(value)}px`;
  }
  return fontSize; // Return as-is if not in px format
};

export default function Toolbar({ editorRef }: ToolbarProps) {
  const [currentFontSize, setCurrentFontSize] = useState<string>("12px");
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState<boolean>(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [showTextColorDropdown, setShowTextColorDropdown] = useState<boolean>(false);
  const [showBgColorDropdown, setShowBgColorDropdown] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const fontSizeButtonRef = useRef<HTMLButtonElement>(null);
  const textColorButtonRef = useRef<HTMLButtonElement>(null);
  const bgColorButtonRef = useRef<HTMLButtonElement>(null);
  const [isActive, setIsActive] = useState<ActiveMap>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    code: false,
    link: false,
    superscript: false,
    subscript: false,
    bulletList: false,
    numberedList: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    justify: false,
  });

  const selectionInsideEditor = useCallback((sel: Selection) => {
    if (!editorRef.current || !sel.rangeCount) return false;
    const r = sel.getRangeAt(0);
    const root = editorRef.current;
    const within =
      root.contains(r.commonAncestorContainer) ||
      root.contains(r.startContainer) ||
      root.contains(r.endContainer);
    return within;
  }, [editorRef]);

  const closestElement = (node: Node | null): HTMLElement | null => {
    if (!node) return null;
    const el =
      node.nodeType === Node.TEXT_NODE ? (node.parentElement as HTMLElement | null) : (node as HTMLElement | null);
    return el || null;
  };

  const refreshActive = useCallback(() => {
    const sel = window.getSelection();

    if (!sel || !sel.rangeCount || !editorRef.current || !selectionInsideEditor(sel)) {
      // Clear active states when no selection or selection is outside editor
      setIsActive({
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        code: false,
        link: false,
        superscript: false,
        subscript: false,
        bulletList: false,
        numberedList: false,
        alignLeft: false,
        alignCenter: false,
        alignRight: false,
        justify: false,
      });
      // Reset font size to default when outside editor
      setCurrentFontSize("12px");
      return;
    }

    const range = sel.getRangeAt(0);
    
    // For collapsed selections (cursor placement), still check current formatting state
    // This allows toolbar to work when clicking in formatted text like headers
    const baseEl = closestElement(range.collapsed ? range.startContainer : range.commonAncestorContainer);
    
    // If it's a collapsed selection and we're not in any formatted content, clear states
    if (range.collapsed) {
      const inFormattedContent = baseEl?.closest("h1, h2, h3, h4, h5, h6, strong, b, em, i, u, s, code, a");
      if (!inFormattedContent) {
        setIsActive({
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          code: false,
          link: false,
          superscript: false,
          subscript: false,
          bulletList: false,
          numberedList: false,
          alignLeft: false,
          alignCenter: false,
          alignRight: false,
          justify: false,
        });
        setCurrentFontSize("12px");
        return;
      }
    }

    const inA = baseEl?.closest("a");
    const inCode = baseEl?.closest("code, pre, .code");

    // Use queryCommandState for marks/blocks supported by execCommand.
    const state: ActiveMap = {
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikethrough: document.queryCommandState("strikeThrough"),
      code: !!inCode,
      link: !!inA,
      superscript: document.queryCommandState("superscript"),
      subscript: document.queryCommandState("subscript"),
      bulletList: document.queryCommandState("insertUnorderedList"),
      numberedList: document.queryCommandState("insertOrderedList"),
      alignLeft: document.queryCommandState("justifyLeft"),
      alignCenter: document.queryCommandState("justifyCenter"),
      alignRight: document.queryCommandState("justifyRight"),
      justify: document.queryCommandState("justifyFull"),
    };

    setIsActive(state);

    // Font size: look up computed font-size from nearest element
    if (baseEl) {
      // For headers and other elements, get the computed font size directly
      const computedStyle = window.getComputedStyle(baseEl);
      const currentFontSize = computedStyle.fontSize;
      
      // Check if we're in a header element - these should show their actual font size
      const headerElement = baseEl.closest("h1, h2, h3, h4, h5, h6");
      if (headerElement) {
        const headerStyle = window.getComputedStyle(headerElement);
        setCurrentFontSize(roundFontSize(headerStyle.fontSize));
      } else {
        // For other elements, use the existing logic
        let element = baseEl;
        let fontSize = null;
        
        while (element && element !== editorRef.current) {
          const elementStyle = window.getComputedStyle(element);
          const elementFontSize = elementStyle.fontSize;
          
          // If this element has a different font size than its parent, use it
          if (element.parentElement) {
            const parentFontSize = window.getComputedStyle(element.parentElement).fontSize;
            if (elementFontSize !== parentFontSize) {
              fontSize = elementFontSize;
              break;
            }
          } else {
            fontSize = elementFontSize;
            break;
          }
          
          element = element.parentElement;
        }
        
        if (fontSize) {
          setCurrentFontSize(roundFontSize(fontSize));
        } else {
          setCurrentFontSize(roundFontSize(currentFontSize));
        }
      }
    }
  }, [editorRef, selectionInsideEditor]);

  useEffect(() => {
    document.addEventListener("selectionchange", refreshActive);
    return () => document.removeEventListener("selectionchange", refreshActive);
  }, [refreshActive]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Close dropdowns when clicking outside
      if (!target.closest('.font-size-dropdown-container') && 
          !target.closest('[data-font-dropdown]')) {
        setShowFontSizeDropdown(false);
      }
      if (!target.closest('.text-color-dropdown-container') && 
          !target.closest('[data-text-color-dropdown]')) {
        setShowTextColorDropdown(false);
      }
      if (!target.closest('.bg-color-dropdown-container') && 
          !target.closest('[data-bg-color-dropdown]')) {
        setShowBgColorDropdown(false);
      }
      
      // Reset toolbar state when clicking outside the editor
      if (editorRef.current && !target.closest('[contenteditable="true"]') && 
          !target.closest('.toolbar-container')) {
        setIsActive({
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          code: false,
          link: false,
          superscript: false,
          subscript: false,
          bulletList: false,
          numberedList: false,
          alignLeft: false,
          alignCenter: false,
          alignRight: false,
          justify: false,
        });
        setCurrentFontSize("12px");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editorRef]);

  const runAndRefresh = useCallback(() => {
    // give the browser a tick to apply formatting, then refresh
    requestAnimationFrame(() => {
      refreshActive();
    });
  }, [refreshActive]);

  // Undo/redo implementation using execCommand
  const handleUndo = useCallback(() => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    // Use execCommand for undo
    const success = document.execCommand('undo', false);
    if (success) {
      runAndRefresh();
    }
  }, [editorRef, runAndRefresh]);

  const handleRedo = useCallback(() => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    // Use execCommand for redo
    const success = document.execCommand('redo', false);
    if (success) {
      runAndRefresh();
    }
  }, [editorRef, runAndRefresh]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when the editor is focused
      if (!editorRef.current?.contains(document.activeElement)) return;
      
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          // Use execCommand for undo
          document.execCommand('undo', false);
          runAndRefresh();
        } else if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
          event.preventDefault();
          // Use execCommand for redo
          document.execCommand('redo', false);
          runAndRefresh();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editorRef, runAndRefresh]);

  const applyFormat = useCallback(
    (command: string) => {
      if (!editorRef.current) return;
      editorRef.current.focus();

      switch (command) {
        case "bold":
          document.execCommand("bold", false);
          break;
        case "italic":
          document.execCommand("italic", false);
          break;
        case "underline":
          document.execCommand("underline", false);
          break;
        case "strikethrough":
          document.execCommand("strikeThrough", false);
          break;
        case "code": {
          const sel = window.getSelection();
          if (!sel || !sel.rangeCount) break;
          const range = sel.getRangeAt(0);
          
          // Check if we're already in a code element
          const existingCode = range.commonAncestorContainer.nodeType === Node.TEXT_NODE ? 
            range.commonAncestorContainer.parentElement?.closest('code') :
            (range.commonAncestorContainer as Element).closest('code');
            
          if (existingCode) {
            // Remove code formatting
            const parent = existingCode.parentNode;
            if (parent) {
              while (existingCode.firstChild) {
                parent.insertBefore(existingCode.firstChild, existingCode);
              }
              parent.removeChild(existingCode);
            }
          } else {
            // Add code formatting
            const code = document.createElement("code");
            code.style.backgroundColor = "#f1f5f9";
            code.style.padding = "2px 4px";
            code.style.borderRadius = "3px";
            code.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
            
            try {
              const content = range.extractContents();
              code.appendChild(content);
              range.insertNode(code);
              // Reselect code so subsequent toggles work
              sel.removeAllRanges();
              const newRange = document.createRange();
              newRange.selectNodeContents(code);
              sel.addRange(newRange);
            } catch (error) {
              console.warn('Code formatting failed:', error);
            }
          }
          break;
        }
        case "link": {
          const url = window.prompt("Enter URL", "https://");
          if (url === null) break;
          if (url === "") {
            document.execCommand("unlink", false);
          } else {
            document.execCommand("createLink", false, url);
          }
          break;
        }
        case "superscript":
          document.execCommand("superscript", false);
          break;
        case "subscript":
          document.execCommand("subscript", false);
          break;
        case "alignLeft":
          document.execCommand("justifyLeft", false);
          break;
        case "alignCenter":
          document.execCommand("justifyCenter", false);
          break;
        case "alignRight":
          document.execCommand("justifyRight", false);
          break;
        case "justify":
          document.execCommand("justifyFull", false);
          break;
        case "bulletList":
          document.execCommand("insertUnorderedList", false);
          break;
        case "numberedList":
          document.execCommand("insertOrderedList", false);
          break;
       }
       runAndRefresh();
     },
     [editorRef, runAndRefresh]
   );

  const applyFontSize = useCallback(
    (size: string) => {
      if (!editorRef.current) return;
      editorRef.current.focus();

      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;

      const range = sel.getRangeAt(0);
      
      // If nothing is selected, select the current word/element
      if (range.collapsed) {
        const startContainer = range.startContainer;
        const element = startContainer.nodeType === Node.TEXT_NODE ? 
          startContainer.parentElement : startContainer as Element;
        
        if (element && element !== editorRef.current) {
          range.selectNodeContents(element);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }

      // Create a single span element with the font size
      if (!range.collapsed) {
        const span = document.createElement("span");
        span.style.fontSize = size;
        
        try {
          // Extract the contents and wrap them in the span
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
          
          // Select the newly created span for consistent behavior
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          sel.removeAllRanges();
          sel.addRange(newRange);
        } catch (error) {
          // Fallback to execCommand if manual manipulation fails
          console.warn('Font size application failed, using fallback:', error);
          document.execCommand("fontSize", false, size);
        }
      }

      setCurrentFontSize(size);
      setShowFontSizeDropdown(false);
      runAndRefresh();
    },
    [editorRef, runAndRefresh]
  );

  const applyColor = useCallback(
    (color: string, isTextColor: boolean = true) => {
      if (!editorRef.current) return;
      editorRef.current.focus();

      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;

      // Use execCommand for better undo/redo support
      if (isTextColor) {
        document.execCommand("foreColor", false, color);
      } else {
        document.execCommand("backColor", false, color);
      }

      if (isTextColor) {
        setShowTextColorDropdown(false);
      } else {
        setShowBgColorDropdown(false);
      }
      runAndRefresh();
    },
    [editorRef, runAndRefresh]
  );

  const handleExportPDF = useCallback(async () => {
    if (!editorRef.current || isExporting) return;
    
    setIsExporting(true);
    try {
      const filename = generateFilename('resume', 'pdf');
      
      // Try vector PDF first (server-side, smaller, crisp)
      try {
        const html = editorRef.current.outerHTML;
        await exportVectorPDF(html, filename, true);
      } catch (vectorError) {
        console.warn('Vector PDF failed, falling back to client-side:', vectorError);
        // Fallback to client-side export
        await exportToPDF(editorRef.current, { 
          filename,
          quality: 0.7, // Optimized for smaller file size
          allowUserToChooseLocation: true
        });
      }
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [editorRef, isExporting]);


  const baseButtonClass =
    "h-9 w-9 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200";
  const activeButtonClass =
    "h-9 w-9 flex items-center justify-center rounded-lg text-blue-600 bg-blue-50 font-semibold border border-blue-200";
  const exportButtonClass =
    "h-9 w-9 flex items-center justify-center rounded-lg text-green-600 hover:text-green-900 hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const Divider = () => <div className="w-px h-7 bg-gray-200 mx-2" />;

  return (
    <div className="toolbar-container bg-white border border-gray-200 rounded-xl w-full max-w-4xl mx-auto">
      {/* Mobile Layout - Stacked */}
      <div className="flex flex-col sm:hidden gap-2 p-3">
        {/* Row 1: Undo/Redo, Font Size, Colors */}
        <div className="flex items-center justify-center gap-2">
          <button
            className={baseButtonClass}
            onClick={handleUndo}
            aria-label="Undo (Ctrl+Z)"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            className={baseButtonClass}
            onClick={handleRedo}
            aria-label="Redo (Ctrl+Y)"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <Divider />

          {/* Font Size Dropdown */}
          <div className="relative font-size-dropdown-container">
            <button
              ref={fontSizeButtonRef}
              className={`${baseButtonClass} px-2`}
              onClick={() => {
                if (fontSizeButtonRef.current) {
                  const rect = fontSizeButtonRef.current.getBoundingClientRect();
                  setDropdownPosition({
                    top: rect.bottom + window.scrollY + 8,
                    left: rect.left + window.scrollX
                  });
                }
                setShowFontSizeDropdown((v) => !v);
              }}
              aria-label="Font size"
              title="Font size"
            >
              <span className="text-xs">{currentFontSize}</span>
              <ChevronDown className="w-3 h-3 ml-1" />
            </button>
            {showFontSizeDropdown && dropdownPosition && createPortal(
              <div 
                data-font-dropdown
                className="fixed bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] min-w-[120px]"
                style={{
                  top: dropdownPosition.top,
                  left: dropdownPosition.left
                }}
              >
                <div className="py-2 text-gray-700">
                  {["10px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"].map((size) => (
                    <button
                      key={size}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between transition-colors duration-150 rounded-lg mx-1"
                      onClick={() => applyFontSize(size)}
                    >
                      <span className="font-medium">{size}</span>
                      <span className="text-xs text-gray-400" style={{ fontSize: size }}>
                        Aa
                      </span>
                    </button>
                  ))}
                </div>
              </div>,
              document.body
            )}
          </div>

          <button
            ref={textColorButtonRef}
            className={`${baseButtonClass} px-2`}
            onClick={() => {
              if (textColorButtonRef.current) {
                const rect = textColorButtonRef.current.getBoundingClientRect();
                setDropdownPosition({
                  top: rect.bottom + window.scrollY + 8,
                  left: rect.left + window.scrollX
                });
              }
              setShowTextColorDropdown((v) => !v);
            }}
            aria-label="Text color"
            title="Text color"
          >
            <Palette className="w-4 h-4" />
          </button>

          <button
            ref={bgColorButtonRef}
            className={`${baseButtonClass} px-2`}
            onClick={() => {
              if (bgColorButtonRef.current) {
                const rect = bgColorButtonRef.current.getBoundingClientRect();
                setDropdownPosition({
                  top: rect.bottom + window.scrollY + 8,
                  left: rect.left + window.scrollX
                });
              }
              setShowBgColorDropdown((v) => !v);
            }}
            aria-label="Background color"
            title="Background color"
          >
            <Highlighter className="w-4 h-4" />
          </button>
        </div>

        {/* Row 2: Lists and Formatting */}
        <div className="flex items-center justify-center gap-2">
          <button
            className={isActive.bulletList ? activeButtonClass : baseButtonClass}
            onClick={() => applyFormat("bulletList")}
            aria-label="Bullet list"
            title="Bullet list"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            className={isActive.numberedList ? activeButtonClass : baseButtonClass}
            onClick={() => applyFormat("numberedList")}
            aria-label="Numbered list"
            title="Numbered list"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <Divider />

          <button
            className={isActive.bold ? activeButtonClass : baseButtonClass}
            onClick={() => applyFormat("bold")}
            aria-label="Bold"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            className={isActive.italic ? activeButtonClass : baseButtonClass}
            onClick={() => applyFormat("italic")}
            aria-label="Italic"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            className={isActive.underline ? activeButtonClass : baseButtonClass}
            onClick={() => applyFormat("underline")}
            aria-label="Underline"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>

        {/* Row 3: Code, Link, Alignment, Export */}
        <div className="flex items-center justify-center gap-2">
          <button
            className={isActive.code ? activeButtonClass : baseButtonClass}
            onClick={() => applyFormat("code")}
            aria-label="Code"
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>

          <button
            className={isActive.link ? activeButtonClass : baseButtonClass}
            onClick={() => applyFormat("link")}
            aria-label="Link"
            title="Link"
          >
            <Link className="w-4 h-4" />
          </button>

          <Divider />

          <button
            className={isActive.alignLeft ? activeButtonClass : baseButtonClass}
            onClick={() => applyFormat("alignLeft")}
            aria-label="Align left"
            title="Align left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>

          <button
            className={isActive.alignCenter ? activeButtonClass : baseButtonClass}
            onClick={() => applyFormat("alignCenter")}
            aria-label="Align center"
            title="Align center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>

          <Divider />

          <button
            className={exportButtonClass}
            onClick={handleExportPDF}
            disabled={isExporting}
            aria-label="Export as PDF"
            title="Export as PDF"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Desktop Layout - Single Row */}
      <div className="hidden sm:flex items-center justify-center gap-2 p-3">
      {/* Undo / Redo */}
      <button
        className={baseButtonClass}
        onClick={handleUndo}
        aria-label="Undo (Ctrl+Z)"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-5 h-5" />
      </button>

      <button
        className={baseButtonClass}
        onClick={handleRedo}
        aria-label="Redo (Ctrl+Y)"
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="w-4 h-4" />
      </button>

      <Divider />

      {/* Font Size Dropdown */}
      <div className="relative font-size-dropdown-container">
        <button
          ref={fontSizeButtonRef}
          className={`${baseButtonClass} px-2`}
          onClick={() => {
            if (fontSizeButtonRef.current) {
              const rect = fontSizeButtonRef.current.getBoundingClientRect();
              setDropdownPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX
              });
            }
            setShowFontSizeDropdown((v) => !v);
          }}
          aria-label="Font size"
          title="Font size"
        >
          {currentFontSize}
          <ChevronDown className="w-3 h-3 ml-1" />
        </button>
        {showFontSizeDropdown && dropdownPosition && createPortal(
          <div 
            data-font-dropdown
            className="fixed bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] min-w-[120px]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left
            }}
          >
            <div className="py-2 text-gray-700">
              {["10px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"].map((size) => (
                <button
                  key={size}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between transition-colors duration-150 rounded-lg mx-1"
                  onClick={() => applyFontSize(size)}
                >
                  <span className="font-medium">{size}</span>
                  <span className="text-xs text-gray-400" style={{ fontSize: size }}>
                    Aa
                  </span>
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
      </div>

      {/* Text Color Dropdown */}
      <div className="relative text-color-dropdown-container">
        <button
          ref={textColorButtonRef}
          className={`${baseButtonClass} px-2`}
          onClick={() => {
            if (textColorButtonRef.current) {
              const rect = textColorButtonRef.current.getBoundingClientRect();
              setDropdownPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX
              });
            }
            setShowTextColorDropdown((v) => !v);
          }}
          aria-label="Text color"
          title="Text color"
        >
            <Palette className="w-4 h-4" />
          <ChevronDown className="w-3 h-3 ml-1" />
        </button>
        {showTextColorDropdown && dropdownPosition && createPortal(
          <div 
            data-text-color-dropdown
            className="fixed bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] min-w-[200px]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left
            }}
          >
            <div className="p-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Text Color</div>
              <div className="grid grid-cols-8 gap-1">
                {[
                  '#000000', '#333333', '#666666', '#999999',
                  '#CCCCCC', '#FFFFFF', '#FF0000', '#00FF00',
                  '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
                  '#FFA500', '#800080', '#008000', '#000080'
                ].map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => applyColor(color, true)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>

      {/* Background Color Dropdown */}
      <div className="relative bg-color-dropdown-container">
        <button
          ref={bgColorButtonRef}
          className={`${baseButtonClass} px-2`}
          onClick={() => {
            if (bgColorButtonRef.current) {
              const rect = bgColorButtonRef.current.getBoundingClientRect();
              setDropdownPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX
              });
            }
            setShowBgColorDropdown((v) => !v);
          }}
          aria-label="Background color"
          title="Background color"
        >
            <Highlighter className="w-4 h-4" />
          <ChevronDown className="w-3 h-3 ml-1" />
        </button>
        {showBgColorDropdown && dropdownPosition && createPortal(
          <div 
            data-bg-color-dropdown
            className="fixed bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] min-w-[200px]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left
            }}
          >
            <div className="p-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Background Color</div>
              <div className="grid grid-cols-8 gap-1">
                {[
                  '#FFFFFF', '#F0F0F0', '#E0E0E0', '#D0D0D0',
                  '#FFE6E6', '#E6F3FF', '#E6FFE6', '#FFF0E6',
                  '#F0E6FF', '#E6FFFF', '#FFFFE6', '#FFE6F0',
                  '#F5F5DC', '#E6E6FA', '#F0FFF0', '#FFF8DC'
                ].map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => applyColor(color, false)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>

      <Divider />

      {/* Lists */}
      <button
        className={isActive.bulletList ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("bulletList")}
        aria-label="Bullet list"
        title="Bullet list"
      >
        <List className="w-4 h-4" />
      </button>

      <button
        className={isActive.numberedList ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("numberedList")}
        aria-label="Numbered list"
        title="Numbered list"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <Divider />

      {/* Inline formatting */}
      <button
        className={isActive.bold ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("bold")}
        aria-label="Bold"
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        className={isActive.italic ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("italic")}
        aria-label="Italic"
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>

      <button
        className={isActive.strikethrough ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("strikethrough")}
        aria-label="Strikethrough"
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <button
        className={isActive.underline ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("underline")}
        aria-label="Underline"
        title="Underline"
      >
        <Underline className="w-4 h-4" />
      </button>

      <Divider />

      {/* Code & Link */}
      <button
        className={isActive.code ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("code")}
        aria-label="Code"
        title="Code"
      >
        <Code className="w-4 h-4" />
      </button>

      <button
        className={isActive.link ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("link")}
        aria-label="Link"
        title="Link"
      >
        <Link className="w-4 h-4" />
      </button>

      <Divider />

      {/* Alignment */}
      <button
        className={isActive.alignLeft ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("alignLeft")}
        aria-label="Align left"
        title="Align left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>

      <button
        className={isActive.alignCenter ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("alignCenter")}
        aria-label="Align center"
        title="Align center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>

      <button
        className={isActive.alignRight ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("alignRight")}
        aria-label="Align right"
        title="Align right"
      >
        <AlignRight className="w-4 h-4" />
      </button>

      <button
        className={isActive.justify ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("justify")}
        aria-label="Justify"
        title="Justify"
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      <Divider />

      {/* Export Buttons */}
      <button
        className={exportButtonClass}
        onClick={handleExportPDF}
        disabled={isExporting}
        aria-label="Export as PDF"
        title="Export as PDF"
      >
        {isExporting ? (
          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Download className="w-4 h-4" />
        )}
      </button>
      </div>

      {/* Color Dropdowns for Mobile */}
      {showTextColorDropdown && dropdownPosition && createPortal(
        <div 
          data-text-color-dropdown
          className="fixed bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] min-w-[200px]"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left
          }}
        >
          <div className="p-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Text Color</div>
            <div className="grid grid-cols-8 gap-1">
              {[
                '#000000', '#333333', '#666666', '#999999',
                '#CCCCCC', '#FFFFFF', '#FF0000', '#00FF00',
                '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
                '#FFA500', '#800080', '#008000', '#000080'
              ].map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => applyColor(color, true)}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {showBgColorDropdown && dropdownPosition && createPortal(
        <div 
          data-bg-color-dropdown
          className="fixed bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] min-w-[200px]"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left
          }}
        >
          <div className="p-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Background Color</div>
            <div className="grid grid-cols-8 gap-1">
              {[
                '#FFFFFF', '#F0F0F0', '#E0E0E0', '#D0D0D0',
                '#FFE6E6', '#E6F3FF', '#E6FFE6', '#FFF0E6',
                '#F0E6FF', '#E6FFFF', '#FFFFE6', '#FFE6F0',
                '#F5F5DC', '#E6E6FA', '#F0FFF0', '#FFF8DC'
              ].map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => applyColor(color, false)}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
