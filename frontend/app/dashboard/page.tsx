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
  Keyboard, 
  Settings, 
  MoreHorizontal,
  Search,
  Filter,
  Eye,
  Square
} from 'lucide-react';
import { useAuth } from '@/context/authProvider';

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
          {user && (
            <div className="mt-2 text-sm text-gray-600">
              Welcome, {user.name}
            </div>
          )}
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

      {/* Center Column - Resume Editor */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
            <h1 className="text-lg font-semibold text-gray-900">Jane Doe Resume</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-500 cursor-pointer" />
            <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer" />
          </div>
        </div>

        {/* Resume Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Professional Summary */}
          <div className="mb-8">
            <p className="text-gray-700 leading-relaxed mb-4">
              A CVBESSECT professionell eaaliytailored maltiing invtleimally qrualifi-cations with accormplishment statements. Extensive excprience leading technical and cross-functional teams in fast-paced, rapidly changing settings, and managing cybersecurity risk assessm-ments for federal clients aligned with NIST and FISMA stand-ards, developed cybersecurity strategies for multiple organizations.
            </p>
            <button className="flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 transition-colors">
              <div className="grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-gray-400 rounded-full"></div>
                ))}
              </div>
              <span>Enhance professional summary to better match this job description</span>
            </button>
          </div>

          {/* Experience Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">EXPERIENCE</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Square className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Information Security Analyst</h3>
                  </div>
                  <span className="text-sm text-gray-500">Mar 2022 – Present</span>
                </div>
                <p className="text-gray-600 mb-2">Federal Contractors</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Coordinating all aspects of security authorizations, executing security authorization plans in fast-paced, raplitly changing</li>
                  <li>• Support data collection and security assessment activities px FISMA.</li>
                  <li>• Increased customer security practices by conducting and documenta-ting a large number of security control assessments annual.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Library */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChevronLeft className="w-5 h-5 text-gray-500 rotate-180" />
            <h2 className="font-semibold text-gray-900">Library</h2>
          </div>
          <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer" />
        </div>

        {/* Tabs */}
        <div className="px-4 pt-4">
          <div className="flex space-x-6 border-b border-gray-200">
            <button className="pb-2 px-1 border-b-2 border-purple-600 text-purple-600 font-medium">
              Sources
            </button>
            <button className="pb-2 px-1 text-gray-500 hover:text-gray-700">
              Collections
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Sources..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer" />
          </div>
        </div>

        {/* Job Listings */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-4">
            {/* Job 1 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-2 mb-2">
                <Square className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Cybersecurity Manager</h3>
                  <p className="text-sm text-gray-600">Tecla</p>
                  <p className="text-sm text-gray-500">Fremont, CA</p>
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <button className="text-sm text-blue-600 hover:text-blue-700">+ Cite</button>
                <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700">
                  <Eye className="w-3 h-3" />
                  <span>View</span>
                </button>
                <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700">
                  <MessageCircle className="w-3 h-3" />
                  <span>AI Chat</span>
                </button>
              </div>
            </div>

            {/* Job 2 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-2 mb-2">
                <Square className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Cybersecurity Manager - Customer Identity & Aut...</h3>
                  <p className="text-sm text-gray-600">Capital One</p>
                  <p className="text-sm text-gray-500">McLeart VA</p>
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <button className="text-sm text-blue-600 hover:text-blue-700">+ Cite</button>
                <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700">
                  <Eye className="w-3 h-3" />
                  <span>View</span>
                </button>
                <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700">
                  <MessageCircle className="w-3 h-3" />
                  <span>AI Chat</span>
                </button>
              </div>
            </div>

            {/* Job 3 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-2 mb-2">
                <Square className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Cybersecurity Investigator</h3>
                  <p className="text-sm text-gray-600">Tixttek</p>
                  <p className="text-sm text-gray-500">Detiver, CO</p>
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <button className="text-sm text-blue-600 hover:text-blue-700">+ Cite</button>
                <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700">
                  <Eye className="w-3 h-3" />
                  <span>View</span>
                </button>
                <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700">
                  <MessageCircle className="w-3 h-3" />
                  <span>AI Chat</span>
                </button>
              </div>
            </div>

            {/* Job 4 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-2 mb-2">
                <Square className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Information Security Engineer</h3>
                  <p className="text-sm text-gray-600">Slemen:</p>
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <button className="text-sm text-blue-600 hover:text-blue-700">+ Cite</button>
                <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700">
                  <Eye className="w-3 h-3" />
                  <span>View</span>
                </button>
                <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700">
                  <MessageCircle className="w-3 h-3" />
                  <span>AI Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="p-4">
          <button className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}