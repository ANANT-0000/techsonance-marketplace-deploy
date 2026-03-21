import Link from 'next/link';
import { ShieldCheck, Store, User } from 'lucide-react';

export default function AuthCenter() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            {/* Header Section */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-foreground mb-2">Auth Center</h1>
                <p className="text-muted-foreground">Select your portal to continue with Techsonance MarketPlace </p>
            </div>

            {/* Portal Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">

                {/* Vendor Portal Card */}
                <div className="group p-8 bg-card border border-border rounded-2xl hover:border-brand-primary transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="w-14 h-14 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-primary/20 transition-colors">
                        <Store className="text-brand-primary w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-3">Vendor Portal</h2>
                    <p className="text-muted-foreground mb-8">
                        Manage your marketplace, inventory, and track your shop's performance.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/auth/vendorLogin"
                            className="w-full py-3 px-6 bg-brand-primary text-white text-center rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                            Vendor Login
                        </Link>
                        <Link
                            href="/auth/vendorRegister"
                            className="w-full py-3 px-6 border border-brand-primary text-brand-primary text-center rounded-lg font-medium hover:bg-brand-primary/5 transition-colors"
                        >
                            Become a Vendor
                        </Link>
                    </div>
                </div>

                {/* Admin Portal Card */}
                <div className="group p-8 bg-card border border-border rounded-2xl hover:border-brand-secondary transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="w-14 h-14 bg-brand-secondary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-secondary/20 transition-colors">
                        <ShieldCheck className="text-brand-secondary w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-3">Admin Panel</h2>
                    <p className="text-muted-foreground mb-8">
                        Access platform-wide settings, manage vendors, and oversee marketplace health.
                    </p>
                    <Link
                        href="/auth/adminLogin"
                        className="block w-full py-3 px-6 bg-brand-secondary text-brand-secondary-foreground text-center rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        Administrator Login
                    </Link>
                </div>

            </div>

            {/* Footer / Customer Link */}
            <div className="mt-12 text-center">
                <p className="text-muted-foreground">
                    Are you a customer?{' '}
                    <Link href="/auth/customerLogin" className="text-brand-primary font-medium hover:underline">
                        Go to Shopping Login
                    </Link>
                </p>
            </div>
        </div>
    );
}