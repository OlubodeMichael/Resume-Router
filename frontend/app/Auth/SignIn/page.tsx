"use client";

import React from "react";
import GoogleButton from "react-google-button";
import { signIn } from "next-auth/react";

export default function SignIn() {
    const handleGoogleSignIn = async () => {
        try {
            await signIn("google", { callbackUrl: "/" });
        } catch (error) {
            console.error("Sign in error:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
            <SignInForm />
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">Sign In</h1>
                <GoogleButton 
                    onClick={handleGoogleSignIn}
                    className="w-full"
                />
            </div>
        </div>
    );
} 

function SignInForm() {
    return (
        <form>
            <div>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" />
            </div>
            <button type="submit">Sign In</button>
        </form>
    )
}