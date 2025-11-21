"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GripVertical, Settings, Eye, EyeOff, X, Plus, Trash2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { extractSectionContentByType, hasSubsections, extractSubsectionContent } from "@/lib/sectionUtils";

type SectionDefinition = {
  type: string;
  label: string;
};

type SectionItem = {
  key: string;
  title: string;
  type?: string;
};

interface SectionReorderSidebarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onReorder?: (html: string) => void;
  onOpenChange?: (open: boolean) => void;
  onAddSection?: (sectionType: string) => void;
  onRemoveSection?: (sectionKey: string, sectionType?: string) => void;
  onSectionRewrite?: (sectionType: string, originalContent: string, subsectionIndex?: number) => void;
}

const SECTION_LIBRARY: SectionDefinition[] = [
  { type: "summary", label: "Summary" },
  { type: "objective", label: "Objective" },
  { type: "education", label: "Education" },
  { type: "experience", label: "Experience" },
  { type: "projects", label: "Projects" },
  { type: "skills", label: "Technical Skills" },
  { type: "certifications", label: "Certifications" },
  { type: "leadership", label: "Leadership" },
  { type: "volunteer", label: "Volunteer" },
  { type: "awardsHonors", label: "Awards & Honors" },
  { type: "publications", label: "Publications" },
  { type: "references", label: "References" },
];

