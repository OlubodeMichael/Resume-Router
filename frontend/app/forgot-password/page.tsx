"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        // Clear error when user starts typing
        if (formError) setFormError("");
        if (successMessage) setSuccessMessage("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!email) {
            setFormError("Please enter your email address");
            return;
        }

        if (!email.includes("@")) {
            setFormError("Please enter a valid email address");
            return;
        }

        try {
            setIsLoading(true);
            setFormError("");
            
            // TODO: Implement forgot password API call
            // const response = await fetch('/api/auth/forgot-password', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email })
            // });
            
            // Simulate API call for now
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setSuccessMessage("If an account with that email exists, we've sent you a password reset link.");
        } catch (error) {
            console.error("Forgot password error:", error);
            setFormError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Visual/Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 flex flex-col justify-center px-12 py-16">
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                            <span className="text-white font-bold text-2xl">R</span>
                        </div>
                        <h1 className="text-5xl font-medium text-white mb-4 leading-tight font-serif">
                            Reset Your
                            <br />
                            <span className="text-blue-200">Password</span>
                        </h1>
                        <p className="text-xl text-blue-100 leading-relaxed max-w-md font-sans">
                            Don&apos;t worry, we&apos;ll help you get back to building your professional future.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-blue-100">Secure password reset process</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-blue-100">Quick and easy recovery</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-blue-100">Back to your resume building</span>
                        </div>
                    </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-400/20 rounded-full blur-lg"></div>
            </div>

            {/* Right Side - Forgot Password Form */}
            <div className="flex-1 flex items-center justify-center px-4 py-8 bg-gray-50">
                <div className="w-full max-w-sm">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="inline-flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl">R</span>
                            </div>
                            <span className="text-2xl font-bold text-slate-900">ResumeRouter</span>
                        </Link>
                    </div>

                    {/* Back to Sign In Link */}
                    <div className="mb-6">
                        <Link
                            href="/signin"
                            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to sign in
                        </Link>
                    </div>

                    {/* Forgot Password Form Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-serif font-medium text-slate-900 mb-2">Forgot your password?</h2>
                            <p className="text-slate-600 text-sm font-sans">Enter your email address and we&apos;ll send you a code to reset your password.</p>
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
                                <Link
                                    href="/signup"
                                    className="font-medium text-blue-800 hover:text-blue-900 underline"
                                >
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
        </div>
    );
}