import { useEffect } from "react";
import { LoaderSpinner } from "./LoaderSpinner";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { useRouter } from "next/navigation";

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


    useEffect(() => {
        if (loading) return; // wait for auth state to resolve
        const userRole = user?.role?.toLowerCase() ?? null;
        const isAuthorized = userRole !== null && allowedRoles
            .map(r => r.toLowerCase())
            .includes(userRole);

        if (!isAuthenticated || !isAuthorized) {
            router.replace('/unauthorized');
        }
    }, [isAuthenticated, loading, router]);

    // Show spinner while auth state is loading
    if (loading) return <LoaderSpinner />;
    const userRole = user?.role?.toLowerCase() ?? null;
    const isAuthorized = userRole !== null && allowedRoles
        .map(r => r.toLowerCase())
        .includes(userRole);
    // Prevent flash of protected content before redirect fires
    if (!isAuthenticated || !isAuthorized) return <LoaderSpinner />;

    return <>{children}</>;
}