// lib/pasteUtils.ts
import React from 'react';

/**
 * Utility functions for handling paste events and content formatting
 */

export interface PasteOptions {
  stripFormatting?: boolean;
  preserveLineBreaks?: boolean;
  maxLength?: number;
}

/**
 * Handles paste events by stripping formatting and inserting plain text
 * @param e - ClipboardEvent
 * @param options - Configuration options for paste behavior
 * @returns boolean - true if paste was handled, false otherwise
 */
export function handlePasteEvent(e: ClipboardEvent, options: PasteOptions = {}): boolean {
  const {
    stripFormatting = true,
    preserveLineBreaks = true,
    maxLength
  } = options;

  e.preventDefault();

  // Get plain text from clipboard
  const clipboardData = e.clipboardData || (window as unknown as { clipboardData: DataTransfer }).clipboardData;
  let pastedText = clipboardData.getData('text/plain');

  if (!pastedText) {
    return false;
  }

  // Apply length limit if specified
  if (maxLength && pastedText.length > maxLength) {
    pastedText = pastedText.substring(0, maxLength);
  }

  // Clean the text if formatting should be stripped
  if (stripFormatting) {
    pastedText = cleanPastedText(pastedText, { preserveLineBreaks });
  }

  // Insert the cleaned text at cursor position
  insertTextAtCursor(pastedText);

  return true;
}

/**
 * Cleans pasted text by removing unwanted formatting
 * @param text - The text to clean
 * @param options - Cleaning options
 * @returns Cleaned text
 */
export function cleanPastedText(text: string, options: { preserveLineBreaks?: boolean } = {}): string {
  const { preserveLineBreaks = true } = options;

  // Remove any HTML tags
  let cleaned = text.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Normalize whitespace
  if (preserveLineBreaks) {
    // Preserve line breaks but normalize other whitespace
    cleaned = cleaned.replace(/[ \t]+/g, ' ');
  } else {
    // Replace all whitespace with single spaces
    cleaned = cleaned.replace(/\s+/g, ' ');
  }

  // Trim leading/trailing whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Inserts text at the current cursor position
 * @param text - Text to insert
 */
export function insertTextAtCursor(text: string): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const range = selection.getRangeAt(0);
  range.deleteContents();

  // Create a text node with the content
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);

  // Move cursor to end of inserted text
  range.setStartAfter(textNode);
  range.setEndAfter(textNode);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * Creates a paste event handler for contentEditable elements (native DOM)
 * @param options - Configuration options
 * @returns Event handler function
 */
export function createPasteHandler(options: PasteOptions = {}) {
  return (e: ClipboardEvent) => {
    handlePasteEvent(e, options);
  };
}

/**
 * Creates a React paste event handler for textarea elements
 * @param options - Configuration options
 * @returns React event handler function
 */
export function createReactPasteHandler(options: PasteOptions = {}) {
  return (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    handlePasteEvent(e.nativeEvent, options);
  };
}

/**
 * Enhanced paste handler that preserves some formatting while cleaning others
 * @param e - ClipboardEvent
 * @param allowedTags - Array of HTML tags to preserve
 * @returns boolean - true if paste was handled
 */
export function handleSmartPaste(e: ClipboardEvent, allowedTags: string[] = ['strong', 'em', 'b', 'i']): boolean {
  e.preventDefault();

  const clipboardData = e.clipboardData || (window as unknown as { clipboardData: DataTransfer }).clipboardData;
  const htmlData = clipboardData.getData('text/html');
  const textData = clipboardData.getData('text/plain');

  if (!htmlData && !textData) {
    return false;
  }

  let content = '';

  if (htmlData) {
    // Parse HTML and preserve only allowed tags
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlData, 'text/html');
    
    // Remove unwanted tags while preserving allowed ones
    const walker = document.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_ELEMENT,
      null
    );

    const elementsToRemove: Element[] = [];
    let node: Node | null = walker.nextNode();

    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (!allowedTags.includes(element.tagName.toLowerCase())) {
          elementsToRemove.push(element);
        }
      }
      node = walker.nextNode();
    }

    // Remove unwanted elements
    elementsToRemove.forEach(el => {
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) {
          parent.insertBefore(el.firstChild, el);
        }
        parent.removeChild(el);
      }
    });

    content = doc.body.innerHTML;
  } else {
    content = textData;
  }

  // Insert the cleaned content
  insertTextAtCursor(content);
  return true;
}
