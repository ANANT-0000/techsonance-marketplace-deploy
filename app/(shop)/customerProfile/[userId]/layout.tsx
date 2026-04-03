
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ProfileSidebar } from "@/components/customer/ProfileSidebar";
import { TabNavBar } from "@/components/customer/TabNavBar";
import { UserRole } from "@/constants/constants";


export default function UserProfileLayout({ children }: { children: React.ReactNode }) {

    return (
        // <ProtectedRoute allowedRoles={[UserRole.Customer]}>
        <main className={`  xl:pt-10 pb-8   xl:px-32   lg:px-8 md:px-4 px-2 pt-1    min-h-[80dvh] flex lg:flex-row flex-col`}>
            <ProfileSidebar />
            {children}
        </main>
        // </ProtectedRoute>
    );
}
