'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { jwtDecode } from "jwt-decode";
import { loginSuccess } from '@/lib/features/auth/authSlice';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, User, UserRole } from '@/constants';
import { AccountReactivation } from '@/components/customer/AccountReactivationModel';
export enum LoginStatusEnum {
    PROCESSING = 'processing',
    SUCCESS = 'success',
    ERROR = 'error',
}

function AuthSuccessHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const [status, setStatus] = useState<LoginStatusEnum>(LoginStatusEnum.PROCESSING);
    const [errorMessage, setErrorMessage] = useState<string>('');
     const [ isReactivationOpen, setIsReactivationOpen] = useState(false);
    const [userEmail, setUserEmail] = useState<string>('');

    useEffect(() => {
        const handleAuthSuccess = async () => {
            try {
                const accessToken = searchParams.get('access_token');
                const refreshToken = searchParams.get('refresh_token');
                const message = searchParams.get('message');
                const status = searchParams.get('status');
                const email = searchParams.get('email');
                setUserEmail(email ? email : '');
                console.log('accessToken', accessToken);
                console.log('refreshToken', refreshToken);

                console.log('message', message);
                console.log('status', status);
                
                if (!accessToken) {
                    if(status == "423") {
                        setIsReactivationOpen(true);
                        setErrorMessage(message ? message : 'Authentication token not found');
                        setUserEmail(email ? email : '');
                        return;
                    }
                    setStatus(status ? LoginStatusEnum[status as keyof typeof LoginStatusEnum] : LoginStatusEnum.ERROR);
                    setErrorMessage(message ? message : 'Authentication token not found');
                    setTimeout(() => router.push('/auth/customerLogin'), 2000);
                    return;
                }

                try {
                    const payload: {
                        user: Partial<User>
                        role: Partial<UserRole>
                    } = jwtDecode(accessToken);
                    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
                    if (refreshToken) {
                        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
                    }

                    dispatch(loginSuccess({
                        access_token: accessToken,
                        refresh_token: refreshToken ?? '',
                        user: {
                            id: payload.user.id,
                            profile_picture_url: payload.user.profile_picture_url,
                            first_name: payload.user.first_name,
                            last_name: payload.user.last_name,
                            email: payload.user.email,
                            country_code: payload.user.country_code,
                            phone_number: payload.user.phone_number,
                            user_status: payload.user.user_status,
                            company_id: payload.user.company_id,
                            role_id: payload.user.role_id,
                        },
                        role: payload.role,
                    }));

                    setStatus(LoginStatusEnum.SUCCESS);

                    setTimeout(() => {
                        router.push('/');
                    }, 1000);
                } catch (decodeError) {
                    console.error('Token decode error:', decodeError);
                    setStatus(LoginStatusEnum.ERROR);
                    setErrorMessage('Invalid authentication token');
                    setTimeout(() => router.push('/auth/customerLogin'), 2000);
                }
            } catch (error) {
                console.error('Auth success handler error:', error);
                setStatus(LoginStatusEnum.ERROR);
                setErrorMessage('Authentication failed. Please try again.');
                setTimeout(() => router.push('/auth/customerLogin'), 2000);
            }
        };

        handleAuthSuccess();
    }, [searchParams, router, dispatch]);
   const handleReactivationSuccess = () => {
        setIsReactivationOpen(false);
        // The account is now active! Log them in and redirect to dashboard.
        router.push('/auth/customerLogin');
        // alert("Redirecting to dashboard...");
    };
    return (
        <div className="min-h-screen flex items-center justify-center ">
            <div className="bg-white p-8 rounded-2xl shadow-2xl  w-full mx-4">

                {status === LoginStatusEnum.PROCESSING && (
                    <div className="text-center animate-in fade-in duration-300">
                        <div className="mb-6">
                            <svg className="animate-spin h-16 w-16 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Completing Sign In...</h2>
                        <p className="text-slate-600">Please wait while we set up your account</p>
                    </div>
                )}

                {status === LoginStatusEnum.SUCCESS && (
                    <div className="text-center animate-in fade-in zoom-in duration-300">
                        <div className="mb-6">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
                        <p className="text-slate-600">You've been signed in successfully. Redirecting...</p>
                    </div>
                )}

                {status === LoginStatusEnum.ERROR && (
                    <div className="text-center animate-in fade-in zoom-in duration-300">
                        <div className="mb-6">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Failed</h2>
                        <p className="text-slate-600 mb-4">{errorMessage || 'An error occurred during sign in'}</p>
                        <p className="text-sm text-slate-500">Redirecting to login page...</p>
                    </div>
                )}

            </div>
             <AccountReactivation
                            isOpen={isReactivationOpen}
                            onClose={() => setIsReactivationOpen(false)}
                            onSuccess={handleReactivationSuccess}
                            emailMasked={userEmail}
                        />
        </div>
    );
}

export default function AuthSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <svg className="animate-spin h-16 w-16 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            </div>
        }>
            <AuthSuccessHandler />
        </Suspense>
    );
}