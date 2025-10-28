"use client";

import { Check, Star, Zap, Crown, Shield, Sparkles, Award } from "lucide-react";
import { PLANS, formatApprox, Plan } from "@/lib/pricing";
import { LucideIcon, X } from "lucide-react";
import { useCheckout } from "@/hooks/CheckoutProvider";

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
    const { startCheckout, loading, error } = useCheckout();
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm20 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
            </div>

            <div className="relative z-10">
                {/* Close Button */}
                <div className="flex justify-end p-6">
                    <button 
                        onClick={onClose} 
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all duration-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Header */}
                <div className="text-center mb-12 px-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Affordable and adaptable pricing to suit your goals.
                    </p>
                    
                    {/* Error Display */}
                    {error && (
                        <div className="mt-6 max-w-md mx-auto">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pricing Cards */}
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {plans.map((plan) => {
                            const isPopular = plan.popular;
                            const creditsInfo = getCreditsInfo(plan);
                            const priceDisplay = getPriceDisplay(plan);
                            
                            return (
                                <div
                                    key={plan.id}
                                    className={`relative ${isPopular ? 'lg:scale-105 z-10' : ''}`}
                                >
                                    {/* Recommended Badge */}
                                    {isPopular && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                                            <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                                Recommended for you
                                            </div>
                                        </div>
                                    )}

                                    <div
                                        className={`relative bg-white rounded-2xl shadow-sm h-full transition-all duration-300 hover:shadow-lg border ${
                                            isPopular
                                                ? 'border-blue-200 shadow-lg'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        {/* Background Pattern */}
                                        <div className="absolute top-4 right-4 opacity-10">
                                            {plan.id === 'free' && (
                                                <div className="w-16 h-16 rounded-full border-4 border-gray-300"></div>
                                            )}
                                            {plan.id === 'credits-1000' && (
                                                <div className="w-16 h-16">
                                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-gray-300">
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                                    </svg>
                                                </div>
                                            )}
                                            {plan.id === 'pass3' && (
                                                <div className="w-16 h-16">
                                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-gray-300">
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Plan Content */}
                                        <div className="p-8 h-full flex flex-col">
                                            <div className="mb-8">
                                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                                    {plan.name}
                                                </h3>
                                                
                                                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                                    {plan.description}
                                                </p>
                                                
                                                <div className="mb-6">
                                                    <div className="flex items-baseline">
                                                        <span className="text-4xl font-bold text-gray-900">
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
                                                    <div className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                                        <Zap className="w-4 h-4 mr-2" />
                                                        {creditsInfo}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Features */}
                                            <div className="mb-8 flex-1">
                                                <h4 className="text-sm font-semibold text-gray-900 mb-4">What&apos;s included:</h4>
                                                <div className="space-y-3">
                                                    {plan.features.map((feature, featureIndex) => (
                                                        <div key={featureIndex} className="flex items-start">
                                                            <div className="flex-shrink-0 w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                                                <Check className="w-3 h-3 text-blue-600" />
                                                            </div>
                                                            <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* CTA Button */}
                                            <button
                                                className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                                    isPopular
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                        : plan.disabled
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                disabled={plan.disabled || loading}
                                                onClick={async () => {
                                                    if (!plan.disabled && plan.id !== 'free') {
                                                        try {
                                                            const planType = plan.id === 'credits-1000' ? 'credits' : 'pass3';
                                                            await startCheckout(planType);
                                                        } catch (err) {
                                                            console.error('Checkout failed:', err);
                                                        }
                                                    }
                                                }}
                                            >
                                                {loading ? 'Processing...' : (typeof plan.cta === 'object' && 'label' in plan.cta ? plan.cta.label : plan.cta)}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-16 px-6 pb-8">
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Shield className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">Your data is protected with enterprise-grade security</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">Advanced algorithms optimize your resume for ATS systems</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Award className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">Professional Quality</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">Industry-standard templates designed by career experts</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}