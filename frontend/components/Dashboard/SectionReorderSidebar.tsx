"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GripVertical, Settings } from "lucide-react";

type SectionItem = {
  key: string;
  title: string;
};

interface SectionReorderSidebarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onReorder?: (html: string) => void;
}

const generateSectionKey = (() => {
  const FALLBACK_PREFIX = "section-key";
  return () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `${FALLBACK_PREFIX}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };
})();

export function SectionReorderSidebar({ editorRef, onReorder }: SectionReorderSidebarProps) {
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dropTargetKey, setDropTargetKey] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(true);
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

      return { key, title };
    });

    setSections((prev) => {
      if (
        prev.length === nextSections.length &&
        prev.every((item, idx) => {
          const next = nextSections[idx];
          return next && item.key === next.key && item.title === next.title;
        })
      ) {
        return prev;
      }
      return nextSections;
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
        onReorder(htmlSnapshot);
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

  const hasSections = sections.length > 0;

  return (
    <aside className="hidden lg:flex lg:w-72 xl:w-80 flex-col gap-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600"
        aria-expanded={isOpen}
        aria-controls="resume-section-sidebar"
      >
        <span className="flex items-center gap-3">
          <Settings className="h-4 w-4 text-gray-500 transition-colors group-hover:text-blue-500" />
          <span>Sections</span>
        </span>
        <span className="text-xs font-medium text-gray-500">
          {isOpen ? "Hide" : "Show"}
        </span>
      </button>

      {isOpen ? (
        <>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900">Sections</h3>
            <p className="mt-1 text-sm text-gray-500">
              Drag a section to rearrange the layout. Changes apply instantly.
            </p>
          </div>
          <div
            id="resume-section-sidebar"
            className="rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-2 p-4">
              {hasSections ? (
                <>
                  {sections.map((section) => {
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
                            : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/60"
                        }`}
                      >
                        <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                        <span className="truncate">{section.title}</span>
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
                </>
              ) : (
                <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-sm text-gray-500">
                  Sections will appear here once the resume loads.
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500 shadow-sm">
          Sidebar hidden. Click the Sections button to show it again.
        </div>
      )}
    </aside>
  );
}

export default SectionReorderSidebar;

