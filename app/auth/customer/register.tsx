import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { passwordValidationSchema } from "../../../utils/validation";
import poster from "../../../../assets/customer form poster.png";
import axios from "axios";
import { CUSTOMER_BASE_URL } from "../../../constants/constants";
import { useDispatch } from "react-redux";
interface FormData {
    customer_name: string | null,
    customer_email: string | null,
    password: string | null,
    password_confirm: string | null,
}

export function CustomerRegister() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormData>({
        customer_name: null,
        customer_email: null,
        password: null,
        password_confirm: null,
    })
    const dispatch = useDispatch()
    const [error, setError] = useState<string | null>(null);
    const [passwordMatchError, setPasswordMatchError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value }: { name: string; value: string } = e.target;
        if (!name) return;
        if (value === null) return;

        if (name == 'password') {
            passwordValidationSchema.safeParse(value).success ? setPasswordMatchError(null) : setPasswordMatchError("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character");
        }
        if (name == 'confirm_password') {
            console.log(value)
            if (formData.password !== value || formData.password == null) {
                setPasswordMatchError("Passwords do not match");
                return;
            }
            setPasswordMatchError(null);
        }
        setFormData({
            ...formData,
            [name]: value
        });
    }
    const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        formData.password == null || formData.password_confirm == null ? setPasswordMatchError("Passwords must be filled") : setPasswordMatchError(null);
        try {
            axios.post(`${CUSTOMER_BASE_URL}/register`, {
                user_role: 'customer',
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                password: formData.password,
                password_confirm: formData.password_confirm,
            }).then((response) => {
                console.log(response.data);
                if (response.status === 200) {
                    console.log('Registration successful');
                    navigate(`/customerLogin`);
                }
            })

        } catch (error: unknown) {
            console.log(error)
            throw new Error("Registration failed");
        }
        console.log(formData)
    }

    return (
        <>
            <main className="flex justify-around items-center border h-[100vh]">
                <img src={poster} alt="" className="z-10 absolute right-4/12  lg:h-[655px] lg:w-[655px] md:h-[300px] md:w-[300px] rounded-l-4xl rounded-r-[6rem]" />
                <form onSubmit={(e) => submitHandler(e)} className="flex bg-white z-20 flex-col border rounded-r-4xl rounded-l-[6rem] ml-60 px-12  py-6 justify-center w-[560px] " >
                    <h1 className="  lg:text-[1.5rem] md:text-[1rem] text-center  ">Create an account</h1>
                    <p className=" text-[.7rem] text-slate-600 mb-4 text-center">Join to Find great products .</p>
                    <div className="flex flex-col gap-4 mb-4">
                        <div className="flex flex-col  text-[.8rem] gap-2">
                            <label htmlFor="name" className="  ">Full name</label>
                            <input type="text" placeholder="Enter your full name" name="name" required className="border rounded-[.5rem] py-1 px-3" onChange={(e) => handleChange(e)} />
                        </div>
                        <div className="flex flex-col  text-[.8rem] gap-2">
                            <label htmlFor="email" className="  ">Email</label>
                            <input type="text" placeholder="Enter your email" name="email" required className="border rounded-[.5rem] py-1 px-3" onChange={(e) => handleChange(e)} />
                        </div>
                        <div className="flex flex-col text-[.8rem] gap-2">
                            <label htmlFor="confirm password">Password<span className="text-red-600">*</span></label>
                            <input type="password" placeholder='Password' name="password" id="" required className="border rounded-[.5rem] py-1 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => handleChange(e)} />
                            {/* <p className="text-[.6rem] text-slate-500  ">Must be at least 8 characters.</p> */}
                        </div>
                        <div className="flex flex-col gap-2 text-[.8rem] w-full ">
                            <label htmlFor="confirm password">Confirm Password<span className="text-red-600">*</span></label>
                            <input type="password" name="confirm_password" id="" className="border-2 py-1 px-3 rounded-xl" placeholder="Please reenter  password" onChange={(e) => handleChange(e)} />
                        </div>
                    </div>
                    <button type="submit" className="bg-blue-500 text-[.8rem] text-center  text-white py-[.3rem]  rounded-xl mb-3 ">
                        Create Account
                    </button>


                    <p className="w-full flex justify-center text-center items-center   text-[.6rem] text-slate-800 ">
                        Already have an account?
                        <Link to={`/customerLogin`} className=" ml-1 *:
                        
                        text-blue-500 underline  ">Log in</Link>
                    </p>


                </form>

            </main>
            <Outlet />
        </>
    )
}