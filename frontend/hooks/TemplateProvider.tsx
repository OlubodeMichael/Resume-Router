'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

type TemplateContextType = {
  selectedId: string;
  savedId: string;
  loading: boolean;
  saving: boolean;
  dirty: boolean;
  // set local selection without hitting backend
  setSelectedTemplate: (templateId: string) => void;
  // persist to backend now
  saveSelectedTemplate: () => Promise<{ ok: boolean; status?: number }>;
  // ensure saved before exporting; returns selected id if ok
  ensurePersistedForExport: () => Promise<{ ok: boolean; id?: string }>;
 
};

// You can pass resumeId & profileKey via props to scope storage & API calls.
const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

type ProviderProps = {
  children: React.ReactNode;
  resumeId: string;      // which resume is being edited
  profileKey: string;    // stable user key (e.g., user.id)
};

export const TemplateProvider: React.FC<ProviderProps> = ({ children, resumeId, profileKey }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // localStorage key is per-user + per-resume to avoid collisions
  const LS_KEY = useMemo(
    () => `rr:selectedTemplateId:${profileKey}:${resumeId}`,
    [profileKey, resumeId]
  );

  const [selectedId, setSelectedId] = useState<string>(''); // local pick
  const [savedId, setSavedId] = useState<string>('');       // backend value
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const dirty = selectedId !== savedId;

  // Initial sync: try backend once; if none, restore from localStorage
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const r = await fetch(
          `${API_URL}/v1/resumes/${encodeURIComponent(resumeId)}/template`,
          { credentials: 'include', cache: 'no-store', signal: controller.signal }
        );
        if (!r.ok) throw new Error(`GET template ${r.status}`);
        const data = (await r.json()) as { templateId?: string | null };
        if (cancelled) return;
        const backendId = data.templateId ?? '';
        setSavedId(backendId);
        if (backendId) {
          setSelectedId(backendId);
          try { localStorage.setItem(LS_KEY, backendId); } catch {}
        } else {
          // no saved on backend → use last local
          try {
            const ls = localStorage.getItem(LS_KEY) || '';
            setSelectedId(ls);
          } catch {
            setSelectedId('');
          }
        }
      } catch {
        // backend unreachable/unauth → fall back to local
        try {
          const ls = localStorage.getItem(LS_KEY) || '';
          setSelectedId(ls);
        } catch {
          setSelectedId('');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [API_URL, LS_KEY, resumeId]);

  // Local-only selection (no backend call)
  const setSelectedTemplate = (templateId: string) => {
    setSelectedId(templateId);
    try { localStorage.setItem(LS_KEY, templateId); } catch {}
  };

  // Persist to backend
  const saveSelectedTemplate = async () => {
    if (!selectedId || selectedId === savedId) return { ok: true as const };
    setSaving(true);
    try {
      const r = await fetch(
        `${API_URL}/v1/resumes/${encodeURIComponent(resumeId)}/template`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ templateId: selectedId }),
        }
      );
      if (!r.ok) return { ok: false as const, status: r.status };
      const data = (await r.json()) as { templateId?: string | null };
      const newId = data.templateId ?? selectedId;
      setSavedId(newId);
      try { localStorage.setItem(LS_KEY, newId); } catch {}
      return { ok: true as const };
    } catch {
      return { ok: false as const };
    } finally {
      setSaving(false);
    }
  };

  // Ensure persisted before export (use in your export buttons)
  const ensurePersistedForExport = async () => {
    if (!selectedId) return { ok: false as const };
    if (dirty) {
      const res = await saveSelectedTemplate();
      if (!res.ok) return { ok: false as const };
    }
    return { ok: true as const, id: selectedId };
  };



  // Optional: save on tab close if there are unsaved changes
  const installed = useRef(false);
  useEffect(() => {
    if (installed.current) return;
    installed.current = true;
    const flush = () => {
      if (!selectedId || selectedId === savedId) return;
      const data = JSON.stringify({ templateId: selectedId });
      try {
        navigator.sendBeacon?.(
          `${API_URL}/v1/resumes/${encodeURIComponent(resumeId)}/template`,
          new Blob([data], { type: 'application/json' })
        );
      } catch {}
    };
    const onHide = () => document.visibilityState === 'hidden' && flush();
    window.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    return () => {
      window.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
    };
  }, [API_URL, resumeId, savedId, selectedId]);

  const value: TemplateContextType = {
    selectedId,
    savedId,
    loading,
    saving,
    dirty,
    setSelectedTemplate,
    saveSelectedTemplate,
    ensurePersistedForExport,
    
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplate = () => {
  const ctx = useContext(TemplateContext);
  if (!ctx) throw new Error('useTemplate must be used within a TemplateProvider');
  return ctx;
};
