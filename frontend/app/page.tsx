"use client";

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Ui/Navbar';
import Footer from '@/components/Ui/Footer';
import FadeIn from '@/components/Ui/FadeIn';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
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
      {/* Hero Section */}
      <FadeIn><Hero /></FadeIn>

      {/* Company Logos Section */}
      <CompanyLogos />

      {/* Professional Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Features />

          {/* Additional Content Section */}
          <div className="rounded-3xl p-8 sm:px-12 border border-slate-200/60" id="how-it-works">
            <HowItWorks />
            <WhyChooseUs />
          </div>
        </div>
      </section>

      

      {/* Professional Waitlist Section */}
      <div className='w-full flex flex-col items-center justify-center text-center  px-4  pt-18'>
      <CTA />
      </div>

      <CTA2 />

      {/* Professional FAQ Section */}
      <FAQ />
      <Footer />
    </div>
  );
}





function Hero() {
  return (
    <section className="w-full flex flex-col items-center justify-center text-center py-20 px-4 bg-white">
      {/* Product Hunt Badge */}
      <div className="mb-8">
        <a href="https://www.producthunt.com/products/resumerouter?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-resumerouter" target="_blank">
          <Image 
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1031131&theme=neutral&t=1761651158409" 
            alt="ResumeRouter - Tailor resumes to any job in seconds | Product Hunt" 
            width={250} 
            height={54} 
            className="mx-auto"
            unoptimized
          />
        </a>
      </div>

      <h1 className="font-serif text-[2.7rem] md:text-[4rem] font-medium leading-tight mb-6 text-slate-900">
        Resumes That Actually<br className="hidden md:inline" />
        Match the Job
      </h1>
      <p className="text-gray-500 text-md md:text-lg max-w-2xl mb-10 font-normal font-sans sm:w-[30%] w-[80%] mx-auto ">
        Powered by AI. Trained to align your experience with what recruiters are looking for.
      </p>
      <a
        href="#join-waitlist"
        className="bg-blue-800 text-white px-8 py-3 rounded-xl font-medium shadow-md hover:bg-blue-900 transition text-lg"
        style={{ boxShadow: "0 2px 16px 0 rgba(60, 120, 255, 0.10)" }}
      >
        <span className="font-semibold">Get Started</span> – it&apos;s free
      </a>

      <div className="w-full flex justify-center mt-6">
        <Image
          src="/RRDashboard.png"
          alt="Dashboard preview"
          width={1050}
          height={450}
          className="rounded-2xl "
          priority
        />
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      title: 'Edit smarter',
      description: 'Built-in AI tools to tailor your resume for recruiters and ATS systems.',
    },
    {
      title: 'Job-aware content',
      description: 'Paste any job description and let AI align your experience with what the role actually requires.',
    },
    {
      title: 'Instant bullet points',
      description: 'Generate compelling, impact-driven resume lines without writing from scratch.',
    },
    {
      title: 'Multiple resumes, one profile',
      description: 'Quickly create tailored resumes for different jobs without re-entering your info.',
    },
  ];
  
  return (
    <div className='w-full flex flex-col items-center justify-center text-center  px-4 bg-gray-50'>
      <div className='w-full flex flex-col items-center justify-center text-center   pb-10'>
        <h4 className='text-blue-800 text-sm md:text-lg max-w-2xl mb-3 font-normal font-sans sm:w-[30%] w-[80%] mx-auto '>
          Powerful Features
        </h4>
        <h1 className='font-serif text-3xl md:text-4xl font-medium leading-tight mb-3 text-slate-800'>Edit smarter. Apply faster.</h1>

        <p className='text-gray-500 text-lg md:text-xl max-w-2xl mb-4 font-normal font-sans sm:w-[50%] w-[100%] mx-auto '>
        Built-in AI tools to tailor your resume for recruiters and ATS systems.
        </p>
      </div>

      <div className="w-full flex flex-row items-center justify-center text-center  pb-10">
  <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
    {features.map((feature, index) => (
      <div
        key={index}
        className="flex flex-col items-start justify-start text-start pb-10"
      >
        <h2 className="font-serif text-[1.7rem] md:text-[2.2rem] font-regular leading-tight mb-3 text-slate-800">
          {feature.title}
        </h2>
        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mb-4 font-normal font-sans w-full mx-auto">
          {feature.description}
        </p>
      </div>
    ))}
  </div>
</div>
    </div>
  )
}

 function HowItWorks() {
  return (
    
    <div className="w-full flex flex-col items-center justify-center text-center  rounded-2xl py-30 p-6 sm:p-10  font-sans" >
      <h2 className="text-3xl sm:text-4xl font-serif font-medium text-slate-900 text-center mb-4">
        How It Works
      </h2>
      <p className="text-slate-600 text-base sm:text-lg mb-10 font-sans">
        From upload to AI-enhanced results see how ResumeRouter helps you apply smarter.
      </p>

      <div className="flex flex-col md:flex-row md:items-start md:justify-center gap-8 relative">
        {/* Left Block: Upload */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm w-full md:w-1/3 relative z-10">
          <h4 className="text-slate-800 font-semibold text-lg mb-2">Upload Resume</h4>
          <p className="text-slate-600 text-sm leading-relaxed font-sans">
            Start by uploading your existing resume. We accept PDF, DOCX, and plain text formats.
          </p>
        </div>

        {/* Connector Line */}
        <div className="hidden md:block absolute top-1/2 left-[33%] right-[33%] h-0.5 bg-gradient-to-r from-emerald-400 to-blue-500 z-0" />

        {/* Middle Block: Analyze */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm w-full md:w-1/3 relative z-10">
          <h4 className="text-slate-800 font-semibold text-lg mb-2">AI Analysis</h4>
          <p className="text-slate-600 text-sm leading-relaxed font-sans">
            Our AI scans your resume and compares it to the job description to identify key gaps and alignment points.
          </p>
        </div>

        {/* Right Block: Optimize */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm w-full md:w-1/3 relative z-10">
          <h4 className="text-slate-800 font-semibold text-lg mb-2">Generate Tailored Version</h4>
          <p className="text-slate-600 text-sm leading-relaxed font-sans">
            Receive a job-matched, professionally optimized version of your resume — ready to submit.
          </p>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-slate-200 text-center">
        <p className="text-slate-500 text-sm font-medium font-sans">
          ✓ Fast setup • ✓ Job-specific optimization • ✓ ATS-friendly output
        </p>
      </div>
    </div>
    
  );
}



function WhyChooseUs() {
  const points = [
    {
      title: 'Industry-Specific Optimization',
      desc: "Our AI tailors your resume to match the language, skills, and standards of your target industry — whether it's tech, finance, healthcare, or more.",
    },
    {
      title: 'Real-Time Market Analysis',
      desc: "We constantly scan job listings and hiring trends to make sure your resume highlights the most relevant and in-demand skills.",
    },
    {
      title: 'Personalized Career Insights',
      desc: "Get role-specific suggestions based on your experience and goals, so you can apply smarter and grow faster.",
    },
  ];

  return (
    <section className=" py-16 px-6 sm:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-serif font-medium text-slate-900 text-center mb-4">
          Why Choose ResumeRouter?
        </h2>
        <p className="text-slate-600 text-base sm:text-lg text-center max-w-2xl mx-auto mb-12">
          We built ResumeRouter to give job seekers the AI advantage tailored, optimized, and recruiter-ready resumes in minutes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {points.map((point, index) => (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="mb-4">
                <div className="w-10 h-10 bg-emerald-500 text-white flex items-center justify-center rounded-full text-lg font-bold shadow-sm">
                  {index + 1}
                </div>
              </div>
              <h4 className="font-semibold text-slate-900 text-lg mb-2">
                {point.title}
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                {point.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div>
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h4 className="text-blue-800 text-sm md:text-lg max-w-2xl mb-6 font-normal font-sans sm:w-[30%] w-[80%] mx-auto ">
              Support
            </h4>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-slate-900 text-center mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 font-sans">
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
                  className="w-full px-8 py-6 text-left flex items-center justify-between transition-colors duration-200"
                >
                  <h3 className="text-md sm:text-lg font-medium text-slate-900 pr-4 font-sans">{faq.question}</h3>
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
    </div>
  )
}

function CompanyLogos() {
  const companies = [
    { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
    { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
    { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
    { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
    { name: "Meta", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" },
    { name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
    { name: "Tesla", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Tesla_T_symbol.svg" },
    { name: "Spotify", logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" },
    { name: "Adobe", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Adobe_Systems_logo_and_wordmark.svg" },
    { name: "Salesforce", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg" },
    { name: "Oracle", logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg" },
    { name: "IBM", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" },
    { name: "Intel", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg" },
    { name: "NVIDIA", logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg" },
    { name: "PayPal", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" },
    { name: "Uber", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" },
    { name: "Airbnb", logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg" },
    { name: "Twitter", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg" },
    { name: "LinkedIn", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" },
    { name: "GitHub", logo: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" },
    { name: "Shopify", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg" },
    { name: "Zoom", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg" },
    { name: "Slack", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg" },
    { name: "Dropbox", logo: "https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg" }
  ];

  // Duplicate the array to create seamless loop
  const duplicatedCompanies = [...companies, ...companies];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-serif font-medium text-slate-900 mb-12">
          Resumes That Landed Interviews At
        </h2>
        
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll">
            {duplicatedCompanies.map((company, index) => (
              <div
                key={`${company.name}-${index}`}
                className="flex items-center justify-center h-12 w-24 mx-4 flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-80"
              >
                <Image
                  src={company.logo}
                  width={100}
                  height={100}
                  alt={`${company.name} logo`}
                  className="max-h-8 max-w-20 object-contain"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="text-slate-600 font-medium text-sm">${company.name}</span>`;
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        
        <p className="text-slate-500 text-sm mt-8 max-w-2xl mx-auto">
          Join thousands of professionals who&apos;ve successfully landed interviews at top companies using AI-optimized resumes
        </p>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 15s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

function CTA() {
  return (
    <section className="pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 text-center text-slate-900">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-[2rem] sm:text-[2.5rem] lg:text-4xl font-serif font-medium text-slate-900 mb-4 sm:mb-6 leading-tight px-4 sm:px-0">
          Build resumes that get noticed
        </h2>
        <p className="text-slate-900 text-md sm:text-lg mb-6 font-sans px-4 sm:px-0">
          Join ResumeRouter today and tailor your next resume with AI no writing skills required.
        </p>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-4 text-md font-medium text-slate-900 mb-6 sm:mb-8 px-4 sm:px-0">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Start for free
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            No credit card required
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Cancel anytime
          </span>
        </div>

       
        
        <div className="mt-8 sm:mt-10 border-t border-slate-200 pt-6 sm:pt-8 mx-4 sm:mx-0"></div>
        
        <div className="pt-6 sm:pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center text-sm text-slate-600 px-4 sm:px-0">
          <div>
            <p className="font-semibold text-slate-900 text-xl">Over 12k</p>
            <p className="text-sm sm:text-md">Professionals helped</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-xl">5.4 hours saved</p>
            <p className="text-sm sm:text-md">Per resume, on average</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-xl">99.7%</p>
            <p className="text-sm sm:text-md">Plan to use us again</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function CTA2() {
  return (
    <section className='bg-[#101828] text-white py-20 sm:py-24 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-3xl mx-auto text-center'>
        <h2 className='text-[1.5rem] sm:text-[2rem] lg:text-3xl font-serif font-medium text-white mb-4 sm:mb-6 leading-tight'>
        Tailor your resume instantly.
        </h2>
        <p className='text-slate-300 text-md sm:text-lg mb-8 sm:mb-10 font-sans max-w-2xl mx-auto'>
          Paste the JD. We align your resume, optimize for ATS, and export in one click.
        </p>
        <a
          href="/signup"
          className="inline-block bg-blue-800 text-white px-8 py-3 rounded-xl font-medium shadow-md hover:bg-blue-900 transition text-lg"
          style={{ boxShadow: "0 2px 16px 0 rgba(255, 255, 255, 0.10)" }}
        >
          Get Started
        </a>
      </div>
    </section>
  );
}