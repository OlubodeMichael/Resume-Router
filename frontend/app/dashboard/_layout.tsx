'use client';

import { 
  ChevronLeft, 
  Plus, 
  FileText, 
  BookOpen, 
  MessageCircle, 
  Star, 
  Lightbulb, 
  HelpCircle, 
  Keyboard
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-semibold text-gray-900">ResumeRouter</span>
            </div>
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-gray-700">New</span>
            </div>
            
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Documents</span>
            </div>
            
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <BookOpen className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Library</span>
            </div>
            
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <MessageCircle className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">All Chat</span>
            </div>
          </nav>

          <div className="border-t border-gray-200 mt-6 pt-6">
            <nav className="space-y-2">
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                <Star className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Refer and earn</span>
              </div>
              
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                <Lightbulb className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Tutorials</span>
              </div>
              
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                <HelpCircle className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Help</span>
              </div>
              
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                <Keyboard className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Shortcuts</span>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {children}
      </div>
    </div>
  );
}