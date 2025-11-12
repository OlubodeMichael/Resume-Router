"use client";

import { Coins } from "lucide-react";
import { useAuth } from "@/hooks/authProvider";

interface CreditsDisplayProps {
  compact?: boolean;
  showLabel?: boolean;
}

export default function CreditsDisplay({ compact = false, showLabel = true }: CreditsDisplayProps) {
  const { user } = useAuth();
  const credits = user?.credits ?? 0;

  const handleUpgradeClick = () => {
    if (typeof window !== 'undefined') {
      window.location.hash = '#pricing';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
        <Coins className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-semibold text-blue-700">{credits.toLocaleString()}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
      <Coins className="w-4 h-4 text-blue-600 flex-shrink-0" />
      <div className="flex flex-col min-w-0">
        {showLabel && (
          <span className="text-xs text-blue-600 font-medium">Credits</span>
        )}
        <span className="text-sm font-semibold text-blue-700">{credits.toLocaleString()}</span>
      </div>
      {credits === 0 && (
        <button
          onClick={handleUpgradeClick}
          className="ml-auto text-xs font-medium text-blue-600 hover:text-blue-700 underline"
        >
          Get Credits
        </button>
      )}
    </div>
  );
}

