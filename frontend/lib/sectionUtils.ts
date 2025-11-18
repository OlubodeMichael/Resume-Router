/**
 * Utilities for extracting and injecting section content in the resume editor
 * Used for AI rewrite feature
 */

/**
 * Extract plain text content from a section element
 * Removes the section header (h2) and converts HTML to plain text while preserving structure
 * 
 * @param sectionElement - The section DOM element to extract content from
 * @returns Plain text content with structure preserved (bullet points, line breaks)
 */
export function extractSectionContent(sectionElement: HTMLElement): string {
  // Clone to avoid modifying original
  const clone = sectionElement.cloneNode(true) as HTMLElement;

  // Remove section header (h2) - we don't want to rewrite the title
  const header = clone.querySelector("h2");
  header?.remove();

  // Helper function to convert HTML to plain text while preserving structure
  const htmlToPlainText = (element: HTMLElement): string => {
    let text = "";

    // Process child nodes
    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        // Direct text node
        text += node.textContent || "";
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tagName = el.tagName.toLowerCase();

        // Handle different HTML elements
        if (tagName === "p") {
          const paraText = htmlToPlainText(el);
          if (paraText.trim()) {
            text += paraText.trim() + "\n\n";
          }
        } else if (tagName === "ul" || tagName === "ol") {
          // List - preserve bullet points
          const listItems = el.querySelectorAll("li");
          listItems.forEach((li) => {
            const itemText = htmlToPlainText(li as HTMLElement);
            if (itemText.trim()) {
              text += "• " + itemText.trim() + "\n";
            }
          });
        } else if (tagName === "li") {
          // List item - get text content
          const itemText = htmlToPlainText(el);
          text += itemText.trim();
        } else if (tagName === "div") {
          // Div - preserve line breaks
          const divText = htmlToPlainText(el);
          if (divText.trim()) {
            text += divText.trim() + "\n";
          }
        } else if (tagName === "br") {
          // Line break
          text += "\n";
        } else if (tagName === "h3" || tagName === "h4") {
          // Headings - preserve with line breaks
          const headingText = htmlToPlainText(el);
          if (headingText.trim()) {
            text += headingText.trim() + "\n";
          }
        } else {
          // Other elements - just get text content
          const elementText = htmlToPlainText(el);
          text += elementText;
        }
      }
    }

    return text;
  };

  const plainText = htmlToPlainText(clone);
  
  // Clean up extra whitespace but preserve intentional line breaks
  return plainText
    .replace(/\n{3,}/g, "\n\n") // Max 2 consecutive newlines
    .trim();
}

/**
 * Find a section element by its data-section-type attribute
 * 
 * @param editorElement - The editor container element
 * @param sectionType - The section type to find (e.g., "experience", "summary")
 * @returns The section element or null if not found
 */
export function findSectionByType(
  editorElement: HTMLElement | null,
  sectionType: string
): HTMLElement | null {
  if (!editorElement) return null;

  const section = editorElement.querySelector(
    `section[data-section-type="${sectionType}"]`
  ) as HTMLElement | null;

  return section;
}

/**
 * Convert plain text back to HTML, preserving structure
 * Handles bullet points, line breaks, and paragraphs
 * 
 * @param plainText - Plain text content to convert
 * @returns HTML string
 */
