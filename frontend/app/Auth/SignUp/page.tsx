"use client";

import React from "react";
import GoogleButton from "react-google-button";
import { signIn } from "next-auth/react";

export default function SignUp() {
    const handleGoogleSignUp = async () => {
        try {
            await signIn("google", { callbackUrl: "/" });
        } catch (error) {
            console.error("Sign up error:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">Sign Up</h1>
                <GoogleButton 
                    onClick={handleGoogleSignUp}
                    className="w-full"
                />
            </div>
        </div>
    );
} 