import { useEffect } from "react";
import { LoaderSpinner } from "./LoaderSpinner";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { useRouter } from "next/router";

export function ProtectedRoute({
    children,
    allowedRoles
}: {
    children: React.ReactNode,
    allowedRoles: string[]
}) {
    const router = useRouter();
    const { isAuthenticated, user, loading } = useAppSelector(
        (state: RootState) => state.auth
    );

    // allowedRoles is string[], so use .includes() — not bracket notation
    const userRole = user?.role?.toLowerCase() ?? null;
    const isAuthorized = userRole !== null && allowedRoles
        .map(r => r.toLowerCase())
        .includes(userRole);

    useEffect(() => {
        if (loading) return; // wait for auth state to resolve

        if (!isAuthenticated || !isAuthorized) {
            router.replace('/unauthorized');
        }
    }, [isAuthenticated, isAuthorized, loading, router]);

    // Show spinner while auth state is loading
    if (loading) return <LoaderSpinner />;

    // Prevent flash of protected content before redirect fires
    if (!isAuthenticated || !isAuthorized) return <LoaderSpinner />;

    return <>{children}</>;
}