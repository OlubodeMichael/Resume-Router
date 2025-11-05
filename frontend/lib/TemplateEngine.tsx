// @/lib/TemplateEngine.tsx

"use client"
import Handlebars from 'handlebars';
import DOMPurify from 'isomorphic-dompurify';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import root from 'react-shadow';
import { createPasteHandler } from './pasteUtils';

// Template spec interface
interface TemplateSpec {
  html: string;
  css: string;
  page?: { margin?: string; size?: string };
  fonts?: string[];
  baseUrl?: string;
}

interface TemplateData {
  [key: string]: string | number | boolean | TemplateData | TemplateData[];
}

interface TemplateRendererProps {
  spec: TemplateSpec;
  data: TemplateData;
}

interface EditableTemplateRendererProps {
  spec: TemplateSpec;
  data: TemplateData;
  className?: string;
  initialContent?: string | null;
  onContentChange?: (html: string) => void;
}

// Cache for compiled templates
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

function compileTemplate(html: string) {
  if (!templateCache.has(html)) {
    templateCache.set(html, Handlebars.compile(html));
  }
  return templateCache.get(html)!;
}

// Non-editable renderer (original, with Shadow DOM for previews)
export const HTMLTemplateRenderer: React.FC<TemplateRendererProps> = ({ spec, data }) => {
  const shadowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shadowRef.current) return;

    try {
      // Compile and render Handlebars template
      const template = compileTemplate(spec.html);
      const renderedHtml = template(data);

      // Sanitize HTML
      const cleanHtml = DOMPurify.sanitize(renderedHtml, {
        ADD_TAGS: ['style'], // Allow <style> tags for inline styles
        ADD_ATTR: ['target'], // Allow target attribute for links
      });

      // Get or create Shadow DOM
      let shadow = shadowRef.current.shadowRoot;
      if (!shadow) {
        shadow = shadowRef.current.attachShadow({ mode: 'open' });
      } else {
        // Clear existing content
        shadow.innerHTML = '';
      }

      // Inject CSS and fonts
      const style = document.createElement('style');
      style.textContent = `
        ${spec.fonts
          ?.map((font) => `@font-face { font-family: "Computer Modern Serif"; src: url(${spec.baseUrl}${font}) format('woff2'); }`)
          .join('\n')}
        ${spec.css}
      `;
      shadow.appendChild(style);

      // Inject sanitized HTML
      const content = document.createElement('div');
      content.innerHTML = cleanHtml;
      shadow.appendChild(content);
    } catch (error) {
      console.error('Template rendering failed:', error);
      const errorDiv = document.createElement('div');
      errorDiv.textContent = 'Error rendering resume';
      shadowRef.current?.attachShadow({ mode: 'open' }).appendChild(errorDiv);
    }
  }, [spec, data]);

  return <root.div ref={shadowRef} />;
};

