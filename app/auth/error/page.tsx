'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthErrorHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Extract parameters from the URL
    const rawMessage = searchParams.get('message');
    const status = searchParams.get('status');
    const rawEmail = searchParams.get('email');

    // Clean up the URL parameters (handling the 'undefined' string from your example)
    const errorMessage = rawMessage || 'An unknown error occurred during authentication.';
    const email = rawEmail && rawEmail !== 'undefined' ? rawEmail : null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4">
                <div className="text-center animate-in fade-in zoom-in duration-300">
                    
                    {/* Error Icon */}
                    <div className="mb-6">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Failed</h2>
                    
                    {/* Display the error message from the URL */}
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm text-left border border-red-100">
                        <p className="font-semibold mb-1">Error Details:</p>
                        <p>{errorMessage}</p>
                        {status && <p className="mt-1 text-xs text-red-500">Status Code: {status}</p>}
                        {email && <p className="mt-1 text-xs text-red-500">Account: {email}</p>}
                    </div>

                    <p className="text-slate-600 mb-8">
                        We couldn't sign you in. Please check your credentials and try again.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-3">
                        <button
                            onClick={() => router.push('/auth/customerLogin')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                        >
                            Back to Login
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <svg className="animate-spin h-16 w-16 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            </div>
        }>
            <AuthErrorHandler />
        </Suspense>
    );
}