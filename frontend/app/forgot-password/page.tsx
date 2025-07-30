"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useAuth } from "@/context/authProvider";
import { useRouter, useSearchParams } from "next/navigation";

interface ForgotPasswordResponse {
  message: string;
}

function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get("email");

  // Prefill email from sign-in page if provided
  useEffect(() => {
    if (prefilledEmail) {
      setEmail(decodeURIComponent(prefilledEmail));
    }
  }, [prefilledEmail]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error and success when user starts typing
    if (formError) setFormError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || typeof email !== "string") {
      setFormError("Please enter your email address");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFormError("Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);
      setFormError(null);
      setSuccessMessage(null);

      const response = await forgotPassword(email) as ForgotPasswordResponse;

      setSuccessMessage(response.message);
      // Do not clear email here; pass it to the next step

      // Navigate to verify-code page with email after a short delay
      setTimeout(() => {
        router.push(`/verify-code?email=${encodeURIComponent(email)}`);
      }, 2000); // 2-second delay for user to see success message
    } catch (error) {
      console.error("Forgot password error:", error);
      setFormError((error as Error).message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">RR</span>
            </div>
            <span className="text-2xl font-medium text-slate-900 font-sans">ResumeRouter</span>
          </Link>
        </div>

        {/* Forgot Password Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif font-medium text-slate-900 mb-2">Forgot your password?</h2>
            <p className="text-slate-600 text-sm font-sans">
              Enter your email address and we&apos;ll send you a code to reset your password.
            </p>
          </div>

          {/* Error Message */}
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{formError}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5 font-sans">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 text-slate-800 rounded-xl shadow-sm placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 transition font-sans"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-800 text-white py-3 px-4 rounded-xl font-medium shadow-md hover:bg-blue-900 transition text-sm font-sans disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: "0 2px 16px 0 rgba(60, 120, 255, 0.10)" }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending reset code...</span>
                </div>
              ) : (
                "Send reset code"
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 font-sans">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-blue-800 hover:text-blue-900 underline">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500 font-sans">
            By requesting a password reset, you agree to our{" "}
            <Link href="/terms" className="text-blue-800 hover:text-blue-900 underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-800 hover:text-blue-900 underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}