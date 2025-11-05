"use client";

import { Check, Zap, Shield, Sparkles, Award, ArrowRight, X } from "lucide-react";
import { PLANS, Plan } from "@/lib/pricing";
import { useCheckout } from "@/hooks/CheckoutProvider";

interface ExtendedPlan extends Omit<Plan, 'cta' | 'features'> {
    features: readonly string[];
    description: string;
    cta: string | { label: string; href: string };
    popular: boolean;
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
            disabled: true
        },
        {
            ...PLANS.credits,
            description: "Pay-as-you-go credits for flexibility",
            cta: "Buy Credits",
            popular: true,
            disabled: false
        },
        {
            ...PLANS.pass3,
            description: "Unlimited access for 3 months",
            cta: "Get 3-Month Pass",
            popular: false,
            disabled: false
        }
    ];

    const getPriceDisplay = (plan: ExtendedPlan) => {
        if (plan.price === undefined) return { main: "$0", sub: "forever" };
        
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
            return `${plan.credits.toLocaleString()} credits`;
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-50 translate-x-1/2 translate-y-1/2"></div>

            {/* Close Button */}
            <button 
                onClick={onClose} 
                className="absolute top-8 right-8 z-50 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                aria-label="Close"
            >
                <X className="w-6 h-6" />
            </button>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span>Choose the perfect plan</span>
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                        Simple, Transparent
                        <br />
                        <span className="text-blue-600">Pricing</span>
                    </h1>
                    
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Select the plan that fits your career journey. Upgrade or downgrade anytime.
                    </p>
                    
                    {/* Error Display */}
                    {error && (
                        <div className="mt-8 max-w-md mx-auto">
                            <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pricing Cards - Horizontal Layout on Large Screens */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
                    {plans.map((plan) => {
                        const isPopular = plan.popular;
                        const creditsInfo = getCreditsInfo(plan);
                        const priceDisplay = getPriceDisplay(plan);
                        
                        return (
                            <div
                                key={plan.id}
                                className={`relative group ${isPopular ? 'lg:scale-105' : ''}`}
                            >
                                {/* Popular Ribbon */}
                                {isPopular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-1.5 rounded-full text-xs font-bold tracking-wider">
                                            BEST VALUE
                                        </div>
                                    </div>
                                )}

                                <div
                                    className={`relative h-full bg-white rounded-2xl border-2 transition-all duration-300 ${
                                        isPopular
                                            ? 'border-blue-500 bg-gradient-to-b from-blue-50/50 to-white'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    {/* Plan Content */}
                                    <div className="p-8 flex flex-col h-full">
                                        {/* Plan Name & Description */}
                                        <div className="mb-8">
                                            <h3 className={`text-2xl font-bold mb-3 ${isPopular ? 'text-blue-600' : 'text-gray-900'}`}>
                                                {plan.name}
                                            </h3>
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                {plan.description}
                                            </p>
                                        </div>

                                        {/* Pricing */}
                                        <div className="mb-8 pb-8 border-b border-gray-200">
                                            <div className="flex items-baseline gap-2 mb-3">
                                                <span className="text-5xl font-bold text-gray-900">
                                                    {priceDisplay.main}
                                                </span>
                                                {priceDisplay.sub && (
                                                    <span className="text-lg text-gray-500 font-medium">
                                                        {priceDisplay.sub}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {creditsInfo && (
                                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">
                                                    <Zap className="w-4 h-4" />
                                                    <span>{creditsInfo}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Features List */}
                                        <div className="flex-1 mb-8">
                                            <ul className="space-y-4">
                                                {plan.features.map((feature, featureIndex) => (
                                                    <li key={featureIndex} className="flex items-start gap-3">
                                                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                                                            isPopular ? 'bg-blue-100' : 'bg-gray-100'
                                                        }`}>
                                                            <Check className={`w-4 h-4 ${
                                                                isPopular ? 'text-blue-600' : 'text-gray-600'
                                                            }`} />
                                                        </div>
                                                        <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* CTA Button */}
                                        <button
                                            className={`w-full py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                                isPopular
                                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                                                    : plan.disabled
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gray-900 text-white hover:bg-gray-800'
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
                                            {loading ? (
                                                'Processing...'
                                            ) : (
                                                <>
                                                    {typeof plan.cta === 'object' && 'label' in plan.cta ? plan.cta.label : plan.cta}
                                                    {!plan.disabled && (
                                                        <ArrowRight className="w-4 h-4" />
                                                    )}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Trust Section */}
                <div className="border-t border-gray-200 pt-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                <Shield className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">Secure & Private</h3>
                            <p className="text-gray-600 leading-relaxed">Enterprise-grade encryption keeps your data safe and confidential</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                <Sparkles className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">AI-Powered</h3>
                            <p className="text-gray-600 leading-relaxed">Advanced algorithms optimize your resume for maximum ATS compatibility</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                <Award className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">Professional Quality</h3>
                            <p className="text-gray-600 leading-relaxed">Industry-standard templates crafted by career experts and designers</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}