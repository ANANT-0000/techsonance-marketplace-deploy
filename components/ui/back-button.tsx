'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface BackButtonProps {
    /** The URL to route to if there is no browser history (e.g. opened in a new tab) */
    fallbackUrl?: string;
    /** How many steps to jump back in history. Use 2 to skip an intermediate redirect page. */
    steps?: number;
    /** Optional text label to show next to the icon on larger screens */
    label?: string;
    className?: string;
}

export function BackButton({
    fallbackUrl = '/',
    steps = 1,
    label = "Back",
    className = ""
}: BackButtonProps) {
    const router = useRouter();
    const [hasHistory, setHasHistory] = useState(true);

    useEffect(() => {
        // Safe check to ensure we are on the client and history exists
        // window.history.length <= 2 usually means the user opened a direct link in a new tab
        if (typeof window !== 'undefined' && window.history.length <= 2) {
            setHasHistory(false);
        }
    }, []);

    const handleBack = () => {
        if (hasHistory) {
            // Jumps back the specified number of steps, bypassing intermediate redirects instantly
            window.history.go(-Math.abs(steps));
        } else {
            // Safely push to the fallback URL instead of kicking the user out of the app
            router.push(fallbackUrl);
        }
    };

    return (
        <Button
            onClick={handleBack}
            className={` flex items-center justify-center gap-2  sm:w-auto rounded-md   transition-colors ${className}`}
            aria-label="Go back"
        >
            <ArrowLeft size={20} className="shrink-0" />
            {/* Hides the text on mobile to save space, shows on sm: screens and up */}
            <span className="hidden sm:inline-block font-medium text-sm h-full text-center align-middle ">
                {label}
            </span>
        </Button>
    );
}