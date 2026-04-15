import { CheckCircle2, Mail, Clock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
interface RegistrationSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const RegistrationSuccessModal = ({ isOpen, onClose }: RegistrationSuccessModalProps) => {
    const router = useRouter();
    if (!isOpen) return null;
    if (isOpen) {
        setTimeout(() => {
            onClose();
            router.push('/');
        }, 2000);
    }
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-300">
                    {/* Header Decoration */}
                    <div className="h-2 bg-blue-500 w-full" />

                    <div className="p-8 flex flex-col items-center text-center">
                        {/* Success Icon */}
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Registration Submitted!
                        </h2>
                        <p className="text-gray-500 mb-8">
                            Thank you for choosing to partner with our platform. Your business application is now under review.
                        </p>

                        {/* Info Cards */}
                        <div className="w-full space-y-3 mb-8">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                    <Clock className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estimated Time</p>
                                    <p className="text-sm font-medium text-gray-700">2 - 4 Business Days</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                    <Mail className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notification</p>
                                    <p className="text-sm font-medium text-gray-700">Check your email for approval</p>
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-gray-400">
                            Need help? Contact our support team at support@platform.com
                        </p>
                    </div>
                </div>
            </div>
        );
    };