const generateSectionKey = (() => {
  const FALLBACK_PREFIX = "section-key";
  return () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `${FALLBACK_PREFIX}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };
})();

const createSectionElement = (sectionType: string, sectionKey: string): HTMLElement => {
  const section = document.createElement("section");
  section.classList.add("mb6");
  section.setAttribute("data-section-type", sectionType);
  section.setAttribute("data-section-key", sectionKey);
  section.setAttribute("data-section-index", "0");

  const sectionContent: Record<string, string> = {
    summary: `
      <h2 contenteditable="true">Summary</h2>
      <div contenteditable="true">Write a brief summary highlighting your experience and strengths.</div>
    `,
    objective: `
      <h2 contenteditable="true">Objective</h2>
      <p contenteditable="true">Describe your career objective and the value you bring.</p>
    `,
    education: `
      <h2 contenteditable="true">Education</h2>
      <h3 contenteditable="true"><span>University Name</span> <span class="normal">Year – Year</span></h3>
      <h4 contenteditable="true"><span>Degree / Program</span> <span>Location</span></h4>
    `,
    experience: `
      <h2 contenteditable="true">Experience</h2>
      <h3 contenteditable="true"><span>Role Title</span> <span class="normal">Year – Year</span></h3>
      <h4 contenteditable="true"><span>Company</span> <span>Location</span></h4>
      <ul>
        <li contenteditable="true">Add a bullet describing your impact or accomplishment.</li>
      </ul>
    `,
    projects: `
      <h2 contenteditable="true">Projects</h2>
      <h3 contenteditable="true"><span>Project Name <span class="tech-stack">&nbsp;| <em>Tech Stack</em></span></span> <span class="normal">Year – Year</span></h3>
      <ul>
        <li contenteditable="true">Summarize the project goals, your role, and results.</li>
      </ul>
    `,
    skills: `
      <h2 contenteditable="true">Technical Skills</h2>
      <p contenteditable="true"><strong>Languages</strong>: Add your languages separated by commas.</p>
      <p contenteditable="true"><strong>Frameworks</strong>: Add relevant frameworks.</p>
      <p contenteditable="true"><strong>Tools</strong>: Add tools you regularly use.</p>
    `,
    certifications: `
      <h2 contenteditable="true">Certifications</h2>
      <h3 contenteditable="true"><span>Certification Name</span> <span class="normal">Issuing Organization</span></h3>
      <p contenteditable="true">Add the date or validity details.</p>
    `,
    leadership: `
      <h2 contenteditable="true">Leadership</h2>
      <h3 contenteditable="true"><span>Organization / Team</span> <span class="normal">Year – Year</span></h3>
      <p contenteditable="true">Describe your leadership role and impact.</p>
    `,
    volunteer: `
      <h2 contenteditable="true">Volunteer Experience</h2>
      <h3 contenteditable="true"><span>Organization</span> <span class="normal">Year – Year</span></h3>
      <p contenteditable="true">Share the volunteering work you contributed.</p>
    `,
    awardsHonors: `
      <h2 contenteditable="true">Awards & Honors</h2>
      <h3 contenteditable="true"><span>Award Name</span> <span class="normal">Organization</span></h3>
      <p contenteditable="true">Add a short note about what the award recognizes.</p>
    `,
    publications: `
      <h2 contenteditable="true">Publications</h2>
      <h3 contenteditable="true"><span>Publication Title</span> <span class="normal">Publication Date</span></h3>
      <p contenteditable="true">Summarize your publication or include a link.</p>
    `,
    references: `
      <h2 contenteditable="true">References</h2>
      <p contenteditable="true"><strong>Name</strong> — Title, Company</p>
      <p contenteditable="true">Email | Phone</p>
    `,
  };

  const fallbackContent = `
    <h2 contenteditable="true">New Section</h2>
    <p contenteditable="true">Start adding your content here…</p>
  `;

  section.innerHTML = sectionContent[sectionType] ?? fallbackContent;
  return section;
};

export function SectionReorderSidebar({
  editorRef,
  onReorder,
  onOpenChange,
  onAddSection,
  onRemoveSection,
  onSectionRewrite,
}: SectionReorderSidebarProps) {
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dropTargetKey, setDropTargetKey] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hiddenSections, setHiddenSections] = useState<Record<string, boolean>>({});
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState<boolean>(false);
  const [expandedHeaderSection, setExpandedHeaderSection] = useState<string | null>(null);
  const [openRewriteDropdown, setOpenRewriteDropdown] = useState<string | null>(null);
  const [expandedSubsections, setExpandedSubsections] = useState<string | null>(null);
  const [hiddenSubsections, setHiddenSubsections] = useState<Record<string, Set<number>>>({});
  const [draggingSubsection, setDraggingSubsection] = useState<{ sectionKey: string; subsectionId: number } | null>(null);
  const [dropTargetSubsection, setDropTargetSubsection] = useState<{ sectionKey: string; subsectionId: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenRewriteDropdown(null);
      }
    };

    if (openRewriteDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openRewriteDropdown]);
  const [headerContactInfo, setHeaderContactInfo] = useState<{
    phone: string;
    email: string;
    linkedIn: string;
    portfolio: string;
  }>({ phone: "", email: "", linkedIn: "", portfolio: "" });
  const [expandedEducationSection, setExpandedEducationSection] = useState<string | null>(null);
  const [educationDisplayOptions, setEducationDisplayOptions] = useState<Record<string, {
    schoolRightSide: "date" | "location";
    degreeLocationShow: boolean;
    degreeLocationPosition: "left" | "right";
    degreeGpaShow: boolean;
    schoolLocation?: string;
    degreeLocation?: string;
    gpa?: string;
  }>>({});
  const sectionKeyMapRef = useRef<WeakMap<Element, string>>(new WeakMap());
  const containerRef = useRef<HTMLDivElement | null>(null);

  const editorElement = editorRef.current;

  const updateSectionsFromDom = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const sectionNodes = Array.from(editor.querySelectorAll("section"));
    const nextSections: SectionItem[] = sectionNodes.map((node, index) => {
      let key = node.getAttribute("data-section-key") || sectionKeyMapRef.current.get(node);
      if (!key) {
        key = generateSectionKey();
        node.setAttribute("data-section-key", key);
        sectionKeyMapRef.current.set(node, key);
      } else {
        sectionKeyMapRef.current.set(node, key);
        node.setAttribute("data-section-key", key);
      }
      node.setAttribute("data-section-index", String(index));

      const type = node.getAttribute("data-section-type") || undefined;
      
      // Special handling for header section
      if (type === "header") {
        const h1 = node.querySelector("h1");
        const title = h1?.textContent?.trim() || "Header";
        return { key, title: `Header (${title})`, type };
      }
      
      const heading = node.querySelector("h2");
      const title = heading?.textContent?.trim() || `Section ${index + 1}`;

      return { key, title, type };
    });
    
    // Ensure header is always first
    const headerSection = nextSections.find(s => s.type === "header");
    const otherSections = nextSections.filter(s => s.type !== "header");
    const sortedSections = headerSection ? [headerSection, ...otherSections] : nextSections;

    setSections((prev) => {
      if (
        prev.length === sortedSections.length &&
        prev.every((item, idx) => {
          const next = sortedSections[idx];
          return next && item.key === next.key && item.title === next.title && item.type === next.type;
        })
      ) {
        return prev;
      }
      return sortedSections;
    });

    setHiddenSections((prev) => {
      const next: Record<string, boolean> = { ...prev };
      let changed = false;
      const validKeys = new Set(sortedSections.map((section) => section.key));

      sortedSections.forEach((section) => {
        if (!(section.key in next)) {
          // Header section can never be hidden
          if (section.type === "header") {
            next[section.key] = false;
          } else {
            next[section.key] = false;
          }
          changed = true;
        }
        // Ensure header is never hidden
        if (section.type === "header" && next[section.key] === true) {
          next[section.key] = false;
          changed = true;
        }
      });

      Object.keys(next).forEach((key) => {
        if (!validKeys.has(key)) {
          delete next[key];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [editorRef]);

  const applyDomOrder = useCallback(
    (orderedSections: SectionItem[]) => {
      const editor = editorRef.current;
      if (!editor) return;

      // Ensure header is always first
      const headerSection = orderedSections.find(s => s.type === "header");
      const otherSections = orderedSections.filter(s => s.type !== "header");
      const finalOrder = headerSection ? [headerSection, ...otherSections] : orderedSections;

      const fragment = document.createDocumentFragment();

      finalOrder.forEach((sectionItem, orderIndex) => {
        const node = editor.querySelector<HTMLElement>(`[data-section-key="${sectionItem.key}"]`);
        if (node) {
          node.setAttribute("data-section-index", String(orderIndex));
          fragment.appendChild(node);
        }
      });

      editor.appendChild(fragment);

      if (onReorder) {
        const htmlSnapshot = editor.innerHTML;
        requestAnimationFrame(() => onReorder(htmlSnapshot));
      }
    },
    [editorRef, onReorder]
  );

  const reorderSections = useCallback(
    (sourceKey: string, targetKey: string | null) => {
      setSections((prev) => {
        if (sourceKey === targetKey) return prev;

        // Prevent moving header section
        const sourceSection = prev.find(s => s.key === sourceKey);
        if (sourceSection?.type === "header") return prev;

        const working = [...prev];
        const sourceIndex = working.findIndex((item) => item.key === sourceKey);
        if (sourceIndex === -1) return prev;

        // Prevent moving sections above header
        const headerSection = working.find(s => s.type === "header");
        if (headerSection) {
          let insertIndex =
            targetKey === null ? working.length : working.findIndex((item) => item.key === targetKey);
          if (insertIndex < 0) {
            insertIndex = working.length;
          }
          // Ensure insertIndex is never 0 (header must stay at top)
          if (insertIndex === 0) {
            insertIndex = 1;
          }
          
          const [moved] = working.splice(sourceIndex, 1);
          working.splice(insertIndex, 0, moved);
        } else {
          const [moved] = working.splice(sourceIndex, 1);
          let insertIndex =
            targetKey === null ? working.length : working.findIndex((item) => item.key === targetKey);
          if (insertIndex < 0) {
            insertIndex = working.length;
          }
          working.splice(insertIndex, 0, moved);
        }
        
        applyDomOrder(working);
        return working;
      });
    },
    [applyDomOrder]
  );

  const handleDragStart = useCallback((key: string) => {
    return (event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", key);
      setDraggingKey(key);
    };
  }, []);

  const handleDragOver = useCallback((key: string | null) => {
    return (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      if (dropTargetKey !== key) {
        setDropTargetKey(key);
      }
    };
  }, [dropTargetKey]);

  const handleDrop = useCallback(
    (targetKey: string | null) => {
      return (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const sourceKey = event.dataTransfer.getData("text/plain");
        if (sourceKey) {
          reorderSections(sourceKey, targetKey);
        }
        setDraggingKey(null);
        setDropTargetKey(null);
      };
    },
    [reorderSections]
  );

  const handleDragEnd = useCallback(() => {
    setDraggingKey(null);
    setDropTargetKey(null);
  }, []);

  const toggleSectionVisibility = useCallback((sectionKey: string, sectionType?: string) => {
    // Prevent hiding header section
    if (sectionType === "header") return;
    
    setHiddenSections((prev) => ({
      ...prev,
      [sectionKey]: !(prev[sectionKey] ?? false),
    }));
  }, []);

  const toggleSubsectionVisibility = useCallback((sectionKey: string, subsectionId: number) => {
    const editor = editorRef.current;
    if (!editor) return;
    
    const sectionElement = editor.querySelector(`section[data-section-key="${sectionKey}"]`) as HTMLElement | null;
    if (!sectionElement) return;
    
    // Get all h3 elements directly from DOM (these are the subsection markers)
    const h3Elements = Array.from(sectionElement.querySelectorAll("h3")) as HTMLElement[];
    if (subsectionId < 0 || subsectionId >= h3Elements.length) return;
    
    const h3 = h3Elements[subsectionId];
    if (!h3) return;
    
    // Get current state and toggle
    setHiddenSubsections((prev) => {
      const sectionHiddenSet = prev[sectionKey] || new Set<number>();
      const newSet = new Set(sectionHiddenSet);
      const wasHidden = newSet.has(subsectionId);
      
      if (wasHidden) {
        newSet.delete(subsectionId);
      } else {
        newSet.add(subsectionId);
      }
      
      const isHidden = newSet.has(subsectionId);
      
      // Collect all elements for this subsection (h3 and all its siblings until next h3 or end)
      // This includes: h3 (title), h4 (company), ul/ol (bullets), and any other elements
      const elementsToToggle: HTMLElement[] = [h3];
      let currentElement: Element | null = h3.nextElementSibling;
      
      while (currentElement && currentElement.parentElement === sectionElement) {
        // Stop if we hit another h3 (start of next subsection) or h2 (section header)
        if (currentElement.tagName === 'H3' || currentElement.tagName === 'H2') break;
        elementsToToggle.push(currentElement as HTMLElement);
        currentElement = currentElement.nextElementSibling;
      }
      
      // Apply visibility to all elements in this subsection
      // Use !important to override any inline styles that might be set elsewhere
      elementsToToggle.forEach(el => {
        if (isHidden) {
          el.style.setProperty('display', 'none', 'important');
          el.setAttribute('data-subsection-hidden', 'true');
        } else {
          el.style.removeProperty('display');
          el.removeAttribute('data-subsection-hidden');
        }
      });
      
      // Trigger reorder callback to save changes
      if (onReorder) {
        requestAnimationFrame(() => {
          const htmlSnapshot = editor.innerHTML;
          onReorder(htmlSnapshot);
        });
      }
      
      return {
        ...prev,
        [sectionKey]: newSet,
      };
    });
  }, [editorRef, onReorder]);

  const reorderSubsections = useCallback((sectionKey: string, sourceId: number, targetId: number | null) => {
    const editor = editorRef.current;
    if (!editor) return;
    
    const sectionElement = editor.querySelector(`section[data-section-key="${sectionKey}"]`) as HTMLElement | null;
    if (!sectionElement) return;
    
    // Get all h3 elements directly from DOM (these are the subsection markers)
    const h3Elements = Array.from(sectionElement.querySelectorAll("h3")) as HTMLElement[];
    if (sourceId < 0 || sourceId >= h3Elements.length) return;
    if (sourceId === targetId) return;
    
    const sourceH3 = h3Elements[sourceId];
    if (!sourceH3) return;
    
    // Collect all elements for the source subsection (h3 and its siblings until next h3 or end)
    const sourceElements: HTMLElement[] = [sourceH3];
    let currentElement: Element | null = sourceH3.nextElementSibling;
    
    while (currentElement && currentElement.parentElement === sectionElement) {
      // Stop if we hit another h3 (start of next subsection) or h2 (section header)
      if (currentElement.tagName === 'H3' || currentElement.tagName === 'H2') break;
      sourceElements.push(currentElement as HTMLElement);
      currentElement = currentElement.nextElementSibling;
    }
    
    // Find target position
    let targetH3: HTMLElement | null = null;
    if (targetId !== null && targetId >= 0 && targetId < h3Elements.length) {
      targetH3 = h3Elements[targetId];
    }
    
    // Create fragment and move elements (actual DOM nodes, not clones)
    const fragment = document.createDocumentFragment();
    sourceElements.forEach(el => {
      fragment.appendChild(el); // This automatically removes from original position
    });
    
    // Insert at target position
    if (targetH3 && targetH3 !== sourceH3 && targetH3.parentElement === sectionElement) {
      // Insert before target h3
      sectionElement.insertBefore(fragment, targetH3);
    } else {
      // Insert at end (after last subsection)
      sectionElement.appendChild(fragment);
    }
    
    // Update sections list first
    updateSectionsFromDom();
    
    // Trigger reorder callback to save changes
    if (onReorder) {
      requestAnimationFrame(() => {
        const htmlSnapshot = editor.innerHTML;
        onReorder(htmlSnapshot);
      });
    }
  }, [editorRef, onReorder, updateSectionsFromDom]);

  const extractHeaderContactInfo = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return { phone: "", email: "", linkedIn: "", portfolio: "" };

    const headerSection = editor.querySelector('[data-section-type="header"]');
    if (!headerSection) return { phone: "", email: "", linkedIn: "", portfolio: "" };

    const headerInfo = headerSection.querySelector('.headerInfo');
    if (!headerInfo) return { phone: "", email: "", linkedIn: "", portfolio: "" };

    const links = headerInfo.querySelectorAll('a');
    const listItems = headerInfo.querySelectorAll('li');
    
    let phone = "";
    let email = "";
    let linkedIn = "";
    let portfolio = "";

    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      const text = link.textContent?.trim() || '';
      
      if (href.startsWith('mailto:')) {
        email = text;
      } else if (href.includes('linkedin.com')) {
        linkedIn = href;
      } else if (href && !href.includes('linkedin.com') && !href.startsWith('mailto:')) {
        portfolio = href;
      }
    });

    listItems.forEach(li => {
      const text = li.textContent?.trim() || '';
      const link = li.querySelector('a');
      if (!link && text) {
        // Check if it's a phone number pattern
        if (/[\d\s\-\(\)]+/.test(text) && text.length >= 10 && !text.includes('@') && !text.includes('http')) {
          phone = text;
        }
      }
    });

    return { phone, email, linkedIn, portfolio };
  }, [editorRef]);

  const handleToggleHeaderDropdown = useCallback((sectionKey: string) => {
    if (expandedHeaderSection === sectionKey) {
      setExpandedHeaderSection(null);
    } else {
      setExpandedHeaderSection(sectionKey);
      // Extract current contact info when opening
      const currentInfo = extractHeaderContactInfo();
      setHeaderContactInfo(currentInfo);
    }
  }, [expandedHeaderSection, extractHeaderContactInfo]);

  const handleSaveHeaderContactInfo = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const headerSection = editor.querySelector('[data-section-type="header"]');
    if (!headerSection) return;

    const headerInfo = headerSection.querySelector('.headerInfo');
    if (!headerInfo) return;

    const ul = headerInfo.querySelector('ul');
    if (!ul) return;

    // Clear existing content
    ul.innerHTML = '';

    // Add phone if provided
    if (headerContactInfo.phone) {
      const li = document.createElement('li');
      li.textContent = headerContactInfo.phone;
      li.setAttribute('contenteditable', 'true');
      ul.appendChild(li);
    }

    // Add email if provided
    if (headerContactInfo.email) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `mailto:${headerContactInfo.email}`;
      a.textContent = headerContactInfo.email;
      a.setAttribute('contenteditable', 'true');
      li.appendChild(a);
      ul.appendChild(li);
    }

    // Add LinkedIn if provided
    if (headerContactInfo.linkedIn) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = headerContactInfo.linkedIn;
      a.textContent = headerContactInfo.linkedIn.includes('linkedin.com') 
        ? headerContactInfo.linkedIn.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '') 
        : headerContactInfo.linkedIn;
      a.setAttribute('contenteditable', 'true');
      li.appendChild(a);
      ul.appendChild(li);
    }

    // Add portfolio if provided
    if (headerContactInfo.portfolio) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = headerContactInfo.portfolio;
      a.textContent = headerContactInfo.portfolio.replace(/^https?:\/\//, '').replace(/\/$/, '');
      a.setAttribute('contenteditable', 'true');
      li.appendChild(a);
      ul.appendChild(li);
    }

    // Close dropdown
    setExpandedHeaderSection(null);

    // Trigger reorder callback to save changes
    if (onReorder) {
      const htmlSnapshot = editor.innerHTML;
      requestAnimationFrame(() => onReorder(htmlSnapshot));
    }
  }, [headerContactInfo, editorRef, onReorder]);

  const getEducationDisplayOptions = useCallback((sectionKey: string) => {
    const editor = editorRef.current;
    if (!editor) return { 
      schoolRightSide: "date" as const, 
      degreeLocationShow: true,
      degreeLocationPosition: "right" as const,
      degreeGpaShow: false,
      schoolLocation: "",
      degreeLocation: "",
      gpa: "",
    };

    const section = editor.querySelector(`[data-section-key="${sectionKey}"]`);
    if (!section) return { 
      schoolRightSide: "date" as const, 
      degreeLocationShow: true,
      degreeLocationPosition: "right" as const,
      degreeGpaShow: false,
      schoolLocation: "",
      degreeLocation: "",
      gpa: "",
    };

    // Extract current values from HTML
    let schoolLocation = "";
    let degreeLocation = "";
    let gpa = "";
    let degreeLocationShow = true;
    let degreeLocationPosition: "left" | "right" = "right";
    let degreeGpaShow = false;

    const h3Elements = section.querySelectorAll('h3');
    const h4Elements = section.querySelectorAll('h4');

    // Try to extract location from h3 if it's on the right side
    h3Elements.forEach((h3) => {
      const spans = h3.querySelectorAll('span');
      if (spans.length >= 2) {
        const rightSpan = spans[1];
        if (!rightSpan.classList.contains('normal')) {
          schoolLocation = rightSpan.textContent?.trim() || "";
        }
      }
    });

    // Extract location and GPA from h4
    h4Elements.forEach((h4) => {
      const spans = h4.querySelectorAll('span');
      const h4Text = h4.textContent || "";
      
      // Check if location is in the degree text (left position with |)
      const degreeSpan = spans[0];
      if (degreeSpan) {
        const degreeText = degreeSpan.textContent || "";
        if (degreeText.includes(' | ')) {
          const parts = degreeText.split(' | ');
          if (parts.length > 1) {
            degreeLocation = parts[1].trim();
            degreeLocationPosition = "left";
            degreeLocationShow = true;
          }
        }
      }
      
      // Check if location is in a separate span (right position)
      if (spans.length >= 2) {
        const rightSpan = spans[1];
        const rightText = rightSpan.textContent?.trim() || "";
        // Check if it's GPA - extract just the number part
        const gpaMatch = rightText.match(/GPA[:\s]*([\d]+\.?[\d]*)/i);
        if (gpaMatch && gpaMatch[1]) {
          gpa = gpaMatch[1].trim();
          degreeGpaShow = true;
        } else if (rightText && !rightText.includes('GPA')) {
          degreeLocation = rightText;
          degreeLocationPosition = "right";
          degreeLocationShow = true;
        }
      }
      
      // Check if GPA is mentioned anywhere in the h4 text
      const gpaMatch = h4Text.match(/GPA[:\s]*([\d]+\.?[\d]*)/i);
      if (gpaMatch && gpaMatch[1] && !gpa) {
        gpa = gpaMatch[1].trim();
        degreeGpaShow = true;
      }
    });

    return {
      schoolRightSide: (section.getAttribute('data-education-school-right') || 'date') as "date" | "location",
      degreeLocationShow: degreeLocationShow,
      degreeLocationPosition: (section.getAttribute('data-education-location-pos') || degreeLocationPosition) as "left" | "right",
      degreeGpaShow: (section.getAttribute('data-education-gpa-show') === 'true') || degreeGpaShow,
      schoolLocation: schoolLocation,
      degreeLocation: degreeLocation,
      gpa: gpa,
    };
  }, [editorRef]);

  const handleToggleEducationDropdown = useCallback((sectionKey: string) => {
    if (expandedEducationSection === sectionKey) {
      setExpandedEducationSection(null);
    } else {
      setExpandedEducationSection(sectionKey);
      // Load current options
      const currentOptions = getEducationDisplayOptions(sectionKey);
      setEducationDisplayOptions(prev => ({
        ...prev,
        [sectionKey]: currentOptions,
      }));
    }
  }, [expandedEducationSection, getEducationDisplayOptions]);

  const handleSaveEducationDisplayOptions = useCallback((sectionKey: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const section = editor.querySelector(`[data-section-key="${sectionKey}"]`);
    if (!section) return;

    const options = educationDisplayOptions[sectionKey];
    if (!options) return;

    // Save options to data attributes
    section.setAttribute('data-education-school-right', options.schoolRightSide);
    section.setAttribute('data-education-location-show', String(options.degreeLocationShow));
    section.setAttribute('data-education-location-pos', options.degreeLocationPosition);
    section.setAttribute('data-education-gpa-show', String(options.degreeGpaShow));

    // Update the HTML structure based on options
    const h3Elements = section.querySelectorAll('h3');
    const h4Elements = section.querySelectorAll('h4');

    h3Elements.forEach((h3) => {
      const spans = h3.querySelectorAll('span');
      if (spans.length < 2) {
        // Create second span if it doesn't exist
        const schoolSpan = spans[0] || document.createElement('span');
        const rightSpan = document.createElement('span');
        h3.innerHTML = '';
        h3.appendChild(schoolSpan);
        h3.appendChild(rightSpan);
        schoolSpan.textContent = schoolSpan.textContent || 'School Name';
      }

      const rightSpan = spans[1];

      // Update right side based on preference
      if (options.schoolRightSide === 'location') {
        rightSpan.textContent = options.schoolLocation || '';
        rightSpan.className = '';
      } else {
        // Keep date on right side (default) - preserve existing date or show placeholder
        if (!rightSpan.textContent?.trim() || !rightSpan.classList.contains('normal')) {
          // Try to get date from existing content or use placeholder
          const existingDate = rightSpan.textContent?.trim() || 'Year – Year';
          rightSpan.textContent = existingDate;
        }
        rightSpan.className = 'normal';
      }
    });

    h4Elements.forEach((h4) => {
      const spans = h4.querySelectorAll('span');
      if (spans.length === 0) {
        // Create degree span if it doesn't exist
        const degreeSpan = document.createElement('span');
        degreeSpan.textContent = 'Degree';
        h4.appendChild(degreeSpan);
      }

      const degreeSpan = spans[0];
      let rightSpan = spans[1];
      const degreeText = degreeSpan.textContent?.trim() || '';

      // Clean up existing location/GPA from degree text if it was inline
      const cleanDegreeText = degreeText.split(' | ')[0].trim();
      degreeSpan.textContent = cleanDegreeText;

      // Remove existing right span to rebuild
      if (rightSpan) {
        rightSpan.remove();
      }

      // Handle location on left (after degree with |)
      if (options.degreeLocationShow && options.degreeLocationPosition === 'left') {
        const locationText = options.degreeLocation || '';
        if (locationText) {
          degreeSpan.innerHTML = `${cleanDegreeText} | ${locationText}`;
        }
      }

      // Handle right side - can be location OR GPA (if both are selected, location goes left and GPA goes right)
      if (options.degreeLocationShow && options.degreeLocationPosition === 'right' && !options.degreeGpaShow) {
        // Show location on right (only if GPA is not shown)
        rightSpan = document.createElement('span');
        h4.appendChild(rightSpan);
        rightSpan.textContent = options.degreeLocation || '';
      } else if (options.degreeGpaShow) {
        // Show GPA on right (takes priority if both location and GPA are selected)
        rightSpan = document.createElement('span');
        h4.appendChild(rightSpan);
        // Clean GPA value - remove any "GPA:" prefix if it exists, then add it back
        let cleanGpa = (options.gpa || '').trim();
        // Remove "GPA:" prefix if present
        cleanGpa = cleanGpa.replace(/^GPA[:\s]*/i, '').trim();
        const gpaText = cleanGpa ? `GPA: ${cleanGpa}` : '';
        rightSpan.textContent = gpaText;
      }
    });

    // Close dropdown
    setExpandedEducationSection(null);

    // Trigger reorder callback to save changes
    if (onReorder) {
      const htmlSnapshot = editor.innerHTML;
      requestAnimationFrame(() => onReorder(htmlSnapshot));
    }
  }, [educationDisplayOptions, editorRef, onReorder]);

  useEffect(() => {
    if (!editorElement) return;
    updateSectionsFromDom();
  }, [editorElement, updateSectionsFromDom]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const observer = new MutationObserver(() => {
      updateSectionsFromDom();
    });

    observer.observe(editor, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [editorRef, updateSectionsFromDom]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    sections.forEach(({ key, type }) => {
      const node = editor.querySelector<HTMLElement>(`[data-section-key="${key}"]`);
      if (!node) return;
      const hidden = hiddenSections[key] ?? false;
      if (hidden) {
        node.style.display = "none";
        node.setAttribute("data-section-hidden", "true");
      } else {
        node.style.display = "";
        node.setAttribute("data-section-hidden", "false");
        
        // Apply subsection visibility if section has subsections
        if (type && hasSubsections(type)) {
          const sectionHiddenSubsections = hiddenSubsections[key] || new Set<number>();
          // Get h3 elements directly from DOM (these mark subsections)
          const h3Elements = Array.from(node.querySelectorAll("h3")) as HTMLElement[];
          
          h3Elements.forEach((h3, index) => {
            const isHidden = sectionHiddenSubsections.has(index);
            
            // Collect all elements for this subsection (h3 and all siblings until next h3)
            const elementsToToggle: HTMLElement[] = [h3];
            let currentElement: Element | null = h3.nextElementSibling;
            
            while (currentElement && currentElement.parentElement === node) {
              // Stop if we hit another h3 (start of next subsection) or h2 (section header)
              if (currentElement.tagName === 'H3' || currentElement.tagName === 'H2') break;
              elementsToToggle.push(currentElement as HTMLElement);
              currentElement = currentElement.nextElementSibling;
            }
            
            // Apply visibility - use !important to ensure it overrides other styles
            elementsToToggle.forEach(el => {
              if (isHidden) {
                el.style.setProperty('display', 'none', 'important');
                el.setAttribute('data-subsection-hidden', 'true');
              } else {
                el.style.removeProperty('display');
                el.removeAttribute('data-subsection-hidden');
              }
            });
          });
        }
      }
    });

    if (onReorder) {
      const htmlSnapshot = editor.innerHTML;
      requestAnimationFrame(() => onReorder(htmlSnapshot));
    }
  }, [hiddenSections, hiddenSubsections, sections, editorRef, onReorder]);

  const hasSections = sections.length > 0;

  const availableSections = useMemo(() => {
    const existingTypes = new Set(sections.map((section) => section.type).filter(Boolean));
    return SECTION_LIBRARY.filter((section) => !existingTypes.has(section.type));
  }, [sections]);

  const handleAddSection = useCallback(() => {
    if (!availableSections.length) return;
    setIsAddSectionModalOpen(true);
  }, [availableSections.length]);

  const closeAddSectionModal = useCallback(() => {
    setIsAddSectionModalOpen(false);
  }, []);

  const handleSelectSection = useCallback(
    (sectionType: string) => {
      closeAddSectionModal();

      if (onAddSection) {
        onAddSection(sectionType);
        return;
      }

      const editor = editorRef.current;
      if (!editor) return;

      const nextIndex = editor.querySelectorAll("section").length;
      const sectionKey = generateSectionKey();
      const newSection = createSectionElement(sectionType, sectionKey);
      newSection.setAttribute("data-section-index", String(nextIndex));

      sectionKeyMapRef.current.set(newSection, sectionKey);
      editor.appendChild(newSection);

      updateSectionsFromDom();

      if (onReorder) {
        const htmlSnapshot = editor.innerHTML;
        requestAnimationFrame(() => onReorder(htmlSnapshot));
      }

      requestAnimationFrame(() => {
        newSection.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    },
    [closeAddSectionModal, editorRef, onAddSection, onReorder, updateSectionsFromDom]
  );

  const handleRemoveSection = useCallback(
    (sectionKey: string, sectionType?: string) => {
      // Prevent removing header section
      if (sectionType === "header") return;
      
      if (onRemoveSection) {
        onRemoveSection(sectionKey, sectionType);
        return;
      }

      const editor = editorRef.current;
      if (!editor) return;

      const node = editor.querySelector<HTMLElement>(`[data-section-key="${sectionKey}"]`);
      if (!node) return;

      node.remove();
      updateSectionsFromDom();

      setHiddenSections((prev) => {
        if (!(sectionKey in prev)) return prev;
        const next = { ...prev };
        delete next[sectionKey];
        return next;
      });

      if (onReorder) {
        const htmlSnapshot = editor.innerHTML;
        requestAnimationFrame(() => onReorder(htmlSnapshot));
      }
    },
    [editorRef, onRemoveSection, onReorder, updateSectionsFromDom]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;
      if (!container.contains(event.target as Node)) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, onOpenChange]);

  return (
    <div ref={containerRef}>
      <div
        className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${
          isOpen ? "w-72 xl:w-80" : "w-0"
        }`}
        aria-hidden
      />

      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            onOpenChange?.(true);
          }}
          className="hidden lg:flex fixed right-6 top-1/2 z-40 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-lg transition-all duration-200 hover:border-blue-300 hover:text-blue-600"
          aria-expanded={isOpen}
          aria-controls="resume-section-sidebar"
          title="Open sections"
        >
          <Settings className="h-5 w-5" />
        </button>
      )}

      <aside
        className={`hidden lg:flex fixed top-1/2 right-6 z-30 -translate-y-1/2 transition-all duration-300 ${
          isOpen ? "w-72 xl:w-80 opacity-100" : "w-0 opacity-0 pointer-events-none"
        }`}
      >
        <div
          id="resume-section-sidebar"
          className={`flex h-full max-h-[80vh] flex-col overflow-hidden rounded-l-2xl border border-gray-200 bg-white shadow-lg transition-all duration-300 ${
            isOpen ? "translate-x-0" : "translate-x-6"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2 text-gray-800">
              <Settings className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Sections</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenChange?.(false);
              }}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close sections panel"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
          <div className="px-5 pt-4 pb-3 text-xs text-gray-500">
            Drag sections to reorder. Use the eye icon to hide sections from the resume.
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-5">
            {hasSections ? (
              <div className="flex flex-col gap-2">
                {sections.map((section) => {
                  const isHeader = section.type === "header";
                  const isHidden = hiddenSections[section.key] ?? false;
                  const isDragging = draggingKey === section.key;
                  const isDropTarget = dropTargetKey === section.key;
                  return (
                    <div key={section.key} className="flex flex-col gap-2">
                      <div
                        draggable={!isHeader}
                        onDragStart={isHeader ? undefined : handleDragStart(section.key)}
                        onDragOver={handleDragOver(section.key)}
                        onDrop={handleDrop(section.key)}
                        onDragEnd={handleDragEnd}
                        className={`group relative flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                          isHeader
                            ? "border-blue-200 bg-blue-50/50 text-gray-700 cursor-default"
                            : isDragging
                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                            : isDropTarget
                            ? "border-blue-400 bg-blue-50/70"
                            : isHidden
                            ? "border-gray-200 bg-gray-50 text-gray-400 opacity-70"
                            : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/60 text-gray-700"
                        }`}
                      >
                        {isHeader ? (
                          <div className="h-4 w-4 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-blue-500" title="Header (always at top)" />
                          </div>
                        ) : (
                          <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                        )}
                        <span className="flex-1 truncate">{section.title}</span>
                        {isHeader ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              handleToggleHeaderDropdown(section.key);
                            }}
                            onMouseDown={(event) => event.stopPropagation()}
                            onPointerDown={(event) => event.stopPropagation()}
                            className="rounded-full p-1 text-blue-600 transition-colors hover:bg-blue-100"
                            aria-label="Edit contact info"
                            title="Edit contact info"
                          >
                            {expandedHeaderSection === section.key ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        ) : section.type === "education" ? (
                          <>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                handleToggleEducationDropdown(section.key);
                              }}
                              onMouseDown={(event) => event.stopPropagation()}
                              onPointerDown={(event) => event.stopPropagation()}
                              className="rounded-full p-1 text-blue-600 transition-colors hover:bg-blue-100"
                              aria-label="Education display options"
                              title="Education display options"
                            >
                              {expandedEducationSection === section.key ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                toggleSectionVisibility(section.key, section.type);
                              }}
                              onMouseDown={(event) => event.stopPropagation()}
                              onPointerDown={(event) => event.stopPropagation()}
                              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                              aria-pressed={isHidden}
                              aria-label={isHidden ? "Show section" : "Hide section"}
                              title={isHidden ? "Show section" : "Hide section"}
                            >
                              {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                handleRemoveSection(section.key, section.type);
                              }}
                              onMouseDown={(event) => event.stopPropagation()}
                              onPointerDown={(event) => event.stopPropagation()}
                              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              aria-label="Remove section"
                              title="Remove section"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : hasSubsections(section.type || '') ? (
                          <>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                setExpandedSubsections(
                                  expandedSubsections === section.key ? null : section.key
                                );
                              }}
                              onMouseDown={(event) => event.stopPropagation()}
                              onPointerDown={(event) => event.stopPropagation()}
                              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                              aria-label={expandedSubsections === section.key ? "Collapse section" : "Expand section"}
                              title={expandedSubsections === section.key ? "Collapse section" : "Expand section"}
                            >
                              {expandedSubsections === section.key ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                            {onSectionRewrite && section.type !== "skills" && (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  const editor = editorRef.current;
                                  if (!editor || !section.type) return;
                                  
                                  const content = extractSectionContentByType(editor, section.type);
                                  if (content && onSectionRewrite) {
                                    onSectionRewrite(section.type, content);
                                  }
                                }}
                                onMouseDown={(event) => event.stopPropagation()}
                                onPointerDown={(event) => event.stopPropagation()}
                                className="rounded-full p-1 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                aria-label="Rewrite section with AI"
                                title="Rewrite section with AI"
                              >
                                <Sparkles className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                toggleSectionVisibility(section.key, section.type);
                              }}
                              onMouseDown={(event) => event.stopPropagation()}
                              onPointerDown={(event) => event.stopPropagation()}
                              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                              aria-pressed={isHidden}
                              aria-label={isHidden ? "Show section" : "Hide section"}
                              title={isHidden ? "Show section" : "Hide section"}
                            >
                              {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                handleRemoveSection(section.key, section.type);
                              }}
                              onMouseDown={(event) => event.stopPropagation()}
                              onPointerDown={(event) => event.stopPropagation()}
                              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              aria-label="Remove section"
                              title="Remove section"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            {onSectionRewrite && section.type && section.type !== "header" && section.type !== "skills" && (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  const editor = editorRef.current;
                                  if (!editor || !section.type) return;
                                  
                                  const sectionElement = editor.querySelector(
                                    `section[data-section-key="${section.key}"]`
                                  ) as HTMLElement | null;
                                  
                                  if (sectionElement && onSectionRewrite) {
                                    // Extract content and trigger rewrite
                                    const content = extractSectionContentByType(editor, section.type);
                                    if (content) {
                                      onSectionRewrite(section.type, content);
                                    }
                                  }
                                }}
                                onMouseDown={(event) => event.stopPropagation()}
                                onPointerDown={(event) => event.stopPropagation()}
                                className="rounded-full p-1 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                aria-label="Rewrite section with AI"
                                title="Rewrite section with AI"
                              >
                                <Sparkles className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                toggleSectionVisibility(section.key, section.type);
                              }}
                              onMouseDown={(event) => event.stopPropagation()}
                              onPointerDown={(event) => event.stopPropagation()}
                              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                              aria-pressed={isHidden}
                              aria-label={isHidden ? "Show section" : "Hide section"}
                              title={isHidden ? "Show section" : "Hide section"}
                            >
                              {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                handleRemoveSection(section.key, section.type);
                              }}
                              onMouseDown={(event) => event.stopPropagation()}
                              onPointerDown={(event) => event.stopPropagation()}
                              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              aria-label="Remove section"
                              title="Remove section"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                      {isHeader && expandedHeaderSection === section.key && (
                        <div className="rounded-lg border border-blue-200 bg-white p-4 space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Phone
                            </label>
                            <input
                              type="text"
                              value={headerContactInfo.phone}
                              onChange={(e) => setHeaderContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="(555) 123-4567"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              value={headerContactInfo.email}
                              onChange={(e) => setHeaderContactInfo(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="your.email@example.com"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              LinkedIn
                            </label>
                            <input
                              type="url"
                              value={headerContactInfo.linkedIn}
                              onChange={(e) => setHeaderContactInfo(prev => ({ ...prev, linkedIn: e.target.value }))}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="https://linkedin.com/in/yourprofile"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Portfolio/Website
                            </label>
                            <input
                              type="url"
                              value={headerContactInfo.portfolio}
                              onChange={(e) => setHeaderContactInfo(prev => ({ ...prev, portfolio: e.target.value }))}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="https://yourwebsite.com"
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSaveHeaderContactInfo();
                              }}
                              className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setExpandedHeaderSection(null);
                              }}
                              className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      {section.type === "education" && expandedEducationSection === section.key && (
                        <div className="rounded-lg border border-blue-200 bg-white p-4 space-y-4">
                          {/* School Name Section */}
                          <div className="space-y-2 pb-3 border-b border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">School Name</h4>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                Show on right side
                              </label>
                              <select
                                value={educationDisplayOptions[section.key]?.schoolRightSide || "date"}
                                onChange={(e) => setEducationDisplayOptions(prev => ({
                                  ...prev,
                                  [section.key]: {
                                    ...prev[section.key],
                                  schoolRightSide: e.target.value as "date" | "location",
                                  degreeLocationShow: prev[section.key]?.degreeLocationShow ?? true,
                                  degreeLocationPosition: prev[section.key]?.degreeLocationPosition || "right",
                                  degreeGpaShow: prev[section.key]?.degreeGpaShow || false,
                                  schoolLocation: prev[section.key]?.schoolLocation || "",
                                  degreeLocation: prev[section.key]?.degreeLocation || "",
                                  gpa: prev[section.key]?.gpa || "",
                                  }
                                }))}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="date">Date (default)</option>
                                <option value="location">Location</option>
                              </select>
                              <p className="text-xs text-gray-500 mt-1">Choose what appears on the right side of the school name</p>
                            </div>
                            {educationDisplayOptions[section.key]?.schoolRightSide === "location" && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                  Enter location
                                </label>
                                <input
                                  type="text"
                                  value={educationDisplayOptions[section.key]?.schoolLocation || ""}
                                  onChange={(e) => setEducationDisplayOptions(prev => ({
                                    ...prev,
                                    [section.key]: {
                                      ...prev[section.key],
                                      schoolLocation: e.target.value,
                                      degreeLocationShow: prev[section.key]?.degreeLocationShow ?? true,
                                      degreeLocationPosition: prev[section.key]?.degreeLocationPosition || "right",
                                      degreeGpaShow: prev[section.key]?.degreeGpaShow || false,
                                      degreeLocation: prev[section.key]?.degreeLocation || "",
                                      gpa: prev[section.key]?.gpa || "",
                                    }
                                  }))}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="e.g., New York, NY"
                                />
                              </div>
                            )}
                          </div>

                          {/* Degree Section */}
                          <div className="space-y-2 pb-3 border-b border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Degree</h4>
                            
                            {/* Location Options */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`location-show-${section.key}`}
                                  checked={educationDisplayOptions[section.key]?.degreeLocationShow ?? true}
                                  onChange={(e) => setEducationDisplayOptions(prev => ({
                                    ...prev,
                                    [section.key]: {
                                      ...prev[section.key],
                                      degreeLocationShow: e.target.checked,
                                      schoolRightSide: prev[section.key]?.schoolRightSide || "date",
                                      degreeLocationPosition: prev[section.key]?.degreeLocationPosition || "right",
                                      degreeGpaShow: prev[section.key]?.degreeGpaShow || false,
                                      schoolLocation: prev[section.key]?.schoolLocation || "",
                                      degreeLocation: prev[section.key]?.degreeLocation || "",
                                      gpa: prev[section.key]?.gpa || "",
                                    }
                                  }))}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={`location-show-${section.key}`} className="text-xs font-medium text-gray-700">
                                  Show location
                                </label>
                              </div>
                              {educationDisplayOptions[section.key]?.degreeLocationShow && (
                                <>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                      Location position
                                    </label>
                                    <select
                                      value={educationDisplayOptions[section.key]?.degreeLocationPosition || "right"}
                                      onChange={(e) => setEducationDisplayOptions(prev => ({
                                        ...prev,
                                        [section.key]: {
                                          ...prev[section.key],
                                          degreeLocationPosition: e.target.value as "left" | "right",
                                          schoolRightSide: prev[section.key]?.schoolRightSide || "date",
                                          degreeLocationShow: prev[section.key]?.degreeLocationShow ?? true,
                                          degreeGpaShow: prev[section.key]?.degreeGpaShow || false,
                                          schoolLocation: prev[section.key]?.schoolLocation || "",
                                          degreeLocation: prev[section.key]?.degreeLocation || "",
                                          gpa: prev[section.key]?.gpa || "",
                                        }
                                      }))}
                                      className="w-full px-2 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                      <option value="left">Left (after degree with |)</option>
                                      <option value="right">Right</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Where to place the location</p>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                      Enter location
                                    </label>
                                    <input
                                      type="text"
                                      value={educationDisplayOptions[section.key]?.degreeLocation || ""}
                                      onChange={(e) => setEducationDisplayOptions(prev => ({
                                        ...prev,
                                        [section.key]: {
                                          ...prev[section.key],
                                          degreeLocation: e.target.value,
                                          schoolRightSide: prev[section.key]?.schoolRightSide || "date",
                                          degreeLocationShow: prev[section.key]?.degreeLocationShow ?? true,
                                          degreeLocationPosition: prev[section.key]?.degreeLocationPosition || "right",
                                          degreeGpaShow: prev[section.key]?.degreeGpaShow || false,
                                          schoolLocation: prev[section.key]?.schoolLocation || "",
                                          gpa: prev[section.key]?.gpa || "",
                                        }
                                      }))}
                                      className="w-full px-2 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="e.g., New York, NY"
                                    />
                                  </div>
                                </>
                              )}
                            </div>

                            {/* GPA Options */}
                            <div className="space-y-2 pt-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`gpa-show-${section.key}`}
                                  checked={educationDisplayOptions[section.key]?.degreeGpaShow ?? false}
                                  onChange={(e) => setEducationDisplayOptions(prev => ({
                                    ...prev,
                                    [section.key]: {
                                      ...prev[section.key],
                                      degreeGpaShow: e.target.checked,
                                      schoolRightSide: prev[section.key]?.schoolRightSide || "date",
                                      degreeLocationShow: prev[section.key]?.degreeLocationShow ?? true,
                                      degreeLocationPosition: prev[section.key]?.degreeLocationPosition || "right",
                                      schoolLocation: prev[section.key]?.schoolLocation || "",
                                      degreeLocation: prev[section.key]?.degreeLocation || "",
                                      gpa: prev[section.key]?.gpa || "",
                                    }
                                  }))}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={`gpa-show-${section.key}`} className="text-xs font-medium text-gray-700">
                                  Show GPA
                                </label>
                              </div>
                              {educationDisplayOptions[section.key]?.degreeGpaShow && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Enter GPA
                                  </label>
                                  <input
                                    type="text"
                                    value={educationDisplayOptions[section.key]?.gpa || ""}
                                    onChange={(e) => {
                                      // Clean the input - remove "GPA:" prefix if user types it, and ensure valid format
                                      let cleanValue = e.target.value.trim();
                                      cleanValue = cleanValue.replace(/^GPA[:\s]*/i, '').trim();
                                      // Only allow digits and one decimal point
                                      cleanValue = cleanValue.replace(/[^\d.]/g, '');
                                      // Ensure only one decimal point
                                      const parts = cleanValue.split('.');
                                      if (parts.length > 2) {
                                        cleanValue = parts[0] + '.' + parts.slice(1).join('');
                                      }
                                      
                                      setEducationDisplayOptions(prev => ({
                                        ...prev,
                                        [section.key]: {
                                          ...prev[section.key],
                                          gpa: cleanValue,
                                          schoolRightSide: prev[section.key]?.schoolRightSide || "date",
                                          degreeLocationShow: prev[section.key]?.degreeLocationShow ?? true,
                                          degreeLocationPosition: prev[section.key]?.degreeLocationPosition || "right",
                                          degreeGpaShow: prev[section.key]?.degreeGpaShow ?? false,
                                          schoolLocation: prev[section.key]?.schoolLocation || "",
                                          degreeLocation: prev[section.key]?.degreeLocation || "",
                                        }
                                      }));
                                    }}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., 3.8"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">Enter your GPA value (e.g., 3.8, 4.0)</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSaveEducationDisplayOptions(section.key);
                              }}
                              className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setExpandedEducationSection(null);
                              }}
                              className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      {hasSubsections(section.type || '') && expandedSubsections === section.key && (
                        <div className="ml-4 mt-2 flex flex-col gap-2 border-l-2 border-gray-200 pl-3">
                          {(() => {
                            const editor = editorRef.current;
                            if (!editor || !section.type) return null;
                            
                            const sectionElement = editor.querySelector(
                              `section[data-section-key="${section.key}"]`
                            ) as HTMLElement | null;
                            
                            if (!sectionElement) return null;
                            
                            // Get subsections directly from DOM using h3 elements
                            const h3Elements = Array.from(sectionElement.querySelectorAll("h3")) as HTMLElement[];
                            const sectionType = sectionElement.getAttribute("data-section-type") || "";
                            const sectionHiddenSubsections = hiddenSubsections[section.key] || new Set<number>();
                            
                            return h3Elements.map((h3, index) => {
                              // Extract label (company name for experience, h3 content for others)
                              let label = `Item ${index + 1}`;
                              
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
                              
                              const subsectionId = index;
                              const isSubsectionHidden = sectionHiddenSubsections.has(subsectionId);
                              const isDraggingSub = draggingSubsection?.sectionKey === section.key && draggingSubsection?.subsectionId === subsectionId;
                              const isDropTargetSub = dropTargetSubsection?.sectionKey === section.key && dropTargetSubsection?.subsectionId === subsectionId;
                              
                              return (
                                <div
                                  key={subsectionId}
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.effectAllowed = "move";
                                    setDraggingSubsection({ sectionKey: section.key, subsectionId: subsectionId });
                                  }}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDropTargetSubsection({ sectionKey: section.key, subsectionId: subsectionId });
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (draggingSubsection && draggingSubsection.sectionKey === section.key) {
                                      reorderSubsections(section.key, draggingSubsection.subsectionId, subsectionId);
                                    }
                                    setDraggingSubsection(null);
                                    setDropTargetSubsection(null);
                                  }}
                                  onDragEnd={() => {
                                    setDraggingSubsection(null);
                                    setDropTargetSubsection(null);
                                  }}
                                  className={`group relative flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                                    isDraggingSub
                                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                                      : isDropTargetSub
                                      ? "border-blue-400 bg-blue-50/70"
                                      : isSubsectionHidden
                                      ? "border-gray-200 bg-gray-50 text-gray-400 opacity-70"
                                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/60 text-gray-700"
                                  }`}
                                >
                                  <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                                  <span className={`flex-1 truncate ${isSubsectionHidden ? 'line-through' : ''}`}>
                                    {label}
                                  </span>
                                  {onSectionRewrite && (
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        const content = extractSubsectionContent(sectionElement, subsectionId);
                                        if (content && onSectionRewrite) {
                                          onSectionRewrite(section.type!, content, subsectionId);
                                        }
                                      }}
                                      onMouseDown={(event) => event.stopPropagation()}
                                      onPointerDown={(event) => event.stopPropagation()}
                                      className="rounded-full p-1 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                      aria-label="Rewrite entry with AI"
                                      title="Rewrite entry with AI"
                                    >
                                      <Sparkles className="h-4 w-4" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      toggleSubsectionVisibility(section.key, subsectionId);
                                    }}
                                    onMouseDown={(event) => event.stopPropagation()}
                                    onPointerDown={(event) => event.stopPropagation()}
                                    className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                    aria-pressed={isSubsectionHidden}
                                    aria-label={isSubsectionHidden ? "Show entry" : "Hide entry"}
                                    title={isSubsectionHidden ? "Show entry" : "Hide entry"}
                                  >
                                    {isSubsectionHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleAddSection}
                    disabled={!availableSections.length}
                    className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      availableSections.length
                        ? "border border-blue-200 bg-white text-blue-600 hover:border-blue-300 hover:bg-blue-50"
                        : "border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                    aria-label="Add section"
                    title={
                      availableSections.length
                        ? "Add a new section to your resume"
                        : "All available sections are already included"
                    }
                  >
                    <Plus className="h-4 w-4" />
                    {availableSections.length ? "Add section" : "All sections added"}
                  </button>
                </div>
                <div
                  onDragOver={handleDragOver(null)}
                  onDrop={handleDrop(null)}
                  onDragEnd={handleDragEnd}
                  className="mt-1 flex h-6 items-center justify-center"
                >
                  <div
                    className={
                      dropTargetKey === null && draggingKey
                        ? "h-1 w-10 rounded-full bg-blue-500 transition-all duration-150"
                        : "h-1 w-8 rounded-full bg-gray-200"
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-6 text-center text-sm text-gray-500">
                <p>Sections will appear here once the resume loads.</p>
                <p>Use the button below to add the first one.</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {isAddSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-section-title"
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2 text-gray-800">
                <Plus className="h-4 w-4 text-blue-500" />
                <h3 id="add-section-title" className="text-sm font-semibold uppercase tracking-wide">
                  Add Section
                </h3>
              </div>
              <button
                type="button"
                onClick={closeAddSectionModal}
                className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close add section modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-5 py-4 text-sm text-gray-600">
              {availableSections.length ? (
                <div className="flex flex-col gap-2">
                  {availableSections.map(({ type, label }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSelectSection(type)}
                      className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left font-medium text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700"
                    >
                      <span>{label}</span>
                      <Plus className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
                  All sections from this template are already in your resume.
                </p>
              )}
            </div>
            <div className="flex justify-end border-t border-gray-100 px-5 py-3">
              <button
                type="button"
                onClick={closeAddSectionModal}
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SectionReorderSidebar;

