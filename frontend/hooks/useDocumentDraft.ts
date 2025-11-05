"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { getOrFetchResume } from "@/lib/loaders";
import { saveLocal } from "@/lib/resumeStorage";
import { debounce } from "@/lib/debounce";
import { setAtPath } from "@/lib/path";
import { sanitizeHtml } from "@/lib/sanitize";
import { isPlainTextPath } from "@/lib/fieldConfig";
import type { ResumeDraftEnvelope } from "@/types/content";

type Opts = {
  docId: string;
  fetchFromServer: () => Promise<Record<string, unknown>>;
  saveToServer: (p: { id: string; content: Record<string, unknown>; lastEditedAt: number }) => Promise<void>;
};

export function useDocumentDraft({ docId, fetchFromServer, saveToServer }: Opts) {
  const [env, setEnv] = useState<ResumeDraftEnvelope | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const e = await getOrFetchResume(docId, fetchFromServer);
        if (mounted) {
          setEnv(e);
          setHasUnsavedChanges(false);
        }
      } catch (error) {
        console.error('Failed to load resume:', error);
        if (mounted) {
          setEnv(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, [docId, fetchFromServer]);

  const debouncedRemoteSave = useMemo(
    () => debounce(async (e: ResumeDraftEnvelope) => {
      try {
        setIsSaving(true);
        await saveToServer({ 
          id: e.resumeId, 
          content: e.content, 
          lastEditedAt: e.lastEditedAt 
        }); // JSON to DB
        const updated: ResumeDraftEnvelope = { 
          ...e, 
          lastSyncedAt: Date.now() 
        };
        setEnv(updated);
        saveLocal(updated);
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Failed to sync to server:', error);
        // Retry on next edit
      } finally {
        setIsSaving(false);
      }
    }, 1500),
    [saveToServer]
  );

  const updateAtPath = useCallback((path: string, editedHtml: string) => {
    if (!env) return;
    
    // Extract value based on path type
    const value = isPlainTextPath(path)
      ? new DOMParser().parseFromString(editedHtml, "text/html").documentElement.textContent ?? ""
      : sanitizeHtml(editedHtml);

    const next: ResumeDraftEnvelope = {
      ...env,
      content: setAtPath(env.content, path, value),
      lastEditedAt: Date.now(),
      source: "local",
    };

    setEnv(next);
    saveLocal(next);       // save to localStorage first
    setHasUnsavedChanges(true);
    debouncedRemoteSave(next); // debounce DB sync (JSON)
  }, [env, debouncedRemoteSave]);

  const saveManually = useCallback(async () => {
    if (!env || isSaving) return;
    
    try {
      setIsSaving(true);
      await saveToServer({ 
        id: env.resumeId, 
        content: env.content, 
        lastEditedAt: env.lastEditedAt 
      });
      const updated: ResumeDraftEnvelope = { 
        ...env, 
        lastSyncedAt: Date.now() 
      };
      setEnv(updated);
      saveLocal(updated);
      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('Failed to save to server:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [env, saveToServer, isSaving]);

  return { 
    envelope: env, 
    content: env?.content, 
    updateAtPath,
    saveManually,
    isLoading,
    isSaving,
    hasUnsavedChanges,
  };
}

