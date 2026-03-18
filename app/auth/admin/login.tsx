
import { useSelector, useDispatch } from "react-redux";
import poster from "../../../../assets/admin form poster.png";
import { useState } from "react";
import axios from "axios";

import { loginFailure, loginStart, loginSuccess } from "@/Redux store/features/auth/authSlice";
export function Login() {
    const { isAuthenticated,
        user,
        loading,
        error,
        token } = useSelector((state) => state.auth)
    const dispatch = useDispatch();
    const [adminLoginID, setAdminLoginID] = useState<string | null>(null);
    const [adminLoginPass, setAdminLoginPass] = useState<string | null>(null);

    const SubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        //  dispatch(loginStart());
        //     axios.post(`${import.meta.env.VITE_ADMIN_LOGIN_URL}/api/admin/login`, {
        //         admin_id: adminLoginID,
        //         password: adminLoginPass
        //     }).then((response:unknown) => {
        //         console.log(response.data);
        //         if (response.status === 200) {
        //               dispatch(loginSuccess({
        //                 user: response.data.user,
        //                 token: response.data.token  // Adjust according to API response structure
        //             }));
        //             console.log('Login successful');
        //         }
        //     }).catch((error:Error) => {
        //         dispatch(loginFailure(error.message));
        //         console.error('There was an error!', error);

        //     });
    }

    return (
        <>
            <main className="flex font-[inter] justify-center items-center border h-[100vh]">
                <form onSubmit={() => SubmitHandler} className="flex  flex-col border border-r-0 rounded-l-2xl       px-9 h-[580px] w-[540px]  justify-center " >
                    <p className="text-center  font-bold text-[1.4rem] text-slate-600">Restricted Access </p>
                    <h1 className=" font-bold  text-[2rem] text-center mb-6">System Administration</h1>
                    <div className="flex flex-col gap-4 mb-8">
                        <div className="flex flex-col  text-[1rem] gap-2">
                            <label htmlFor="email" className="font-bold ">Admin ID / Email</label>
                            <input type="text" name="email" required className="border rounded-[.5rem] px-4 py-2" onChange={(e) => setAdminLoginID(e.target.value)} />
                        </div>
                        <div className="flex flex-col text-[1rem] gap-2">
                            <label htmlFor="password" className="font-bold " >Secure Key / Password</label>
                            <input type="password" name="password" id="" required className="border rounded-[.5rem] px-4 py-2" onChange={(e) => setAdminLoginPass(e.target.value)} />
                        </div>
                    </div>
                    <button type="submit" className="bg-blue-500 text-center  text-white font-bold py-2  rounded-xl mb-4 ">
                        Authenticate
                    </button>
                    <p className="text-center text-slate-500 ">
                        Unauthorized access is prohibited and monitored.
                    </p>
                </form>
                <img src={poster} alt="" className="lg:h-[736px] lg:w-[440px] " />
            </main>
        </>
    )
}