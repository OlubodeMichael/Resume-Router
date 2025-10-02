"use client";

import { useState } from 'react';
import { PLANS, formatApprox } from '@/lib/pricing';
import Navbar from '@/components/Ui/Navbar';
import Footer from '@/components/Ui/Footer';

export default function Pricing() {
  const [activeToggle, setActiveToggle] = useState<'credits' | 'pass'>('credits');

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
      <PricingHero />

      {/* Plans Section */}
      <PricingPlans activeToggle={activeToggle} setActiveToggle={setActiveToggle} />

      {/* What Counts Section */}
      <WhatCountsSection />

      {/* FAQ Section */}
      <PricingFAQ />
      <Footer />
    </div>
  );
}

function PricingHero() {
  return (
    <section className="w-full flex flex-col items-center justify-center text-center py-20 px-4 bg-white">
      <h1 className="font-serif text-[2.7rem] md:text-[4rem] font-medium leading-tight mb-6 text-slate-900">
      Pay only for what <br className="hidden md:inline" />
      you use
      </h1>
      <p className="text-gray-500 text-md md:text-lg max-w-2xl mb-10 font-normal font-sans sm:w-[60%] w-[80%] mx-auto">
        Buy credits for precision use—or go all-in for 3 months.
      </p>
    </section>
  );
}

function PricingPlans({ activeToggle, setActiveToggle }: {
  activeToggle: 'credits' | 'pass';
  setActiveToggle: (toggle: 'credits' | 'pass') => void;
}) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        
        {/* Toggle Switch */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200">
            <button
              onClick={() => setActiveToggle('credits')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeToggle === 'credits'
                  ? 'bg-blue-800 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Credits
            </button>
            <button
              onClick={() => setActiveToggle('pass')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeToggle === 'pass'
                  ? 'bg-blue-800 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              3-Month Pass
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <PlanCard plan={PLANS.free} />
          
          {/* Dynamic Plan (Credits or Pass) */}
          {activeToggle === 'credits' ? (
            <PlanCard plan={PLANS.credits} isPopular />
          ) : (
            <PlanCard plan={PLANS.pass3} isPopular />
          )}
          
          {/* Alternative Plan (smaller) */}
          <div className="flex flex-col justify-center">
            <div className="text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-serif text-lg font-medium text-slate-900 mb-2">
                {activeToggle === 'credits' ? 'Or try the Pass' : 'Or buy Credits'}
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                {activeToggle === 'credits' 
                  ? 'Unlimited for 3 months' 
                  : 'Pay per use, credits last 6 months'
                }
              </p>
              <button
                onClick={() => setActiveToggle(activeToggle === 'credits' ? 'pass' : 'credits')}
                className="text-blue-800 font-medium hover:text-blue-900 transition"
              >
                Switch to {activeToggle === 'credits' ? 'Pass' : 'Credits'} →
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 text-sm font-sans">
            ✓ All plans include ATS optimization • ✓ Professional templates • ✓ Secure data handling
          </p>
        </div>
      </div>
    </section>
  );
}

function PlanCard({ plan, isPopular }: { 
  plan: typeof PLANS[keyof typeof PLANS]; 
  isPopular?: boolean; 
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-8 relative ${
      isPopular ? 'border-blue-500 shadow-lg scale-105' : 'border-slate-200'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center">
        <h3 className="font-serif text-2xl font-medium text-slate-900 mb-2">
          {plan.name}
        </h3>
        
        <div className="mb-6">
          <div className="mb-2">
            {plan.id === 'free' ? (
              <div className="text-5xl font-bold text-slate-900">$0</div>
            ) : plan.id === 'credits-1000' ? (
              <div>
                <span className="text-5xl font-bold text-slate-900">$15</span>
                <div className="text-sm text-slate-600 mt-1">→ 1,000 credits</div>
              </div>
            ) : (
              <div>
                <span className="text-5xl font-bold text-slate-900">$39</span>
                <span className="text-lg text-slate-600 ml-2">/ 3 months</span>
              </div>
            )}
          </div>
          {'credits' in plan && plan.credits && (
            <div className="text-sm text-blue-800 font-medium bg-blue-50 rounded-lg px-3 py-2">
              ≈{formatApprox(plan.credits)} resumes
            </div>
          )}
        </div>

        <ul className="space-y-4 mb-8 text-left">
          {plan.features.map((feature: string, index: number) => (
            <li key={index} className="flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-slate-600 text-sm leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>

        <a
          href={plan.cta.href}
          className={`w-full inline-block px-6 py-4 rounded-xl font-medium text-center transition ${
            isPopular
              ? 'bg-blue-800 text-white hover:bg-blue-900 shadow-md'
              : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
          }`}
        >
          {plan.cta.label}
        </a>
      </div>
    </div>
  );
}

function WhatCountsSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl md:text-4xl font-medium leading-tight mb-4 text-slate-800">
            What counts as a &ldquo;resume&rdquo;?
          </h2>
          <p className="text-slate-600 text-lg font-sans max-w-2xl mx-auto">
            One full tailoring: parse JD → rewrite bullets → lay out in template → export-ready file.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                10
              </div>
              <h4 className="font-serif text-lg font-medium text-slate-900 mb-2">
                Credits per Resume
              </h4>
              <p className="text-slate-600 text-sm">
                Complete job-tailored resume generation
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h4 className="font-serif text-lg font-medium text-slate-900 mb-2">
                Credits per Section
              </h4>
              <p className="text-slate-600 text-sm">
                Regenerate individual resume sections
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingFAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Rollover?",
      answer: "Credits last until 6 months after purchase. For the 3-Month Pass, there's no rollover since it's unlimited during the active period."
    },
    {
      question: "Switch plans?",
      answer: "You can buy credits even while on the Pass; we always spend the Pass first. This gives you flexibility to stock up on credits before your Pass expires."
    },
    {
      question: "Refunds?",
      answer: "Credits/passes are non-refundable, but we replace failed runs with credits. If our system fails to generate your resume, we'll credit your account."
    },
    {
      question: "Can I upgrade from Free to paid plans?",
      answer: "Absolutely! Start with our Free plan to test the platform, then upgrade to Credits or the 3-Month Pass when you're ready to scale your job search."
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h4 className="text-blue-800 text-sm md:text-lg mb-3 font-normal font-sans">
            Questions & Answers
          </h4>
          <h2 className="font-serif text-3xl md:text-4xl font-medium leading-tight mb-3 text-slate-800">
            FAQs
          </h2>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mb-4 font-normal font-sans mx-auto">
            Everything you need to know about our pricing and plans.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
  );
}