function plainTextToHtml(plainText: string): string {
  if (!plainText.trim()) return "";

  // Split by double newlines to get paragraphs
  const paragraphs = plainText.split(/\n\n+/).filter((p) => p.trim());

  const htmlParts: string[] = [];

  paragraphs.forEach((para) => {
    const trimmed = para.trim();
    if (!trimmed) return;

    // Check if this paragraph contains bullet points (lines starting with • or -)
    const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
    const hasBullets = lines.some(
      (line) => line.startsWith("•") || line.startsWith("-") || line.startsWith("*")
    );

    if (hasBullets) {
      // Create a list
      htmlParts.push("<ul>");
      lines.forEach((line) => {
        // Remove bullet marker
        const cleanLine = line.replace(/^[•\-\*]\s*/, "");
        if (cleanLine) {
          htmlParts.push(`<li contenteditable="true">${escapeHtml(cleanLine)}</li>`);
        }
      });
      htmlParts.push("</ul>");
    } else {
      // Regular paragraph
      // Check if it's a single line (might be a heading-like content)
      if (lines.length === 1) {
        htmlParts.push(`<p contenteditable="true">${escapeHtml(lines[0])}</p>`);
      } else {
        // Multiple lines - join with <br>
        const content = lines
          .map((line) => escapeHtml(line))
          .join("<br>");
        htmlParts.push(`<p contenteditable="true">${content}</p>`);
      }
    }
  });

  return htmlParts.join("");
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Add a temporary highlight to an element to indicate it was just regenerated
 * The highlight fades out after 3 seconds
 */
function addHighlight(element: HTMLElement): void {
  // Add highlight class
  element.classList.add("rewrite-highlight");
  
  // Remove highlight after animation completes (3 seconds)
  setTimeout(() => {
    element.classList.remove("rewrite-highlight");
  }, 7000);
}

/**
 * Inject rewritten content into a section element
 * Preserves the section header (h2) and intelligently merges rewritten content
 * For bullet points, it tries to find and replace matching bullets instead of replacing all
 * 
 * @param sectionElement - The section DOM element to update
 * @param rewrittenContent - Plain text rewritten content from AI
 * @param originalContent - Optional: The original content that was rewritten (for smart merging)
 */
export function injectSectionContent(
  sectionElement: HTMLElement,
  rewrittenContent: string,
  originalContent?: string
): void {
  // Find the header (h2) to preserve it
  const header = sectionElement.querySelector("h2");
  const headerHtml = header ? header.outerHTML : "";

  // Check if rewrittenContent is a JSON array (for bullets)
  let isJsonBullets = false;
  let rewrittenBulletTexts: string[] = [];
  
  try {
    const parsed = JSON.parse(rewrittenContent);
    if (Array.isArray(parsed) && parsed.every(item => typeof item === "string")) {
      isJsonBullets = true;
      rewrittenBulletTexts = parsed;
    }
  } catch {
    // Not JSON, continue with normal flow
  }

  // If we have JSON bullets, handle bullet replacement
  if (isJsonBullets && rewrittenBulletTexts.length > 0) {
    // Find all lists in the section
    const existingLists = sectionElement.querySelectorAll("ul, ol");
    
    if (existingLists.length > 0) {
      let swappedAny = false;
      
      // If we have original content, swap only the selected bullets
      if (originalContent) {
        // Parse original content to find which bullets were selected
        const originalLines = originalContent.split("\n")
          .map(line => line.trim())
          .filter(line => {
            // Extract bullet text (remove bullet markers)
            const cleaned = line.replace(/^[•\-\*]\s*/, "").replace(/^\d+[\.\)]\s*/, "").trim();
            return cleaned.length > 0;
          })
          .map(line => line.replace(/^[•\-\*]\s*/, "").replace(/^\d+[\.\)]\s*/, "").trim());
        
        // Try to find matching bullets in each list and replace them
        existingLists.forEach((list) => {
          const existingBullets = Array.from(list.querySelectorAll("li"));
          // Track which bullets we've already replaced to avoid duplicates
          const replacedIndices = new Set<number>();
          
          // For each original line, find and replace the exact matching bullet
          originalLines.forEach((originalLine, originalIndex) => {
            if (originalIndex >= rewrittenBulletTexts.length) return;
            
            const cleanOriginalLine = originalLine.trim().toLowerCase();
            const rewrittenText = rewrittenBulletTexts[originalIndex] || "";
            
            // Find the exact matching bullet by text content
            existingBullets.forEach((existingLi, bulletIndex) => {
              // Skip if this bullet was already replaced
              if (replacedIndices.has(bulletIndex)) return;
              
              const existingText = (existingLi as HTMLElement).textContent?.trim().toLowerCase() || "";
              
              // Exact match or very close match (one contains the other)
              if (existingText === cleanOriginalLine || 
                  existingText.includes(cleanOriginalLine) || 
                  cleanOriginalLine.includes(existingText)) {
                
                // Create new bullet with rewritten content
                const newLi = document.createElement("li");
                newLi.setAttribute("contenteditable", "true");
                newLi.textContent = rewrittenText.trim();
                
                // Replace the existing bullet with the rewritten one
                const parent = existingLi.parentNode;
                if (parent) {
                  parent.replaceChild(newLi, existingLi);
                  replacedIndices.add(bulletIndex);
                  swappedAny = true;
                  
                  // Add highlight to the new bullet
                  addHighlight(newLi);
                }
              }
            });
          });
        });
        
        // If we swapped any bullets, we're done
        if (swappedAny) {
          // Ensure contenteditable attributes are preserved
          sectionElement
            .querySelectorAll("li")
            .forEach((el) => {
              (el as HTMLElement).setAttribute("contenteditable", "true");
            });
          
          return; // Successfully swapped, exit early
        }
      }
      
      // Fallback: Only replace all bullets if NO original content (user selected "entire section")
      // This should only happen when user selected "Rewrite All Entries" or entire section
      if (!originalContent) {
        // Replace all bullets in all lists
        existingLists.forEach((list) => {
          list.innerHTML = "";
          
          // Add new bullets
          rewrittenBulletTexts.forEach((bulletText) => {
            const newLi = document.createElement("li");
            newLi.setAttribute("contenteditable", "true");
            newLi.textContent = bulletText.trim();
            list.appendChild(newLi);
            
            // Add highlight to all new bullets
            addHighlight(newLi);
          });
        });
        
        // Ensure contenteditable attributes are preserved
        sectionElement
          .querySelectorAll("li")
          .forEach((el) => {
            (el as HTMLElement).setAttribute("contenteditable", "true");
          });
        
        return; // Done replacing all bullets
      }
      
      // If we have originalContent but didn't swap anything, still return early
      // to prevent the fallback from replacing everything
      return;
    }
  }

  // Fallback: Replace entire content (preserves header)
  // Convert plain text to HTML
  const contentHtml = plainTextToHtml(rewrittenContent);

  // Replace section content while preserving header
  if (headerHtml) {
    sectionElement.innerHTML = headerHtml + contentHtml;
  } else {
    sectionElement.innerHTML = contentHtml;
  }

  // Ensure contenteditable attributes are preserved
  const allContentElements = sectionElement.querySelectorAll("p, div, li, h3, h4");
  allContentElements.forEach((el) => {
    (el as HTMLElement).setAttribute("contenteditable", "true");
    // Add highlight to all newly replaced content
    addHighlight(el as HTMLElement);
  });
}