// Editable renderer (new, for contentEditable editing)
export const EditableTemplateRenderer = forwardRef<HTMLDivElement, EditableTemplateRendererProps>(
  ({ spec, data, className, initialContent, onContentChange }, ref) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const isEditingRef = useRef(false);
    const lastContentRef = useRef<string>('');

    useImperativeHandle(ref, () => {
      const element = contentRef.current;
      if (!element) {
        // Return a minimal div element interface if ref is not available
        return document.createElement('div') as HTMLDivElement;
      }
      
      // Return the actual element with additional methods
      return Object.assign(element, {
        getHTML: () => element.innerHTML || '',
      setHTML: (html: string) => {
          element.innerHTML = html;
      },
      }) as HTMLDivElement;
    });

    useEffect(() => {
      if (!contentRef.current) return;

      try {
        // Compile and render Handlebars template
        const template = compileTemplate(spec.html);
        const renderedHtml = template(data);

        // Sanitize HTML (broader for editing)
        const cleanHtml = DOMPurify.sanitize(renderedHtml, {
          ADD_TAGS: ['style', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'br', 'section'],
          ADD_ATTR: ['target', 'href', 'class', 'style', 'id'],
          ALLOW_DATA_ATTR: true,
        });

        // Helper function to save cursor position as offset from start of content
        const saveCursorPosition = (): number | null => {
          if (!contentRef.current) return null;
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return null;
          
          const range = selection.getRangeAt(0);
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(contentRef.current);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          
          return preCaretRange.toString().length;
        };

        // Helper function to restore cursor position by offset
        const restoreCursorPosition = (offset: number) => {
          if (!contentRef.current) return;
          
          try {
            const range = document.createRange();
            const selection = window.getSelection();
            if (!selection) return;

            // Use Range API to find position by character offset
            let charCount = 0;
            const walker = document.createTreeWalker(
              contentRef.current,
              NodeFilter.SHOW_TEXT,
              null
            );

            let node: Node | null = walker.nextNode();
            let targetNode: Node | null = null;
            let targetOffset = 0;

            while (node) {
              const textLength = node.textContent?.length || 0;
              
              if (charCount + textLength >= offset) {
                targetNode = node;
                targetOffset = offset - charCount;
                break;
              }
              
              charCount += textLength;
              node = walker.nextNode();
            }

            if (targetNode && targetNode.nodeType === Node.TEXT_NODE) {
              const textNode = targetNode as Text;
              const safeOffset = Math.min(Math.max(0, targetOffset), textNode.textContent?.length || 0);
              
              range.setStart(textNode, safeOffset);
              range.setEnd(textNode, safeOffset);
              
              selection.removeAllRanges();
              selection.addRange(range);
              
              // Ensure the element is focused
              if (document.activeElement !== contentRef.current) {
                contentRef.current.focus();
              }
            }
          } catch (error) {
            console.warn('Failed to restore cursor position:', error);
          }
        };

        // Don't update content if user is actively editing
        const isCurrentlyEditing = isEditingRef.current || document.activeElement === contentRef.current;
        
        // Save cursor position before any DOM manipulation
        const savedOffset = isCurrentlyEditing ? saveCursorPosition() : null;
        
        // Only update content if it's different from what's already there
        const currentHtml = contentRef.current.innerHTML;
        const nameValue = typeof data.name === 'string' ? data.name : 
                         typeof data.fullName === 'string' ? data.fullName : 'default';
        const contentToSet = initialContent && !currentHtml.includes(nameValue)
          ? DOMPurify.sanitize(initialContent, { ADD_TAGS: ['style', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'br', 'section'], ADD_ATTR: ['target', 'href', 'class', 'style', 'id'] })
          : cleanHtml;

        // Only update innerHTML if content actually changed
        // Skip update if user is actively editing to preserve cursor position
        if (contentToSet !== currentHtml) {
          // If user is editing and content hasn't changed, skip the update
          if (!isCurrentlyEditing || currentHtml !== lastContentRef.current) {
            contentRef.current.innerHTML = contentToSet;
            lastContentRef.current = contentToSet;
            
            // Restore cursor position if it was saved
            if (savedOffset !== null && isCurrentlyEditing) {
              requestAnimationFrame(() => {
                restoreCursorPosition(savedOffset);
              });
            }
          }
        } else {
          // Content is the same, update lastContentRef
          lastContentRef.current = currentHtml;
        }

        // Inject scoped CSS (no Shadow DOM for editability)
        let style = contentRef.current.parentElement?.querySelector('.template-style');
        if (!style) {
          style = document.createElement('style');
          style.className = 'template-style';
          contentRef.current.parentElement?.appendChild(style);
        }
        style.textContent = `
          /* Font face definitions - global but safe */
          ${spec.fonts
            ?.map((font) => `@font-face { font-family: "Computer Modern Serif"; src: url(${spec.baseUrl}${font}) format('woff2'); }`)
            .join('\n')}
          
          /* Resume container styles - highly specific to avoid conflicts */
          .editable-resume-container {
            all: initial !important;
            display: block !important;
            font-family: "Computer Modern Serif", serif !important;
            font-size: 11pt !important;
            font-weight: 500 !important;
            line-height: 1.4 !important;
            color: black !important;
            width: 100% !important;
            max-width: 8.5in !important;
            margin: 0 auto !important;
            padding: 0.5in !important;
            box-sizing: border-box !important;
            background: white !important;
            position: relative !important;
            z-index: 1 !important;
            isolation: isolate !important;
          }
          
          /* Scoped template CSS - prefix all selectors with container class */
          .editable-resume-container h1,
          .editable-resume-container h2,
          .editable-resume-container h3,
          .editable-resume-container h4,
          .editable-resume-container p,
          .editable-resume-container a,
          .editable-resume-container li,
          .editable-resume-container ul,
          .editable-resume-container ol {
            color: black !important;
            font-family: "Computer Modern Serif", serif !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .editable-resume-container h1 {
            text-align: center !important;
            font-size: 22pt !important;
            font-weight: bold !important;
            margin: 0 0 8pt 0 !important;
          }
          
          .editable-resume-container h2 {
            text-transform: uppercase !important;
            font-size: 12pt !important;
            font-weight: bold !important;
            margin: 10pt 0 4pt 0 !important;
            padding: 0 !important;
            border-bottom: 1px solid #000 !important;
          }
          
          .editable-resume-container h3,
          .editable-resume-container h4 {
            display: flex !important;
            justify-content: space-between !important;
            margin: 4pt 0 1pt 0 !important;
            font-size: 11pt !important;
            font-weight: bold !important;
          }
          
          .editable-resume-container h4 {
            font-style: italic !important;
            font-weight: normal !important;
            margin-top: 1pt !important;
          }
          
          .editable-resume-container ul {
            margin: 2pt 0 !important;
            padding-left: 0.3in !important;
            font-size: 11pt !important;
            list-style-type: disc !important;
          }
          
          .editable-resume-container ul > li {
            margin-bottom: 1pt !important;
            line-height: 1.2 !important;
            list-style-type: disc !important;
          }
          
          .editable-resume-container .headerInfo > ul {
            display: flex !important;
            justify-content: center !important;
            margin: 0 !important;
            padding: 0 !important;
            list-style: none !important;
            flex-wrap: wrap !important;
          }
          
          .editable-resume-container .headerInfo > ul > li {
            white-space: nowrap !important;
            font-size: 11pt !important;
            list-style: none !important;
          }
          
          .editable-resume-container .headerInfo > ul > li:not(:last-child) {
            margin-right: 8px !important;
          }
          
          .editable-resume-container .headerInfo > ul > li:not(:last-child)::after {
            content: "|" !important;
            margin-left: 8px !important;
          }
          
          .editable-resume-container * { 
            box-sizing: border-box !important; 
          }
          
          .editable-resume-container [contenteditable="true"] { 
            outline: none !important; 
            caret-color: black !important;
            cursor: text !important;
          }
          
      .editable-resume-container [contenteditable="true"]:focus {
        caret-color: black !important;
        cursor: text !important;
      }
    `;

        // Handle paste events to strip formatting
        const handlePaste = createPasteHandler({
          stripFormatting: true,
          preserveLineBreaks: true
        });

        // Handle content changes
        const handleInput = () => {
          if (onContentChange && contentRef.current) {
            isEditingRef.current = true;
            lastContentRef.current = contentRef.current.innerHTML;
            onContentChange(contentRef.current.innerHTML);
            // Reset editing flag after a short delay
            setTimeout(() => {
              isEditingRef.current = false;
            }, 100);
          }
        };

        const currentElement = contentRef.current;
        currentElement.addEventListener('input', handleInput, true); // Capture for better control
        currentElement.addEventListener('blur', handleInput);
        currentElement.addEventListener('paste', handlePaste);

        return () => {
          currentElement?.removeEventListener('input', handleInput, true);
          currentElement?.removeEventListener('blur', handleInput);
          currentElement?.removeEventListener('paste', handlePaste);
          const parentStyle = currentElement?.parentElement?.querySelector('.template-style');
          if (parentStyle) parentStyle.remove();
        };
      } catch (error) {
        console.error('Editable template rendering failed:', error);
        contentRef.current.innerHTML = '<div contenteditable="true">Error rendering resume. <br>Edit here.</div>';
      }
    }, [spec, data, initialContent, onContentChange]);

    return (
      <div className={className}>
        <div
          ref={contentRef}
          className="editable-resume-container"
          contentEditable
          suppressContentEditableWarning={true}
          spellCheck={false}
        />
      </div>
    );
  }
);

