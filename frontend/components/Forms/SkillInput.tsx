"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { X, Plus, Check, Loader2 } from "lucide-react";

interface SkillInputItem {
  id: string;
  value: string;
  status: 'pending' | 'saving' | 'saved' | 'error';
}

interface SkillInputProps {
  onSave: (skills: string[]) => Promise<void>;
  existingItems?: string[];
  placeholder?: string;
  label?: string;
  description?: string;
  maxItems?: number;
  className?: string;
}

export default function SkillInput({
  onSave,
  existingItems = [],
  placeholder = "Type a skill and press Enter (e.g., React, Python, Project Management)",
  label = "Add Skills",
  description = "Type a skill and press Enter or comma to add it to the list. Click 'Done' to save all skills.",
  maxItems = 50,
  className = ""
}: SkillInputProps) {
  const [items, setItems] = useState<SkillInputItem[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Save function
  const saveItems = useCallback(async (itemsToSave: string[]) => {
    if (itemsToSave.length === 0) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      await onSave(itemsToSave);
      
      // Mark items as saved
      setItems(prev => prev.map(item => ({
        ...item,
        status: 'saved' as const
      })));
      
      // Clear saved items after a delay
      setTimeout(() => {
        setItems(prev => prev.filter(item => item.status !== 'saved'));
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save items");
      
      // Mark items as error
      setItems(prev => prev.map(item => ({
        ...item,
        status: 'error' as const
      })));
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addItem();
    } else if (e.key === 'Backspace' && currentInput === '' && items.length > 0) {
      // Remove last item if input is empty and backspace is pressed
      removeItem(items[items.length - 1].id);
    }
  };

  const addItem = () => {
    const trimmedItem = currentInput.trim();
    if (!trimmedItem) return;
    
    // Check for duplicates
    const isDuplicate = items.some(item => 
      item.value.toLowerCase() === trimmedItem.toLowerCase()
    ) || existingItems.some(item => 
      item.toLowerCase() === trimmedItem.toLowerCase()
    );
    
    if (isDuplicate) {
      setError("This item already exists");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Check max items limit
    if (items.length >= maxItems) {
      setError(`Maximum ${maxItems} items allowed`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    const newItem: SkillInputItem = {
      id: Date.now().toString(),
      value: trimmedItem,
      status: 'pending'
    };
    
    setItems(prev => [...prev, newItem]);
    setCurrentInput("");
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const getStatusIcon = (status: SkillInputItem['status']) => {
    switch (status) {
      case 'saving':
        return <Loader2 className="w-3 h-3 animate-spin text-blue-500" />;
      case 'saved':
        return <Check className="w-3 h-3 text-green-500" />;
      case 'error':
        return <X className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: SkillInputItem['status']) => {
    switch (status) {
      case 'saving':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'saved':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {/* Input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full px-4 py-3 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white"
          placeholder={placeholder}
          value={currentInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
        />
        <button
          type="button"
          onClick={addItem}
          disabled={!currentInput.trim() || isSaving}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      {/* Items display */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Items in list ({items.length})
            </h4>
          </div>
          
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${getStatusColor(item.status)}`}
              >
                <span>{item.value}</span>
                {getStatusIcon(item.status)}
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-1 p-0.5 hover:bg-gray-200 rounded-full transition-colors"
                  disabled={item.status === 'saving'}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={async () => {
            const pendingItems = items.filter(item => item.status === 'pending');
            if (pendingItems.length > 0) {
              await saveItems(pendingItems.map(item => item.value));
            }
          }}
          className="flex-1 px-4 py-3 text-sm font-medium border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
        >
          Done
        </button>
      </div>
    </div>
  );
}
