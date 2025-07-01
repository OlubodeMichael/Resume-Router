"use client";

import { useState } from 'react';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/join-waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setEmail('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Something went wrong. Please try again.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Professional Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg tracking-tight">RR</span>
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">ResumeRouter</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <a href="#home" className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm">Platform</a>
              <a href="#features" className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm">Solutions</a>
              <a href="#faq" className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm">Resources</a>
              <a href="/Auth/SignIn" className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm">Sign In</a>

              <a href="#waitlist" className="ml-4 bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-all duration-200 font-semibold text-sm shadow-sm">
                Get Early Access
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button className="text-slate-600 hover:text-slate-900 p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Professional Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-slate-900/5 border border-slate-200/60 mb-12 backdrop-blur-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
              <span className="text-slate-700 text-sm font-semibold tracking-wide">AI-POWERED RESUME OPTIMIZATION</span>
            </div>

            {/* Professional Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-8 leading-tight tracking-tight">
              Transform Your
              <br />
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                Career Trajectory
              </span>
            </h1>

            {/* Professional Subheadline */}
            <p className="text-lg sm:text-xl text-slate-600 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
              Advanced AI platform that intelligently maps your professional profile to market opportunities, 
              optimizes your resume with precision, and delivers personalized career acceleration strategies.
            </p>

            {/* Professional CTA */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <button 
                onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-slate-900 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-slate-800 transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl border border-slate-800"
              >
                Request Demo
              </button>
              <button className="border-2 border-slate-300 text-slate-700 px-10 py-4 rounded-xl text-lg font-semibold hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 shadow-sm">
                View Platform Overview
              </button>
            </div>

            {/* Professional Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-12 text-slate-500 mb-16">
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full border-3 border-white shadow-md"></div>
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full border-3 border-white shadow-md"></div>
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full border-3 border-white shadow-md"></div>
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-slate-900">2,500+ professionals</div>
                  <div className="text-xs text-slate-500">Trust our platform</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-slate-900">4.9/5 rating</div>
                  <div className="text-xs text-slate-500">Professional satisfaction</div>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Hero Visual */}
          <div className="mt-24">
            <div className="w-full max-w-6xl mx-auto">
              <div className="bg-white rounded-3xl p-12 border border-slate-200/60 shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/60">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-5 bg-slate-200 rounded-lg w-4/5"></div>
                        <div className="h-5 bg-slate-200 rounded-lg w-3/5"></div>
                        <div className="h-5 bg-slate-200 rounded-lg w-5/6"></div>
                        <div className="h-5 bg-slate-200 rounded-lg w-2/3"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl">
                      <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto lg:mx-0 mb-6 flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold mb-3">Intelligent Skill Mapping</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">Advanced AI algorithms that precisely match your professional capabilities to market opportunities</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Professional Solutions
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
              Comprehensive AI-powered platform designed for professionals seeking strategic career advancement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: "🎯",
                title: "Precision Resume Optimization",
                description: "AI-driven customization that aligns your professional narrative with specific role requirements and industry standards"
              },
              {
                icon: "🧠",
                title: "Intelligent Skill Analytics",
                description: "Advanced algorithms that map your expertise to market demands and identify strategic career opportunities"
              },
              {
                icon: "📈",
                title: "Strategic Career Planning",
                description: "Data-driven insights and personalized development roadmaps to accelerate your professional trajectory"
              },
              {
                icon: "🔒",
                title: "Professional Security",
                description: "Bank-level encryption and compliance standards ensuring your professional data remains confidential and secure"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-slate-50 rounded-2xl p-8 border border-slate-200/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Additional Content Section */}
          <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200/60">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 sm:mb-6">Why Choose ResumeRouter?</h3>
                <p className="text-slate-600 mb-6 sm:mb-8 leading-relaxed">
                  In today&apos;s competitive job market, having a resume that stands out is crucial. Traditional resume writing often misses the mark because it doesn&apos;t account for the specific requirements of each role or the latest industry trends.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Industry-Specific Optimization</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">Our AI understands the nuances of different industries and tailors your resume accordingly. Whether you&apos;re in tech, finance, healthcare, or any other sector, we adapt your experience to match industry-specific terminology and expectations.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Real-Time Market Analysis</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">Stay current with the latest job market trends and employer preferences. Our platform continuously analyzes job postings and industry data to ensure your resume reflects the most sought-after skills and keywords in your field.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Personalized Recommendations</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">Get tailored suggestions based on your unique background and career goals. Our AI considers your experience level, target roles, and career trajectory to provide recommendations that are specifically designed for your professional journey.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/60">
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">How It Works</h4>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  Our streamlined process makes resume optimization simple and effective. Get professional results in just three easy steps.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                    <div>
                      <h5 className="font-semibold text-slate-900 text-base mb-2">Upload Your Resume</h5>
                      <p className="text-slate-600 text-sm leading-relaxed">Simply upload your current resume in any standard format including PDF, DOC, DOCX, or TXT files. Our platform supports all common resume formats.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                    <div>
                      <h5 className="font-semibold text-slate-900 text-base mb-2">AI Analysis</h5>
                      <p className="text-slate-600 text-sm leading-relaxed">Our advanced AI analyzes your skills, experience, and target roles to identify optimization opportunities and industry-specific requirements.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                    <div>
                      <h5 className="font-semibold text-slate-900 text-base mb-2">Get Optimized Results</h5>
                      <p className="text-slate-600 text-sm leading-relaxed">Receive tailored recommendations and optimized resume versions that are specifically crafted to match your target job requirements.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-slate-500 text-xs font-medium">
                    ✓ Instant analysis • ✓ Professional results • ✓ Industry-specific optimization
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              What Professionals Say
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
              Join thousands of professionals who have transformed their careers with ResumeRouter
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Product Manager",
                company: "TechCorp",
                content: "ResumeRouter helped me identify the key skills I was missing for senior roles. The AI suggestions were spot-on and helped me land my dream job."
              },
              {
                name: "Michael Rodriguez",
                role: "Software Engineer",
                company: "InnovateLab",
                content: "The platform's ability to tailor my resume for different tech roles was incredible. I saw a 40% increase in interview requests within weeks."
              },
              {
                name: "Emily Watson",
                role: "Marketing Director",
                company: "GrowthCo",
                content: "As someone switching industries, ResumeRouter was invaluable. It helped me translate my experience in ways that resonated with new employers."
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm hover:shadow-lg transition-shadow duration-200">
                <div className="flex text-amber-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-500">{testimonial.role} at {testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional FAQ Section */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-lg sm:text-xl text-slate-600">
              Essential information about our AI platform
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "How does the AI resume optimization work?",
                answer: "Our AI analyzes job descriptions and your resume to identify key skills and experiences that match the role requirements, then suggests improvements to make your resume more relevant for each application."
              },
              {
                question: "Is my data secure?",
                answer: "Yes, we use industry-standard encryption to protect your information. Your data is never shared with third parties and is processed securely."
              },
              {
                question: "How accurate is the skill matching?",
                answer: "Our AI has been trained on job postings and resumes to provide relevant skill matching. While it's quite accurate, we recommend reviewing suggestions to ensure they fit your experience."
              },
              {
                question: "Can I use this for any industry?",
                answer: "Yes, our platform works across different industries and career levels. We have specialized algorithms for various sectors and job types."
              },
              {
                question: "How long does it take to get results?",
                answer: "Most users receive their optimized resume suggestions within minutes. The AI analysis is quick, but we recommend taking time to review and customize the recommendations."
              },
              {
                question: "What file formats do you support?",
                answer: "We support all common resume formats including PDF, DOC, DOCX, and TXT files. You can also paste your resume text directly into our platform."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors duration-200"
                >
                  <h3 className="text-xl font-bold text-slate-900 pr-4">{faq.question}</h3>
                  <svg
                    className={`w-6 h-6 text-slate-500 transition-transform duration-200 flex-shrink-0 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-8 pb-6">
                    <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Waitlist Section */}
      <section id="waitlist" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 tracking-tight">
            Secure Your Early Access
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join the exclusive group of professionals who will have first access to our revolutionary AI platform. 
            Limited spots available for our launch.
          </p>
          
          <div className="max-w-lg mx-auto">
            <form onSubmit={handleJoinWaitlist} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your professional email"
                  className="flex-1 px-6 py-4 rounded-xl border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-slate-900 placeholder-slate-500 bg-white shadow-lg text-sm font-medium"
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors duration-200 shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Joining...
                    </>
                  ) : (
                    'Join Waitlist'
                  )}
                </button>
              </div>
              
              {message && (
                <div className={`text-sm font-medium px-4 py-3 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}
              
              <p className="text-slate-400 text-sm font-medium">
                Professional-grade security • No spam • Unsubscribe anytime
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg tracking-tight">RR</span>
              </div>
              <span className="text-xl font-bold tracking-tight">ResumeRouter</span>
            </div>
            
            <div className="flex items-center space-x-6 text-slate-400">
              <a href="#" className="hover:text-white transition-colors font-medium text-sm">Privacy</a>
              <a href="#" className="hover:text-white transition-colors font-medium text-sm">Terms</a>
              <a href="#" className="hover:text-white transition-colors font-medium text-sm">Contact</a>
              <a href="#" className="hover:text-white transition-colors font-medium text-sm">Twitter</a>
              <a href="#" className="hover:text-white transition-colors font-medium text-sm">LinkedIn</a>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p className="font-medium">&copy; 2024 ResumeRouter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
