"use client";
import { useState, useEffect } from "react";

import {
  DoorOpen,
  Plus,
  FileText,
  LayoutTemplate,
  Settings,
  User,
  LogOut,
  X,
  Banknote,
} from "lucide-react";
import { useAuth } from "@/hooks/authProvider";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Setting from "@/components/Setting/Setting";
import Subscription from "@/components/Subscription/subscription";
import CreditsDisplay from "@/components/Dashboard/CreditsDisplay";

const navItems = [
  { icon: Plus, label: "New", href: "/dashboard/" },
  { icon: FileText, label: "Documents", href: "/dashboard/documents" },
  { icon: LayoutTemplate, label: "Templates", href: "/dashboard/templates" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];


const handleBillingClick = () => {
  if (typeof window !== 'undefined') {
    window.location.hash = '#pricing'
  }
};

function useHash() {
  const [hash, setHash] = useState<string>(typeof window !== 'undefined' ? window.location.hash : '')
  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    // pick up initial server->client transition
    setHash(window.location.hash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return { hash, setHash }
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Subscription
  const { hash, setHash } = useHash()
  const [showPricing, setShowPricing] = useState(false)

  // Update showPricing when hash changes (client-side only)
  useEffect(() => {
    setShowPricing(hash === '#pricing')
  }, [hash])

  const closePricing = () => {
    // remove the hash from the URL and update state
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname)
      setHash('')
    }
  }

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.matchMedia('(max-width: 768px)').matches);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  // Prevent body scroll when pricing modal is open
  useEffect(() => {
    if (showPricing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPricing]);

  const handleUserClick = () => {
    setShowUserModal(!showUserModal);
  };

  const handleLogout = () => {
    logout();
    setShowUserModal(false);
  };

  const handleSettingsClick = () => {
    setShowUserModal(false);
    setShowSettingsModal(true);
  };

  return (
    <div className="flex min-h-[100svh] bg-white overflow-x-hidden">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no viewport-fit=cover" />
      <style jsx global>{`
        html, body {
          background-color: white;
          overscroll-behavior: none;
        }
        body {
          overflow-x: hidden;
        }
      `}</style>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 transition-all duration-200 ease-out ${
          isMobile 
            ? (sidebarOpen ? "w-64 h-full" : "w-0 h-full") 
            : sidebarOpen 
              ? "w-64 h-screen" 
              : "w-16 h-screen cursor-pointer"
        } bg-white border-r border-gray-200 flex flex-col overflow-hidden group`}
        onClick={!sidebarOpen && !isMobile ? () => setSidebarOpen(true) : undefined}
        style={{ 
          zIndex: 40, 
          willChange: 'width',
          height: '100svh',
          paddingTop: isMobile ? 'env(safe-area-inset-top)' : '0',
          paddingBottom: isMobile ? 'env(safe-area-inset-bottom)' : '0'
        }}
      >
        {/* Logo & Toggle */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image src="/symbol.svg" alt="ResumeRouter" width={32} height={32} />
            {sidebarOpen && <span className="font-semibold text-gray-900">ResumeRouter</span>}
          </div>
          {sidebarOpen && (
            <button
              className="focus:outline-none"
              onClick={e => { e.stopPropagation(); setSidebarOpen(false); }}
              aria-label="Close sidebar"
            >
              <DoorOpen className="w-5 h-5 text-gray-500 transition-transform duration-300" />
            </button>
          )}
        </div>
        {/* Navigation */}
        <div className={`flex-1 p-2 flex flex-col overflow-hidden ${sidebarOpen ? '' : 'items-center'}`}>
          <nav className="space-y-1 mt-2 overflow-y-auto flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  className={`flex items-center w-full p-2 rounded-lg transition-colors duration-150 group/nav relative
                    ${isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}
                    ${sidebarOpen ? 'justify-start space-x-3' : 'justify-center'}
                  `}
                  aria-label={item.label}
                  tabIndex={0}
                  href={item.href}
                >
                  <Icon className="w-5 h-5" />
                  {sidebarOpen && <span className="transition-opacity duration-200">{item.label}</span>}
                  {!sidebarOpen && (
                    <span className="absolute left-14 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover/nav:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Credits Display */}
        {user && sidebarOpen && (
          <div className="px-3 pb-3 flex-shrink-0">
            <CreditsDisplay />
          </div>
        )}

        {/* User avatar at the bottom */}
        {user && (
          <div className="relative border-t border-gray-300 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <div 
              className={`w-full flex items-center ${sidebarOpen ? 'px-3 py-3' : 'justify-center py-3'} hover:bg-gray-50 rounded-lg transition-colors duration-150 cursor-pointer`}
              onClick={(e) => {
                e.stopPropagation();
                handleUserClick();
              }}
            >
              <div className={`flex items-center ${sidebarOpen ? 'w-full' : 'justify-center'}`}>
                {user.picture ? (
                  <Image
                    src={user.picture}
                    alt={user.name || user.email || 'User'}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover shadow-sm flex-shrink-0"
                    width={40}
                    height={40}
                    unoptimized
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-gray-200 bg-blue-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-sm font-semibold">
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {sidebarOpen && (
                  <div className="flex flex-col ml-3 min-w-0 flex-1">
                    <span className="text-sm font-medium text-gray-900 truncate">{user.name || user.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Backdrop for modal */}
            {showUserModal && (
              <>
                <div 
                  className="fixed inset-0 z-40 border-t" 
                  onClick={() => setShowUserModal(false)}
                />
                <nav className={`mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[70] cursor-pointer min-w-48 w-auto ${
                  sidebarOpen 
                    ? 'absolute bottom-full left-1/2 transform -translate-x-1/2' 
                    : isMobile
                      ? 'fixed bottom-20 left-4 right-4'
                      : 'fixed bottom-32 left-20'
                }`} style={{ backgroundColor: 'white' }}>
                  {/* Credits Display in Modal */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <CreditsDisplay compact showLabel={false} />
                  </div>
                  <button 
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    onClick={handleSettingsClick}
                  >
                    <Settings className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span>Settings</span>
                  </button>
                  <button 
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    onClick={handleBillingClick}
                  >
                    <Banknote className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span>Upgrade Plan</span>
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button 
                    className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span>Logout</span>
                  </button>
                </nav>
              </>
            )}
          </div>
        )}
      </div>
      {/* Mobile Menu Button */}
      {isMobile && !sidebarOpen && (
        <button
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-transparent z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex justify-center min-h-screen overflow-y-auto transition-all duration-200 ${
          isMobile && sidebarOpen ? 'opacity-50' : 'opacity-100'
        }`}
        style={{ 
          marginLeft: isMobile ? '0' : sidebarOpen ? '256px' : '64px',
          transition: 'margin-left 200ms ease-out, opacity 200ms ease-out',
          willChange: 'margin-left, opacity',
          '--sidebar-width': isMobile ? '0' : sidebarOpen ? '256px' : '64px'
        } as React.CSSProperties}
      >
        {children}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <>
          <div 
            className="fixed inset-0 z-[60] bg-opacity-90 bg-black/50" 
            onClick={() => setShowSettingsModal(false)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className={`bg-white rounded-[40px] shadow-xl h-fit overflow-hidden flex flex-col ${
              isMobile ? 'max-w-full w-full max-h-[90vh]' : 'max-w-4xl w-[50%]'
            }`}>
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Setting />
              </div>
            </div>
          </div>
        </>
      )}
      {showPricing && (
        <div aria-modal className="fixed inset-0 z-50 bg-black/50 w-full h-full">
          <div className="w-full h-full bg-gray-50 overflow-y-auto">
              <Subscription onClose={closePricing} />
          </div>
        </div>
      )}
    </div>
  );
}