'use client';
import { useEffect, useState } from "react";
import { loginStart, loginSuccess, loginFailure } from "@/lib/features/auth/authSlice";
import { adminLogin } from "@/utils/authApiClient";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/reduxHooks";

export default function AdminLoginPage() {
    const dispatch = useAppDispatch();
    const [adminLoginID, setAdminLoginID] = useState<string | null>(null);
    const [adminLoginPass, setAdminLoginPass] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedData = typeof window !== 'undefined' ? localStorage.getItem("auth") : null;
        const auth = storedData ? JSON.parse(storedData) : null;
        if (auth && auth?.isAuthenticated && auth?.user?.user_role
            === "admin") {
            setLoading(true);
            console.log("Already logged in as admin.");
            router.push(`/admin/${auth.user.id}`);
        }
        setLoading(false);
    }, []);
    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(loginStart());
        const result: { status: boolean, message: string, data?: any } = await adminLogin({ admin_id: adminLoginID!, password: adminLoginPass! });
        dispatch(result.status ? loginSuccess(result.data) : loginFailure(result.message));
        const userId = result.data?.user?.id;
        router.replace(`/admin/${userId}`);
        if (!result.status) {
            setError(result.message);
        } else {
            setError(null);
        }
    }


    return (
        <>
            <main className="flex font-[inter] justify-center items-center   h-[100vh]">
                {loading && <p>Loading...</p>}
                <form onSubmit={submitHandler} className={`${loading ? 'opacity-50' : ''} flex flex-col border rounded-2xl px-9 h-[580px] w-[540px] justify-center`}>
                    <p className="text-center font-bold text-[1.4rem] text-slate-600">Restricted Access</p>
                    <h1 className="font-bold text-[2rem] text-center mb-6">System Administration</h1>
                    <div className="flex flex-col gap-4 mb-8">
                        <div className="flex flex-col text-[1rem] gap-2">
                            <label htmlFor="email" className="font-bold">Admin ID / Email</label>
                            <input type="text" name="email" required className="border rounded-[.5rem] px-4 py-2" onChange={(e) => setAdminLoginID(e.target.value)} />
                        </div>
                        <div className="flex flex-col text-[1rem] gap-2">
                            <label htmlFor="password" className="font-bold">Secure Key / Password</label>
                            <input type="password" name="password" required className="border rounded-[.5rem] px-4 py-2" onChange={(e) => setAdminLoginPass(e.target.value)} />
                        </div>
                    </div>
                    {error && <p className="text-red-600 text-center font-bold mb-4">{error}</p>}
                    <button type="submit" className="bg-blue-500 text-center text-white font-bold py-2 rounded-xl mb-4">
                        Authenticate
                    </button>
                    <p className="text-center text-slate-500">
                        Unauthorized access is prohibited and monitored.
                    </p>
                </form>
            </main>
        </>
    )
}