EditableTemplateRenderer.displayName = 'EditableTemplateRenderer';

export function buildStandaloneHTML(
  spec: TemplateSpec, 
  data: TemplateData, 
  editedHtml?: string, // Optional: Use edited content instead of template
  debug: boolean = false // Toggle debug logs
): string {
  try {
    if (debug) {
      console.log('Building standalone HTML with data:', data);
    }
    
    let cleanHtml: string;
    if (editedHtml) {
      // Use edited content directly (sanitized)
      cleanHtml = DOMPurify.sanitize(editedHtml, {
        ADD_TAGS: ['style', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'br', 'section'],
        ADD_ATTR: ['target', 'href', 'class', 'style', 'id'],
      });
    } else {
      // Fallback to template rendering
      const template = compileTemplate(spec.html);
      const renderedHtml = template(data);
      cleanHtml = DOMPurify.sanitize(renderedHtml, {
        ADD_TAGS: ['style'],
        ADD_ATTR: ['target'],
      });
    }
    
    if (debug) {
      console.log('Rendered/Edited HTML length:', cleanHtml.length);
    }

    // Bundle HTML with CSS and fonts
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Resume</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <base href="${spec.baseUrl || ''}">
          <style>
            ${spec.fonts
              ?.map((font) => `@font-face { font-family: "Computer Modern Serif"; src: url(${font}) format('woff2'); }`)
              .join('\n')}
            ${spec.css}
            
            /* Additional print styles */
            @media print {
              @page {
                margin: ${spec.page?.margin || '0.25in'} !important;
                size: ${spec.page?.size || 'letter'} !important;
              }
              
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              
              body {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                color: black !important;
              }
              
              h1, h2, h3, h4, p, a, li, span {
                color: black !important;
                background: transparent !important;
              }
              
              /* Hide any browser-generated content */
              ::before,
              ::after {
                display: none !important;
              }
              
              /* Ensure clean print layout */
              .print-container {
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container" style="width: 100%; max-width: 8.5in; margin: 0 auto; padding: ${spec.page?.margin || '0.5in'};">
            ${cleanHtml}
          </div>
        </body>
      </html>
    `;
  } catch (error) {
    console.error('Failed to build standalone HTML:', error);
    return '<div>Error rendering resume</div>';
  }
}

export function openPrintPreview(
  spec: TemplateSpec, 
  data: TemplateData, 
  editedHtml?: string // Optional: Use edited content
) {
  try {
    const html = buildStandaloneHTML(spec, data, editedHtml);
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Wait for content to load before printing
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 500); // Small delay to ensure content is fully rendered
      };
      
      // Fallback if onload doesn't fire
      setTimeout(() => {
        if (printWindow.document.readyState === 'complete') {
          printWindow.focus();
          printWindow.print();
        }
      }, 1000);
      
    } else {
      console.error('Failed to open print preview - popup blocked?');
      alert('Print preview failed. Please check if popups are blocked for this site.');
    }
  } catch (error) {
    console.error('Print preview failed:', error);
    alert('Print preview failed. Please try again.');
  }
}