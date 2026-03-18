import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { passwordValidationSchema } from "../../../utils/validation";

import axios from "axios";
import { CUSTOMER_BASE_URL, CUSTOMER_LOGIN_POSTER } from "../../../constants/constants";
import { useDispatch } from "react-redux";
import { loginFailure, loginStart, loginSuccess } from "../../../features/auth/authSlice";
interface FormData {
  customer_email: string | null,
  password: string | null,

}
export function CustomerLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    customer_email: null,
    password: null,
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dispatch = useDispatch()
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value }: { name: string; value: string } = e.target;
    if (!name) return;
    if (value === null) return;
    if (name == 'password') {
      passwordValidationSchema.safeParse(value).success ? setErrorMessage(null) : setErrorMessage("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character");
    }
    setFormData({
      ...formData,
      [name]: value
    });
  }
  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      axios.post(`${CUSTOMER_BASE_URL}/login`, {
        customer_email: formData.customer_email,
        password: formData.password,
      }).then((response) => {
        console.log(response.data);
        dispatch(loginSuccess(response.data));
        if (response.status === 200) {
          console.log('Registration successful');
          navigate(`/`);
        }
      })

    } catch (error: unknown) {
      console.log(error)
      dispatch(loginFailure("Login failed"));
      throw new Error("Registration failed");
    }


    console.log(formData)
  }

  return (
    <>
      <main className="flex justify-center items-center border h-[100vh]">
        <img src={CUSTOMER_LOGIN_POSTER} alt="" className="lg:h-[380px] lg:w-[380px] md:h-[300px] md:w-[300px] rounded-l-[4rem] rounded-r-0" />
        <form onSubmit={(e) => submitHandler(e)} className="flex bg-white  flex-col border rounded-xl     px-12  py-8 justify-center w-[400px] h-[460px]  " >
          <h1 className="  lg:text-[1.5rem] md:text-[1rem] text-center  my-1">Welcome</h1>
          <p className=" text-[.7rem] text-slate-600 mb-6 text-center">Welcome back! Find great products.</p>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col  text-[.8rem] gap-2">
              <label htmlFor="email" className="  ">Email</label>
              <input type="text" placeholder="Enter your email" name="email" required className="border rounded-[.5rem] py-1 px-3" onChange={(e) => handleChange(e)} />
            </div>
            <div className="flex flex-col text-[.8rem] gap-2">
              <span className="flex justify-between">
                <label htmlFor="confirm password">Password</label>
                <Link to={`/${CUSTOMER_BASE_URL}/forgot-password`} className="text-blue-500 underline text-[.7rem] ml-auto">Forget Password?</Link>
              </span>
              <input type="password" placeholder='Password' name="password" id="" required className="border rounded-[.5rem] py-1 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => handleChange(e)} />

              {errorMessage ? <p className="text-red-500 text-[.7rem]">{errorMessage}</p> : <p className="text-[.6rem] text-slate-500  ">Must be at least 8 characters.</p>}
            </div>

          </div>
          <button type="submit" className="bg-blue-500 text-[.8rem] text-center  text-white py-[.3rem]  rounded-xl mb-3 ">
            Login
          </button>
          <p className="w-full flex justify-center text-center items-center   text-[.6rem] text-slate-800 ">
            don't have an account?
            <Link to={`/customerRegister`} className=" ml-1 text-blue-500 underline  ">Create account</Link>
          </p>
        </form>
      </main>
      <Outlet />
    </>
  )
}