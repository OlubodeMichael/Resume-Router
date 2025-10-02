"use client";

import Navbar from "@/components/Ui/Navbar";
import Footer from "@/components/Ui/Footer";

export default function Privacy() {
  return (
    <div>
      <style jsx global>{`
        html, body {
          background-color: white;
          overscroll-behavior: none;
        }
        body {
          overflow-x: hidden;
        }
      `}</style>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-blue-50 rounded-full">
              <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-blue-700">Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="space-y-12">
                <section className="border-l-4 border-blue-500 pl-6">
                  <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-4">
                      <span className="text-sm font-bold text-blue-600">1</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Personal Information
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span>Name and email address (when you create an account)</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span>Profile information you provide (job title, experience, education)</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span>Resume content and templates you create</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span>Authentication data from Google OAuth</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Usage Information
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span>How you interact with our service</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span>Device and browser information</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span>IP address and location data</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span>Cookies and similar tracking technologies</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="border-l-4 border-blue-500 pl-6">
                  <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-4">
                      <span className="text-sm font-bold text-blue-600">2</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">To provide and improve our resume building services</span>
                    </div>
                    <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">To personalize your experience and content</span>
                    </div>
                    <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">To communicate with you about your account and our services</span>
                    </div>
                    <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">To send you important updates and notifications</span>
                    </div>
                    <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">To analyze usage patterns and improve our platform</span>
                    </div>
                    <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">To prevent fraud and ensure security</span>
                    </div>
                  </div>
                </section>

                <section className="border-l-4 border-blue-500 pl-6">
                  <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-4">
                      <span className="text-sm font-bold text-blue-600">3</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Information Sharing</h2>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <p className="text-gray-700 text-lg font-medium">
                      We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start p-4 bg-white border border-blue-200 rounded-lg">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 mr-4 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Service Providers:</span>
                        <span className="text-gray-700 ml-2">With trusted third-party services that help us operate our platform (hosting, analytics, email services)</span>
                      </div>
                    </div>
                    <div className="flex items-start p-4 bg-white border border-blue-200 rounded-lg">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 mr-4 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Legal Requirements:</span>
                        <span className="text-gray-700 ml-2">When required by law or to protect our rights and safety</span>
                      </div>
                    </div>
                    <div className="flex items-start p-4 bg-white border border-blue-200 rounded-lg">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 mr-4 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Business Transfers:</span>
                        <span className="text-gray-700 ml-2">In the event of a merger, acquisition, or sale of assets</span>
                      </div>
                    </div>
                    <div className="flex items-start p-4 bg-white border border-blue-200 rounded-lg">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 mr-4 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Consent:</span>
                        <span className="text-gray-700 ml-2">When you explicitly consent to sharing your information</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="border-l-4 border-blue-500 pl-6">
                  <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-4">
                      <span className="text-sm font-bold text-blue-600">4</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6">
                    <p className="text-gray-700 mb-4 text-lg font-medium">
                      We implement appropriate security measures to protect your personal information:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start p-3 bg-white rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">Encryption of data in transit and at rest</span>
                      </div>
                      <div className="flex items-start p-3 bg-white rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">Regular security audits and updates</span>
                      </div>
                      <div className="flex items-start p-3 bg-white rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">Access controls and authentication measures</span>
                      </div>
                      <div className="flex items-start p-3 bg-white rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">Secure data centers and infrastructure</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="border-l-4 border-blue-500 pl-6">
                  <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-4">
                      <span className="text-sm font-bold text-blue-600">5</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl p-8">
                    <p className="text-gray-700 mb-6 text-lg">
                      If you have any questions about this privacy policy or our data practices, please contact us:
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                        <p className="text-sm text-gray-600">privacy@resumerouter.app</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Website</h3>
                        <p className="text-sm text-gray-600">resumerouter.app</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}