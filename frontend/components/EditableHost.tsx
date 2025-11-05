"use client";
import { useCallback, useRef } from "react";

export default function EditableHost({
  children,
  onPathEdit,
}: {
  children: React.ReactNode;
  onPathEdit: (path: string, html: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  const handleInput = useCallback((e: React.FormEvent) => {
    let el = e.target as HTMLElement | null;
    while (el && el !== rootRef.current && !el.dataset.path) {
      el = el.parentElement;
    }
    const path = el?.dataset.path;
    if (!path) return;
    onPathEdit(path, el!.innerHTML);
  }, [onPathEdit]);

  return (
    <div ref={rootRef} onInput={handleInput}>
      {children}
    </div>
  );
}

