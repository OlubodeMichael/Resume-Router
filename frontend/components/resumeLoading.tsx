"use client";


export default function ResumeLoading() {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Main loading card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                    {/* Animated logo/icon */}
                    <div className="relative mb-8">
                        <div className="w-20 h-20 mx-auto relative">
                            {/* Outer ring */}
                            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                            {/* Spinning ring */}
                            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 border-r-blue-600 rounded-full animate-spin"></div>
                            {/* Inner pulsing dot */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Generating Your Resume
                        </h1>
                        <p className="text-gray-600 leading-relaxed">
                            Our AI is crafting a personalized resume tailored to your job description. This usually takes 30-60 seconds.
                        </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="mt-8">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <div className="text-sm text-gray-500">
                            Processing your information...
                        </div>
                    </div>
                </div>

                {/* Additional info card */}
                <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="text-sm text-blue-800">
                            <p className="font-medium">What&apos;s happening?</p>
                            <p className="mt-1">We&apos;re analyzing your job description and generating a tailored resume that highlights your most relevant skills and experience.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