/**
 * Trigger editor update event
 * This simulates a content change to notify the editor system
 * The editor listens for 'input' events to detect changes
 * 
 * @param editorElement - The editor container element
 */
export function triggerEditorUpdate(editorElement: HTMLElement | null): void {
  if (!editorElement) return;

  // Dispatch an input event which the editor listens for
  // This will trigger the onContentChange callback if registered
  const inputEvent = new Event("input", { bubbles: true, cancelable: true });
  editorElement.dispatchEvent(inputEvent);

  // Also dispatch a blur event to ensure the editor processes the change
  // This is useful if the editor only processes changes on blur
  const blurEvent = new Event("blur", { bubbles: true, cancelable: true });
  editorElement.dispatchEvent(blurEvent);
}

/**
 * Extract section content by section type
 * Convenience function that combines finding and extracting
 * 
 * @param editorElement - The editor container element
 * @param sectionType - The section type to extract
 * @returns Plain text content or null if section not found
 */
export function extractSectionContentByType(
  editorElement: HTMLElement | null,
  sectionType: string
): string | null {
  const section = findSectionByType(editorElement, sectionType);
  if (!section) return null;

  return extractSectionContent(section);
}

/**
 * Check if a section has subsections (e.g., multiple experience entries)
 * Sections with subsections: experience, education, projects, certifications, leadership, volunteer, awardsHonors, publications
 */
