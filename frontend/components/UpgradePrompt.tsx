"use client";

import { useState } from "react";
import { Crown, Zap, X, Star } from "lucide-react";
import { useCheckout } from "@/hooks/CheckoutProvider";

interface UpgradePromptProps {
  onClose: () => void;
  show: boolean;
}

export default function UpgradePrompt({ onClose, show }: UpgradePromptProps) {
  const { startCheckout, loading } = useCheckout();
  const [selectedPlan, setSelectedPlan] = useState<'credits' | 'pass3'>('credits');

  if (!show) return null;

  const handleUpgrade = async () => {
    try {
      await startCheckout(selectedPlan);
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Upgrade Required</h2>
              <p className="text-sm text-gray-600">Choose a plan to continue creating resumes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              You&apos;re out of credits!
            </h3>
            <p className="text-gray-600">
              Choose a plan below to continue creating professional resumes tailored to any job.
            </p>
          </div>

          {/* Plan Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Credits Plan */}
            <div
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPlan === 'credits'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPlan('credits')}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Credits</h4>
                  <p className="text-sm text-gray-600">Pay as you go</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900">$15</div>
                <div className="text-sm text-gray-600">→ 1,000 credits</div>
                <div className="text-xs text-blue-600 font-medium mt-1">≈ 100 resumes</div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 10 credits per resume</li>
                <li>• Credits last 6 months</li>
                <li>• All templates included</li>
              </ul>
            </div>

            {/* Pass Plan */}
            <div
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPlan === 'pass3'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPlan('pass3')}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">3-Month Pass</h4>
                  <p className="text-sm text-gray-600">Unlimited access</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900">$39</div>
                <div className="text-sm text-gray-600">/ 3 months</div>
                <div className="text-xs text-purple-600 font-medium mt-1">Unlimited resumes</div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Unlimited resumes</li>
                <li>• All templates included</li>
                <li>• Priority support</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Get ${selectedPlan === 'credits' ? 'Credits' : '3-Month Pass'}`}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Secure payment</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span>Instant access</span>
              </div>
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-purple-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
