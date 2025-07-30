"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useAuth } from "@/context/authProvider";
import { useRouter, useSearchParams } from "next/navigation";

interface ResetPasswordResponse {
  message: string;
}

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("resetToken");

  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!resetToken) {
      setFormError("No reset token provided. Please start the reset process again.");
      setTimeout(() => router.push("/forgot-password"), 2000);
    }
  }, [resetToken, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "newPassword") setNewPassword(value);
    if (name === "confirmPassword") setConfirmPassword(value);
    if (formError) setFormError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!newPassword || !confirmPassword) {
      setFormError("Both password fields are required");
      return;
    }
    if (newPassword.length < 8) {
      setFormError("Password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }
    if (!resetToken) {
      setFormError("Invalid reset token");
      return;
    }

    try {
      setIsLoading(true);
      setFormError(null);
      setSuccessMessage(null);

      const response = await resetPassword(resetToken, newPassword) as ResetPasswordResponse;

      setSuccessMessage(response.message);
      // Redirect to sign-in after success
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      setFormError((error as Error).message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!resetToken) {
    return <p>Redirecting to forgot password...</p>;
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

        {/* Reset Password Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif font-medium text-slate-900 mb-2">Reset your password</h2>
            <p className="text-slate-600 text-sm font-sans">
              Create a new password for your account.
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

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1.5 font-sans">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 text-slate-800 rounded-xl shadow-sm placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 transition font-sans"
                  placeholder="Enter new password"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5 font-sans">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 text-slate-800 rounded-xl shadow-sm placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 transition font-sans"
                  placeholder="Confirm new password"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
              className="w-full bg-blue-800 text-white py-3 px-4 rounded-xl font-medium shadow-md hover:bg-blue-900 transition text-sm font-sans disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: "0 2px 16px 0 rgba(60, 120, 255, 0.10)" }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Resetting...</span>
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500 font-sans">
            By resetting your password, you agree to our{" "}
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