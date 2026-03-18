'use client';
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { RootState } from '@/Redux store/store';

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
    const router = useRouter();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
    const userRoleType = user?.user_role_id ? allowedRoles[user.user_role_id - 1] : null;
    const isAuthorized = userRoleType && allowedRoles.includes(userRoleType);

    useEffect(() => {
        if (!isAuthenticated || !isAuthorized) {
            router.replace('/unauthorized');
        }
    }, [isAuthenticated, isAuthorized, router]);

    if (!isAuthenticated || !isAuthorized) return null;
    return <>{children}</>
}