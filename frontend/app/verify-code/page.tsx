"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/context/authProvider";
import { useRouter, useSearchParams } from "next/navigation";

interface VerifyResetCodeResponse {
  message: string;
  resetToken: string;
}

function VerifyForm() {
  const { verifyResetCode, forgotPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Clear error and success when user starts typing
    if (formError) setFormError(null);
    if (successMessage) setSuccessMessage(null);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const codeString = code.join("");

    // Validation
    if (codeString.length !== 6) {
      setFormError("Please enter the complete 6-digit code");
      return;
    }
    if (!email) {
      setFormError("No email provided. Please start the reset process again.");
      return;
    }

    try {
      setIsLoading(true);
      setFormError(null);
      setSuccessMessage(null);

      const response = await verifyResetCode(email, codeString) as VerifyResetCodeResponse;

      setSuccessMessage(response.message);
      // Navigate to reset-password with resetToken
      setTimeout(() => {
        router.push(`/reset-password?resetToken=${encodeURIComponent(response.resetToken)}`);
      }, 1000);
    } catch (error) {
      console.error("Verification error:", error);
      setFormError((error as Error).message || "Invalid code. Please try again or resend the code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsResending(true);
      setFormError(null);
      setSuccessMessage(null);
      setCode(["", "", "", "", "", ""]); // Clear code on resend

      // Call forgotPassword to resend the code
      const response = await forgotPassword(email!) as { message: string };

      setSuccessMessage(response.message);
      inputRefs.current[0]?.focus(); // Refocus first input
    } catch (error) {
      console.error("Resend error:", error);
      setFormError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
        <p>
          Error: No email provided. <Link href="/auth/forgot-password" className="text-blue-800 underline">Go back</Link>
        </p>
      </div>
    );
  }

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

        {/* Verification Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif font-medium text-slate-900 mb-2">Verify your email</h2>
            <p className="text-slate-600 text-sm font-sans">
              We&apos;ve sent a 6-digit code to <span className="font-medium">{email}</span>
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

          {/* Code Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 font-sans">Enter 6-digit code</label>
              <div className="flex justify-center space-x-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border text-gray-700 border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition font-sans"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || code.join("").length !== 6}
              className="w-full bg-blue-800 text-white py-3 px-4 rounded-xl font-medium shadow-md hover:bg-blue-900 transition text-sm font-sans disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: "0 2px 16px 0 rgba(60, 120, 255, 0.10)" }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify Code"
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 font-sans mb-2">Didn’t receive the code?</p>
            <button
              onClick={handleResendCode}
              disabled={isResending}
              className="text-sm text-blue-800 hover:text-blue-900 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? "Sending..." : "Resend code"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500 font-sans">
            By verifying your email, you agree to our{" "}
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

export default function Verify() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}