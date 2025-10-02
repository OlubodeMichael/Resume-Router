"use client";

import { Check, Star, Zap, Crown, Shield, Sparkles, Award } from "lucide-react";
import { PLANS, formatApprox, Plan } from "@/lib/pricing";
import { LucideIcon, X } from "lucide-react";
import Logo from "@/components/logo";

interface ExtendedPlan extends Omit<Plan, 'cta' | 'features'> {
    features: readonly string[];
    description: string;
    cta: string | { label: string; href: string };
    popular: boolean;
    icon: LucideIcon;
    color: string;
    disabled: boolean;
}

export default function Subscription({ onClose }: { onClose: () => void }) {

    const plans: ExtendedPlan[] = [
        {
            ...PLANS.free,
            description: "Perfect for getting started",
            cta: "Current Plan",
            popular: false,
            icon: Star,
            color: "gray",
            disabled: true
        },
        {
            ...PLANS.credits,
            description: "Pay-as-you-go credits for flexibility",
            cta: "Buy Credits",
            popular: true,
            icon: Zap,
            color: "blue",
            disabled: false
        },
        {
            ...PLANS.pass3,
            description: "Unlimited access for 3 months",
            cta: "Get 3-Month Pass",
            popular: false,
            icon: Crown,
            color: "purple",
            disabled: false
        }
    ];

    const getPriceDisplay = (plan: ExtendedPlan) => {
        if (plan.price === undefined) return { main: "Free", sub: "" };
        
        // Handle different price formats
        if (plan.priceLabel.includes("→")) {
            const [price, credits] = plan.priceLabel.split(" → ");
            return { main: price, sub: credits };
        } else if (plan.priceLabel.includes("/")) {
            const [price, period] = plan.priceLabel.split(" / ");
            return { main: price, sub: period };
        } else {
            return { main: plan.priceLabel, sub: "" };
        }
    };

    const getCreditsInfo = (plan: ExtendedPlan) => {
        if (plan.credits) {
            return `${plan.credits} credits (~${formatApprox(plan.credits)} resumes)`;
        }
        return null;
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Close Button */}
                <div className="flex justify-end mb-6">
                    <button 
                        onClick={onClose} 
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all duration-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center items-center mb-6">
                        <Logo />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Unlock your career potential with our AI-powered resume builder. 
                        Professional templates, expert guidance, and results that get you hired.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 ">
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        const isPopular = plan.popular;
                        const creditsInfo = getCreditsInfo(plan);
                        const priceDisplay = getPriceDisplay(plan);
                        
                        return (
                            <div
                                key={plan.id}
                                className={`relative ${
                                    isPopular
                                        ? 'lg:scale-105 z-10'
                                        : ''
                                }`}
                            >
                                {/* Popular Badge */}
                                {isPopular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                                        <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                <div
                                    className={`relative bg-white rounded-3xl shadow-sm h-full transition-all duration-300 hover:shadow-xl border ${
                                        isPopular
                                            ? 'ring-2 ring-blue-500/20 shadow-xl border-blue-100'
                                            : 'hover:shadow-lg border-gray-100'
                                    }`}
                                >
                                    {/* Plan Header */}
                                    <div className="p-8">
                                        <div className="text-center mb-8">
                                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${
                                                plan.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                                plan.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                                                'bg-gray-50 text-gray-600'
                                            }`}>
                                                <Icon className="w-8 h-8" />
                                            </div>
                                            
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                                {plan.name}
                                            </h3>
                                            
                                            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                                {plan.description}
                                            </p>
                                            
                                            <div className="mb-6">
                                                <div className="flex items-baseline justify-center">
                                                    <span className="text-5xl font-bold text-gray-900">
                                                        {priceDisplay.main}
                                                    </span>
                                                    {priceDisplay.sub && (
                                                        <span className="text-lg text-gray-600 ml-2">
                                                            {priceDisplay.sub}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {creditsInfo && (
                                                <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-100">
                                                    <Zap className="w-4 h-4 mr-2" />
                                                    {creditsInfo}
                                                </div>
                                            )}
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-4 mb-8">
                                            {plan.features.map((feature, featureIndex) => (
                                                <div key={featureIndex} className="flex items-start">
                                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center mr-4 mt-0.5 border border-blue-100">
                                                        <Check className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* CTA Button */}
                                        <button
                                            className={`w-full py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                                                isPopular
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                                                    : plan.disabled
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
                                            }`}
                                            disabled={plan.disabled}
                                            onClick={() => {
                                                if (!plan.disabled && typeof plan.cta === 'object' && 'href' in plan.cta) {
                                                    window.location.href = plan.cta.href;
                                                }
                                            }}
                                        >
                                            {typeof plan.cta === 'object' && 'label' in plan.cta ? plan.cta.label : plan.cta}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Trust Indicators */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                                <Shield className="w-7 h-7 text-emerald-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">Your data is protected with enterprise-grade security</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                                <Sparkles className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">Advanced algorithms optimize your resume for ATS systems</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                                <Award className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Professional Quality</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">Industry-standard templates designed by career experts</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}