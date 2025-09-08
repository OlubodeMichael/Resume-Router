"use client";

import { useState, useEffect, useCallback } from "react";

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

export default function Toolbar({ editorRef }: ToolbarProps) {
  const [currentFontSize, setCurrentFontSize] = useState<string>("12px");
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState<boolean>(false);
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
      return;
    }

    const range = sel.getRangeAt(0);
    
    // Only show active states if there's actual text selected (not just cursor placement)
    if (range.collapsed) {
      // Clear active states when cursor is just placed (no text selected)
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
      return;
    }

    const baseEl = closestElement(range.commonAncestorContainer);
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
      const size = window.getComputedStyle(baseEl).fontSize;
      if (size) setCurrentFontSize(size);
    }
  }, [editorRef, selectionInsideEditor]);

  useEffect(() => {
    document.addEventListener("selectionchange", refreshActive);
    return () => document.removeEventListener("selectionchange", refreshActive);
  }, [refreshActive]);

  useEffect(() => {
    const handleClickOutside = () => setShowFontSizeDropdown(false);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const runAndRefresh = useCallback(() => {
    // give the browser a tick to apply formatting, then refresh
    requestAnimationFrame(() => {
      refreshActive();
    });
  }, [refreshActive]);

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
          const code = document.createElement("code");
          code.style.backgroundColor = "#f1f5f9";
          code.style.padding = "2px 4px";
          code.style.borderRadius = "3px";
          code.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
          const content = range.extractContents();
          code.appendChild(content);
          range.insertNode(code);
          // Reselect code so subsequent toggles work
          sel.removeAllRanges();
          const newRange = document.createRange();
          newRange.selectNodeContents(code);
          sel.addRange(newRange);
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

      const span = document.createElement("span");
      span.style.fontSize = size;
      const content = range.extractContents();
      span.appendChild(content);
      range.insertNode(span);

      // Reselect the new span so typing continues at the right place
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);

       setCurrentFontSize(size);
       setShowFontSizeDropdown(false);
       runAndRefresh();
     },
     [editorRef, runAndRefresh]
   );

  const baseButtonClass =
    "h-9 w-9 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200";
  const activeButtonClass =
    "h-9 w-9 flex items-center justify-center rounded-lg text-blue-600 bg-blue-50 font-semibold border border-blue-200";
  const Divider = () => <div className="w-px h-7 bg-gray-200 mx-2" />;

  return (
    <div className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-xl w-auto">
      {/* Undo / Redo */}
      <button
        className={baseButtonClass}
        onClick={() => {
          editorRef.current?.focus();
          document.execCommand("undo");
          runAndRefresh();
        }}
        aria-label="Undo"
        title="Undo"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </button>

      <button
        className={baseButtonClass}
        onClick={() => {
          editorRef.current?.focus();
          document.execCommand("redo");
          runAndRefresh();
        }}
        aria-label="Redo"
        title="Redo"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
        </svg>
      </button>

      <Divider />

      {/* Font Size Dropdown */}
      <div className="relative">
        <button
          className={`${baseButtonClass} px-2`}
          onClick={() => setShowFontSizeDropdown((v) => !v)}
          aria-label="Font size"
          title="Font size"
        >
          {currentFontSize}
          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showFontSizeDropdown && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-sm z-20">
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
          </div>
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
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="4" cy="6" r="1.5" />
          <circle cx="4" cy="12" r="1.5" />
          <circle cx="4" cy="18" r="1.5" />
          <rect x="7" y="5" width="14" height="2" />
          <rect x="7" y="11" width="14" height="2" />
          <rect x="7" y="17" width="14" height="2" />
        </svg>
      </button>

      <button
        className={isActive.numberedList ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("numberedList")}
        aria-label="Numbered list"
        title="Numbered list"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="4" width="2" height="2" />
          <rect x="2" y="10" width="2" height="2" />
          <rect x="2" y="16" width="2" height="2" />
          <rect x="7" y="5" width="14" height="2" />
          <rect x="7" y="11" width="14" height="2" />
          <rect x="7" y="17" width="14" height="2" />
        </svg>
      </button>

      <Divider />

      {/* Inline formatting */}
      <button
        className={isActive.bold ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("bold")}
        aria-label="Bold"
        title="Bold"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
        </svg>
      </button>

      <button
        className={isActive.italic ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("italic")}
        aria-label="Italic"
        title="Italic"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" />
        </svg>
      </button>

      <button
        className={isActive.strikethrough ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("strikethrough")}
        aria-label="Strikethrough"
        title="Strikethrough"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" />
        </svg>
      </button>

      <button
        className={isActive.underline ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("underline")}
        aria-label="Underline"
        title="Underline"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
        </svg>
      </button>

      <Divider />

      {/* Code & Link */}
      <button
        className={isActive.code ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("code")}
        aria-label="Code"
        title="Code"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 4l-6 8 6 8h2l-5-8 5-8H8zm8 0l6 8-6 8h-2l5-8-5-8h2z" />
        </svg>
      </button>

      <button
        className={isActive.link ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("link")}
        aria-label="Link"
        title="Link"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>

      <Divider />

      {/* Alignment */}
      <button
        className={isActive.alignLeft ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("alignLeft")}
        aria-label="Align left"
        title="Align left"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="6" width="18" height="2" />
          <rect x="3" y="10" width="12" height="2" />
          <rect x="3" y="14" width="15" height="2" />
          <rect x="3" y="18" width="9" height="2" />
        </svg>
      </button>

      <button
        className={isActive.alignCenter ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("alignCenter")}
        aria-label="Align center"
        title="Align center"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="6" width="18" height="2" />
          <rect x="6" y="10" width="12" height="2" />
          <rect x="4.5" y="14" width="15" height="2" />
          <rect x="7.5" y="18" width="9" height="2" />
        </svg>
      </button>

      <button
        className={isActive.alignRight ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("alignRight")}
        aria-label="Align right"
        title="Align right"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="6" width="18" height="2" />
          <rect x="9" y="10" width="12" height="2" />
          <rect x="6" y="14" width="15" height="2" />
          <rect x="12" y="18" width="9" height="2" />
        </svg>
      </button>

      <button
        className={isActive.justify ? activeButtonClass : baseButtonClass}
        onClick={() => applyFormat("justify")}
        aria-label="Justify"
        title="Justify"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="6" width="18" height="2" />
          <rect x="3" y="10" width="18" height="2" />
          <rect x="3" y="14" width="18" height="2" />
          <rect x="3" y="18" width="18" height="2" />
        </svg>
      </button>
    </div>
  );
}