export function hasSubsections(sectionType: string): boolean {
  const sectionsWithSubsections = [
    "experience",
    "education",
    "projects",
    "certifications",
    "leadership",
    "volunteer",
    "awardsHonors",
    "publications",
  ];
  return sectionsWithSubsections.includes(sectionType);
}

/**
 * Extract subsections from a section (e.g., individual experience entries)
 * Returns an array of objects with id (index), label (title/company name), and the DOM element
 */
export function extractSubsections(sectionElement: HTMLElement): Array<{
  id: number;
  label: string;
  element: HTMLElement;
}> {
  const subsections: Array<{
    id: number;
    label: string;
    element: HTMLElement;
  }> = [];

  // Get the section type from the data attribute
  const sectionType = sectionElement.getAttribute("data-section-type") || "";

  // Find all h3 elements which typically mark the start of subsections
  const h3Elements = sectionElement.querySelectorAll("h3");
  
  h3Elements.forEach((h3, index) => {
    let label = `Item ${index + 1}`;
    
    // For experience sections, use the company name from h4 instead of the title from h3
    if (sectionType === "experience") {
      // Find the h4 element that follows this h3 (contains company name)
      let current: Element | null = h3.nextElementSibling;
      while (current && current.tagName !== "H3" && current.tagName !== "H2") {
        if (current.tagName === "H4") {
          const firstSpan = current.querySelector("span");
          label = firstSpan?.textContent?.trim() || current.textContent?.trim() || `Item ${index + 1}`;
          break;
        }
        current = current.nextElementSibling;
      }
    } else {
      // For other sections, use the h3 content (title/name)
      const firstSpan = h3.querySelector("span");
      label = firstSpan?.textContent?.trim() || h3.textContent?.trim() || `Item ${index + 1}`;
    }
    
    // Find the subsection content: from this h3 until the next h3 (or end of section)
    // For experience: h3 (title) -> h4 (company) -> ul (bullets)
    // For education: h3 (school) -> h4 (degree)
    // For projects: h3 (name) -> ul (bullets)
    const subsectionContent: HTMLElement[] = [h3 as HTMLElement];
    
    let current: Element | null = h3.nextElementSibling;
    while (current && current.tagName !== "H3" && current !== sectionElement.querySelector("h2")?.nextElementSibling) {
      // Check if we've hit another subsection (another h3)
      if (current.tagName === "H3") break;
      
      // Check if we've hit the section header
      if (current.tagName === "H2") break;
      
      subsectionContent.push(current as HTMLElement);
      current = current.nextElementSibling;
    }
    
    // Create a temporary container to hold this subsection
    const subsectionElement = document.createElement("div");
    subsectionContent.forEach(el => {
      subsectionElement.appendChild(el.cloneNode(true));
    });
    
    subsections.push({
      id: index,
      label,
      element: subsectionElement as HTMLElement,
    });
  });

  return subsections;
}

/**
 * Extract content from a specific subsection
 * @param sectionElement - The section DOM element
 * @param subsectionIndex - The index of the subsection to extract
 * @returns Plain text content of the subsection or null if not found
 */
export function extractSubsectionContent(
  sectionElement: HTMLElement,
  subsectionIndex: number
): string | null {
  const h3Elements = sectionElement.querySelectorAll("h3");
  const h3 = h3Elements[subsectionIndex];
  
  if (!h3) return null;
  
  // Collect all elements from this h3 until the next h3 or end
  const subsectionElements: HTMLElement[] = [h3 as HTMLElement];
  
  let current: Element | null = h3.nextElementSibling;
  while (current && current.tagName !== "H3" && current !== sectionElement.querySelector("h2")?.nextElementSibling) {
    if (current.tagName === "H3") break;
    if (current.tagName === "H2") break;
    
    subsectionElements.push(current as HTMLElement);
    current = current.nextElementSibling;
  }
  
  // Create a temporary container
  const tempContainer = document.createElement("div");
  subsectionElements.forEach(el => {
    tempContainer.appendChild(el.cloneNode(true));
  });
  
  // Extract content using the existing function
  return extractSectionContent(tempContainer);
}

