"use client";
import { useState, useEffect } from "react";
import {
  DoorOpen,
  Plus,
  FileText,
  BookOpen,
  MessageCircle,
  HelpCircle,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/authProvider";
import Image from "next/image";
import Link from "next/link";

const navItems = [
  { icon: Plus, label: "New", active: true, href: "/dashboard/" },
  { icon: FileText, label: "Documents", href: "/dashboard/documents" },
  { icon: BookOpen, label: "Library", href: "/dashboard/library" },
  { icon: MessageCircle, label: "All Chat", href: "/dashboard/all-chat" },
];
const bottomNavItems = [
  { icon: HelpCircle, label: "Help", href: "/dashboard/help" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.matchMedia('(max-width: 640px)').matches);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const handleUserClick = () => {
    setShowUserModal(!showUserModal);
  };

  const handleLogout = () => {
    logout();
    setShowUserModal(false);
  };

  return (
    <div className="flex h-screen bg-white smooth-transition overflow-hidden">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 smooth-transition ${
          isMobile ? "w-16" : sidebarOpen ? "w-64" : "w-16 cursor-pointer"
        } bg-white border-r border-gray-200 flex flex-col overflow-hidden group`}
        onClick={!sidebarOpen && !isMobile ? () => setSidebarOpen(true) : undefined}
        style={{ zIndex: 40 }}
      >
        {/* Logo & Toggle */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            {sidebarOpen && <span className="font-semibold text-gray-900">ResumeRouter</span>}
          </div>
          {sidebarOpen && !isMobile && (
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
        <div className={`flex-1 p-2 flex flex-col justify-between ${sidebarOpen ? '' : 'items-center'}`}>
          <nav className="space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  className={`flex items-center w-full p-2 rounded-lg transition-colors duration-200 group/nav relative
                    ${item.active ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}
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
          <div className="border-t border-gray-200 mt-4 pt-4 w-full">
            <nav className="space-y-1">
              {bottomNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    href={item.href}
                    key={item.label}
                    className={`flex items-center w-full p-2 rounded-lg transition-colors duration-200 group/nav relative
                      hover:bg-gray-100 text-gray-700
                      ${sidebarOpen ? 'justify-start space-x-3' : 'justify-center'}
                    `}
                    aria-label={item.label}
                    tabIndex={0}
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
        </div>

        {/* User avatar at the bottom */}
        {user?.picture && (
          <div className="relative">
            <div 
              className={`w-full flex items-center ${sidebarOpen ? 'px-3 py-3' : 'justify-center py-3'} mt-auto hover:bg-gray-50 rounded-lg transition-colors cursor-pointer`}
              onClick={handleUserClick}
            >
              <div className="flex items-center w-full">
                <Image
                  src={user.picture}
                  alt={user.name || user.email || 'User'}
                  className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover shadow-sm flex-shrink-0"
                  width={40}
                  height={40}
                  unoptimized
                />
                {sidebarOpen && (
                  <div className="flex flex-col ml-3 min-w-0 flex-1">
                    <span className="text-sm font-medium text-gray-900 truncate">{user.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Backdrop for modal */}
            {showUserModal && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserModal(false)}
                />
                <nav className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 cursor-pointer min-w-48 w-auto">
                  <Link
                    href="/profile"
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span>Settings</span>
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button 
                    className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
      {/* Main Content Area */}
      <div className="flex-1 flex min-w-0 justify-center">
        {children}
      </div>
    </div>
  );
}