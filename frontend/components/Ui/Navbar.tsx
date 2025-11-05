"use client";
import { useState } from "react";

import Link from "next/link";
import Logo from "@/components/logo";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
  
    return (
      <>
        <nav className="sticky top-0 z-50 w-full bg-white py-2 opacity-98 backdrop-blur-sm smooth-scroll">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
            <Link className="flex justify-center items-center space-x-2" href="/" >
              <Logo />
            </Link>
            </div>
            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/pricing" className="text-gray-700 hover:text-black font-medium">Pricing</Link>
              <Link href="/#features" className="text-gray-700 hover:text-black font-medium">Features</Link>
              <Link href="/#how-it-works" className="text-gray-700 hover:text-black font-medium">How It Works</Link>
              <Link href="/#faq" className="text-gray-700 hover:text-black font-medium">FAQ</Link>
            </div>
            {/* Join Waitlist Button */}
            <div className="hidden md:block">
              <a
                href="/signin"
                className="bg-blue-800 text-white px-5 py-2 rounded-lg font-medium shadow hover:bg-blue-900 transition"
              >
                Login
              </a>
            </div>
            {/* Hamburger Icon */}
            <button
              className="md:hidden flex items-center z-50 relative"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-7 h-7 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
  
        {/* Mobile Menu Dropdown */}
        <div className={`fixed top-[72px] left-0 right-0 bg-white shadow-xl z-[60] md:hidden border-t border-gray-100 transform transition-all duration-300 ease-in-out ${
          menuOpen 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}>
          <div className="px-4 py-2">
            <Link 
              href="/pricing" 
              className="block py-3 text-gray-700 hover:text-black font-medium border-b border-gray-100 transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/#features" 
              className="block py-3 text-gray-700 hover:text-black font-medium border-b border-gray-100 transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/#how-it-works" 
              className="block py-3 text-gray-700 hover:text-black font-medium border-b border-gray-100 transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              href="/#faq" 
              className="block py-3 text-gray-700 hover:text-black font-medium border-b border-gray-100 transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link
              href="/signin"
              className="block mt-4 bg-blue-800 text-white px-5 py-3 rounded-lg font-semibold shadow hover:bg-blue-900 transition-all duration-200 text-center"
              onClick={() => setMenuOpen(false)}
            >
              Get Started Free+
            </Link>
          </div>
        </div>
      </>
    );
  }