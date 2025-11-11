"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GripVertical, Settings, Eye, EyeOff, X, Plus, Trash2 } from "lucide-react";

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
}: SectionReorderSidebarProps) {
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dropTargetKey, setDropTargetKey] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hiddenSections, setHiddenSections] = useState<Record<string, boolean>>({});
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState<boolean>(false);
  const sectionKeyMapRef = useRef<WeakMap<Element, string>>(new WeakMap());

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

      const heading = node.querySelector("h2");
      const title = heading?.textContent?.trim() || `Section ${index + 1}`;
      const type = node.getAttribute("data-section-type") || undefined;

      return { key, title, type };
    });

    setSections((prev) => {
      if (
        prev.length === nextSections.length &&
        prev.every((item, idx) => {
          const next = nextSections[idx];
          return next && item.key === next.key && item.title === next.title && item.type === next.type;
        })
      ) {
        return prev;
      }
      return nextSections;
    });

    setHiddenSections((prev) => {
      const next: Record<string, boolean> = { ...prev };
      let changed = false;
      const validKeys = new Set(nextSections.map((section) => section.key));

      nextSections.forEach((section) => {
        if (!(section.key in next)) {
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

      const fragment = document.createDocumentFragment();

      orderedSections.forEach((sectionItem, orderIndex) => {
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

        const working = [...prev];
        const sourceIndex = working.findIndex((item) => item.key === sourceKey);
        if (sourceIndex === -1) return prev;

        const [moved] = working.splice(sourceIndex, 1);
        let insertIndex =
          targetKey === null ? working.length : working.findIndex((item) => item.key === targetKey);
        if (insertIndex < 0) {
          insertIndex = working.length;
        }

        working.splice(insertIndex, 0, moved);
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

  const toggleSectionVisibility = useCallback((sectionKey: string) => {
    setHiddenSections((prev) => ({
      ...prev,
      [sectionKey]: !(prev[sectionKey] ?? false),
    }));
  }, []);

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

    sections.forEach(({ key }) => {
      const node = editor.querySelector<HTMLElement>(`[data-section-key="${key}"]`);
      if (!node) return;
      const hidden = hiddenSections[key] ?? false;
      if (hidden) {
        node.style.display = "none";
        node.setAttribute("data-section-hidden", "true");
      } else {
        node.style.display = "";
        node.setAttribute("data-section-hidden", "false");
      }
    });

    if (onReorder) {
      const htmlSnapshot = editor.innerHTML;
      requestAnimationFrame(() => onReorder(htmlSnapshot));
    }
  }, [hiddenSections, sections, editorRef, onReorder]);

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

  return (
    <>
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
                  const isHidden = hiddenSections[section.key] ?? false;
                  const isDragging = draggingKey === section.key;
                  const isDropTarget = dropTargetKey === section.key;
                  return (
                    <div
                      key={section.key}
                      draggable
                      onDragStart={handleDragStart(section.key)}
                      onDragOver={handleDragOver(section.key)}
                      onDrop={handleDrop(section.key)}
                      onDragEnd={handleDragEnd}
                      className={`group relative flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                        isDragging
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                          : isDropTarget
                          ? "border-blue-400 bg-blue-50/70"
                          : isHidden
                          ? "border-gray-200 bg-gray-50 text-gray-400 opacity-70"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/60 text-gray-700"
                      }`}
                    >
                      <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                      <span className="flex-1 truncate">{section.title}</span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleSectionVisibility(section.key);
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
                    </div>
                  );
                })}
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
          <div className="border-t border-gray-100 px-5 py-4">
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
    </>
  );
}

export default SectionReorderSidebar;

