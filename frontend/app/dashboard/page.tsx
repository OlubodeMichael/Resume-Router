'use client';

import { 
  Square
} from 'lucide-react';
import { useAuth } from '@/context/authProvider';

export default function Dashboard() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white justify-center ">
      {/* Center Column - Resume Editor */}
      <div className="flex flex-col max-w-3xl w-full px-2 sm:px-4 md:px-8">
        {/* Resume Content */}
        <div className="flex-1 p-6 overflow-y-auto justify-center items-center">
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
    </div>
  );
}