/**
 * Inject content into a specific subsection
 * Replaces the content of a specific subsection (e.g., one experience entry)
 * @param sectionElement - The section DOM element
 * @param subsectionIndex - The index of the subsection to update
 * @param rewrittenContent - Plain text rewritten content from AI (may be JSON array for bullets)
 * @param originalContent - Optional: The original content that was rewritten (for smart merging)
 * @returns True if successful, false if subsection not found
 */
export function injectSubsectionContent(
  sectionElement: HTMLElement,
  subsectionIndex: number,
  rewrittenContent: string,
  originalContent?: string
): boolean {
  const h3Elements = sectionElement.querySelectorAll("h3");
  const h3 = h3Elements[subsectionIndex];
  
  if (!h3) return false;
  
  // Find all elements in this subsection (from this h3 until the next h3 or end)
  const subsectionElements: HTMLElement[] = [];
  let current: Element | null = h3;
  
  while (current && current !== sectionElement.querySelector("h2")) {
    if (current !== h3 && current.tagName === "H3") break;
    
    subsectionElements.push(current as HTMLElement);
    current = current.nextElementSibling;
    
    // Stop if we hit another h3 (start of next subsection)
    if (current && current !== h3 && current.tagName === "H3") break;
    // Stop if we hit the section header
    if (current && current.tagName === "H2") break;
  }
  
  if (subsectionElements.length === 0) return false;
  
  // Check if rewrittenContent is a JSON array (for bullets)
  let isJsonBullets = false;
  let rewrittenBulletTexts: string[] = [];
  
  try {
    const parsed = JSON.parse(rewrittenContent);
    if (Array.isArray(parsed) && parsed.every(item => typeof item === "string")) {
      isJsonBullets = true;
      rewrittenBulletTexts = parsed;
    }
  } catch {
    // Not JSON, continue with normal flow
  }
  
  // If we have JSON bullets, find the list in this subsection and do smart merging
  if (isJsonBullets && rewrittenBulletTexts.length > 0) {
    // Find the ul element in this subsection
    let listElement: HTMLUListElement | HTMLOListElement | null = null;
    
    for (const el of subsectionElements) {
      if (el.tagName === "UL" || el.tagName === "OL") {
        listElement = el as HTMLUListElement | HTMLOListElement;
        break;
      }
    }
    
    // If we found a list, swap bullets
    if (listElement) {
      const existingBullets = Array.from(listElement.querySelectorAll("li"));
      let swappedAny = false;
      
      // If we have original content, swap only the selected bullets
      if (originalContent && existingBullets.length > 0) {
        // Parse original content to find which bullets were selected
        const originalLines = originalContent.split("\n")
          .map(line => line.trim())
          .filter(line => {
            // Extract bullet text (remove bullet markers)
            const cleaned = line.replace(/^[•\-\*]\s*/, "").replace(/^\d+[\.\)]\s*/, "").trim();
            return cleaned.length > 0;
          })
          .map(line => line.replace(/^[•\-\*]\s*/, "").replace(/^\d+[\.\)]\s*/, "").trim());
        
        // Track which bullets we've already replaced to avoid duplicates
        const replacedIndices = new Set<number>();
        
        // For each original line, find and swap the exact matching bullet
        originalLines.forEach((originalLine, originalIndex) => {
          if (originalIndex >= rewrittenBulletTexts.length) return;
          
          const cleanOriginalLine = originalLine.trim().toLowerCase();
          const rewrittenText = rewrittenBulletTexts[originalIndex] || "";
          
          // Find the exact matching bullet by text content
          existingBullets.forEach((existingLi, bulletIndex) => {
            // Skip if this bullet was already replaced
            if (replacedIndices.has(bulletIndex)) return;
            
            const existingText = (existingLi as HTMLElement).textContent?.trim().toLowerCase() || "";
            
            // Exact match or very close match (one contains the other)
            if (existingText === cleanOriginalLine || 
                existingText.includes(cleanOriginalLine) || 
                cleanOriginalLine.includes(existingText)) {
              
              // Create new bullet with rewritten content
              const newLi = document.createElement("li");
              newLi.setAttribute("contenteditable", "true");
              newLi.textContent = rewrittenText.trim();
              
              // Replace the existing bullet with the rewritten one
              const parent = existingLi.parentNode;
              if (parent) {
                parent.replaceChild(newLi, existingLi);
                replacedIndices.add(bulletIndex);
                swappedAny = true;
                
                // Add highlight to the new bullet
                addHighlight(newLi);
              }
            }
          });
        });
        
        // If we swapped any bullets, we're done
        if (swappedAny) {
          // Ensure contenteditable attributes are preserved
          sectionElement
            .querySelectorAll("li")
            .forEach((el) => {
              (el as HTMLElement).setAttribute("contenteditable", "true");
            });
          
          return true; // Successfully swapped, exit early
        }
      }
      
      // Fallback: Only replace all bullets if NO original content (user selected "entire subsection")
      if (!originalContent) {
        // Clear existing bullets
        listElement.innerHTML = "";
        
        // Add new bullets
        rewrittenBulletTexts.forEach((bulletText) => {
          const newLi = document.createElement("li");
          newLi.setAttribute("contenteditable", "true");
          newLi.textContent = bulletText.trim();
          listElement!.appendChild(newLi);
          
          // Add highlight to all new bullets
          addHighlight(newLi);
        });
        
        // Ensure contenteditable attributes are preserved
        sectionElement
          .querySelectorAll("li")
          .forEach((el) => {
            (el as HTMLElement).setAttribute("contenteditable", "true");
          });
        
        return true;
      }
      
      // If we have originalContent but didn't swap anything, still return early
      // to prevent the fallback from replacing everything
      return true;
    }
  }
  
  // Fallback: Convert rewritten content to HTML and replace subsection content
  // Remove all elements except the first h3 (we'll keep the structure)
  const firstElement = subsectionElements[0];
  const parent = firstElement.parentElement;
  
  if (!parent) return false;
  
  // Remove all elements in the subsection except the first h3
  for (let i = 1; i < subsectionElements.length; i++) {
    const el = subsectionElements[i];
    if (el.parentElement) {
      el.parentElement.removeChild(el);
    }
  }
  
  // Convert rewritten content to HTML
  const rewrittenHtml = plainTextToHtml(rewrittenContent);
  
  // Insert the rewritten content after the h3
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = rewrittenHtml;
  
  // Insert the new content after the h3 and collect inserted elements for highlighting
  const insertedElements: HTMLElement[] = [];
  while (tempDiv.firstChild) {
    const child = tempDiv.firstChild as HTMLElement;
    tempDiv.removeChild(child);
    parent.insertBefore(child, firstElement.nextSibling);
    insertedElements.push(child);
  }
  
  // Add highlight to all inserted elements
  insertedElements.forEach((el) => {
    addHighlight(el);
  });
  
  // Ensure contenteditable attributes are preserved
  sectionElement
    .querySelectorAll("p, div, li, h3, h4")
    .forEach((el) => {
      (el as HTMLElement).setAttribute("contenteditable", "true");
    });
  
  return true;
}

/**
 * Inject section content by section type
 * Convenience function that combines finding, injecting, and triggering update
 * 
 * @param editorElement - The editor container element
 * @param sectionType - The section type to update
 * @param rewrittenContent - Plain text rewritten content from AI
 * @param originalContent - Optional: The original content that was rewritten (for smart merging)
 * @param subsectionIndex - Optional: If provided, inject only into this specific subsection
 * @returns True if successful, false if section not found
 */
export function injectSectionContentByType(
  editorElement: HTMLElement | null,
  sectionType: string,
  rewrittenContent: string,
  originalContent?: string,
  subsectionIndex?: number
): boolean {
  const section = findSectionByType(editorElement, sectionType);
  if (!section) return false;

  // If subsectionIndex is provided, inject only into that subsection
  if (subsectionIndex !== undefined) {
    const success = injectSubsectionContent(section, subsectionIndex, rewrittenContent, originalContent);
    if (success) {
      triggerEditorUpdate(editorElement);
    }
    return success;
  }

  injectSectionContent(section, rewrittenContent, originalContent);
  triggerEditorUpdate(editorElement);

  return true;
}

