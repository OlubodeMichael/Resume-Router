"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            await signIn("google", { callbackUrl: "/dashboard" });
        } catch (error) {
            console.error("Sign in error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        // Handle email/password sign in logic here
        console.log("Email sign in");
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
                            Welcome Back to
                            <br />
                            <span className="text-blue-200">Your Future</span>
                        </h1>
                        <p className="text-xl text-blue-100 leading-relaxed max-w-md font-sans">
                            Continue building your professional journey with AI-powered resume optimization.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-blue-100">Pick up where you left off</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-blue-100">Access your saved resumes</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-blue-100">Continue optimizing</span>
                        </div>
                    </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-400/20 rounded-full blur-lg"></div>
            </div>

            {/* Right Side - Sign In Form */}
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

                    {/* Sign In Form Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-serif font-medium text-slate-900 mb-2">Welcome back</h2>
                            <p className="text-slate-600 text-sm font-sans">Sign in to your account to continue</p>
                        </div>

                        {/* Google Sign In */}
                        <div className="mb-4">
                            <button
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center space-x-3 bg-white text-slate-700 border border-slate-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 py-3 px-4 font-medium text-sm font-sans"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span>Continue with Google</span>
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-white text-slate-500 font-medium text-xs">or continue with email</span>
                            </div>
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleEmailSignIn} className="space-y-4">
                            <div className="space-y-3">
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
                                            required
                                            className="w-full pl-10 pr-3 py-3 border border-slate-300 text-slate-800 rounded-xl shadow-sm placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 transition font-sans"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5 font-sans">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            required
                                            className="w-full pl-10 pr-10 py-3 border border-slate-300 text-slate-800 rounded-xl shadow-sm placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 transition font-sans"
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-800 focus:ring-blue-900 border-slate-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 font-sans">
                                        Remember me
                                    </label>
                                </div>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-sm text-blue-800 hover:text-blue-900 font-medium underline font-sans"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-800 text-white py-3 px-4 rounded-xl font-medium shadow-md hover:bg-blue-900 transition text-sm font-sans"
                                style={{ boxShadow: "0 2px 16px 0 rgba(60, 120, 255, 0.10)" }}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    "Sign in"
                                )}
                            </button>
                        </form>

                        {/* Sign Up Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-600 font-sans">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/auth/signup"
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
                            By signing in, you agree to our{" "}
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