import Link from 'next/link';
import { ShieldCheck, Store, User, ShieldHalf } from 'lucide-react';

export default function AuthCenter() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="w-full ">

                {/* Header */}
                <div className="mb-8">
                    <span className="inline-flex items-center gap-1.5 text-theme-xxs font-semibold uppercase tracking-widest text-muted-foreground bg-muted border border-border rounded-full px-3 py-1 mb-4">
                        <ShieldHalf size={12} />
                        Auth center
                    </span>
                    <h1 className="text-theme-h4 font-semibold text-foreground mb-1.5">
                        Welcome to Techsonance
                    </h1>
                    {/* <p className="text-theme-body-sm text-muted-foreground">
                        Select your portal to sign in or get started.
                    </p> */}
                 </div>

        

                    {/* Vendor */}
                   <div className="group bg-card border border-border hover:border-border/80 rounded-2xl p-6 flex flex-col transition-colors duration-150">
                        <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center mb-5 text-green-700">
                            <Store size={20} />
                        </div>
                        <p className="text-theme-xxs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                            Seller
                        </p>
                        <h2 className="text-theme-body font-semibold text-foreground mb-2">
                            Vendor portal
                        </h2>
                        <p className="text-theme-body-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                            Manage your listings, inventory, orders, and track your store's performance.
                        </p>
                        <div className="flex flex-col gap-2">
                            <Link
                                href="/auth/vendorLogin"
                                className="w-full py-2 px-4 bg-blue-700 hover:bg-blue-800 text-blue-50 text-theme-body-sm font-medium text-center rounded-lg transition-colors"
                            >
                                Sign in as vendor
                            </Link>
                            <Link
                                href="/auth/vendorRegister"
                                className="w-full py-2 px-4 border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-theme-body-sm font-medium text-center rounded-lg transition-colors"
                            >
                                Become a vendor →
                            </Link>
                        </div>
                    </div>


 
            </div>
        </div>
    );
}