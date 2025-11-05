/**
 * Save edited content to localStorage with debouncing
 */
export const saveEditedContent = (
  content: string,
  resumeId: string | undefined,
  debounceTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>,
  onSaveStatusChange?: (status: 'saving' | 'saved' | 'error') => void
): void => {
  // Clear existing timeout
  if (debounceTimeoutRef.current) {
    clearTimeout(debounceTimeoutRef.current);
  }
  
  // Notify that saving is in progress
  if (onSaveStatusChange) {
    onSaveStatusChange('saving');
  }
  
  // Set new timeout to save content
  debounceTimeoutRef.current = setTimeout(() => {
    if (resumeId) {
      try {
        localStorage.setItem(`resume-edited-content-${resumeId}`, content);
        if (onSaveStatusChange) {
          onSaveStatusChange('saved');
        }
      } catch (error) {
        console.error('Failed to save edited content:', error);
        if (onSaveStatusChange) {
          onSaveStatusChange('error');
        }
      }
    }
  }, 1000); // 1 second delay
}

/**
 * Load edited content from localStorage
 */
export const loadEditedContent = (resumeId: string | undefined): string | null => {
  if (!resumeId) return null;
  
  try {
    return localStorage.getItem(`resume-edited-content-${resumeId}`);
  } catch (error) {
    console.error('Failed to load edited content:', error);
    return null;
  }
}

/**
 * Save edited content to localStorage immediately
 */
export const saveEditedContentImmediate = (content: string, resumeId: string | undefined): void => {
  if (resumeId) {
    try {
      localStorage.setItem(`resume-edited-content-${resumeId}`, content);
    } catch (error) {
      console.error('Failed to save edited content:', error);
    }
  }
}

/**
 * Clear edited content from localStorage
 */
export const clearEditedContent = (resumeId: string | undefined): void => {
  if (resumeId) {
    try {
      localStorage.removeItem(`resume-edited-content-${resumeId}`);
    } catch (error) {
      throw error;
    }
  }
}
