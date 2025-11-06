import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrowserRouter, Routes } from "react-router-dom";
import SignIn from "./SignIn";
import { useFormik } from "formik";
import { FormValidation } from "./FormValidation";
// import Home from "../pages/Home";
import logo from "../images/LogoHeader.png";
import axios from "axios";


// const UserKey = "UserInfos";
function SignUp() {
  const [signUpForm, setSignUpForm] = useState({
    email: "",
    password: "",
    cpassword: "",
  });

  // const [home, showHome] = useState(false);
  const nav = useNavigate();
  // localStorage.setItem("UserCredentials",)
  const handleClick = async (e) => {
    e.preventDefault();

    const { email, password, cpassword } = signUpForm;

    if (password !== cpassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        email,
        password,
        name: "DefaultUser" // or add name input in form
      });

      // Save token to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("loggedIn", email); // Optional

      alert("Registered successfully!");
      nav("/Home");
    } catch (err) {
    console.error("ERROR:", err);

    if (err.response) {
      // Server responded with a status outside 2xx
      console.error("Server Response:", err.response.data);
      alert(err.response.data.msg || "Registration failed");
    } else if (err.request) {
      // Request was made but no response
      console.error("No response received:", err.request);
      alert("No response from server. Is backend running?");
    } else {
      // Something else happened
      console.error("Error", err.message);
      alert("Error: " + err.message);
    }
  }

  };

  const handleCh = (e) => {
    const { name, value } = e.target;
    setSignUpForm({ ...signUpForm, [name]: value });
  };
  const { handleBlur, handleSubmit, errors } = useFormik({
    initialValues: signUpForm,
    validationSchema: FormValidation,
    onSubmit: (values) => {
      console.log(values);
    },
  });
  return (
    <>
      <div>
        <div class="bg-[url('./images/SonyBackground.jpg')] bg-fixed bg-cover flex flex-col justify-center sm:h-screen p-4 bg-linear-to-r/srgb from-white to-gray-500">
          <div class="max-w-md w-full mx-auto border border-gray-400  rounded-2xl p-8  bg-white">
            <div className="flex justify-center mx-auto">
              <br></br>
              <img
                class="w-50 h-7 sm:h-11 rounded-2xl shadow-2xl mx-1.5 border-b-blue-300"
                src={logo}
                alt=""
              ></img>
            </div>
            {/* <h1 class="text-black">Sign Up</h1> */}
            

            <form onSubmit={handleSubmit}>
              <div class="space-y-6">
                <div>
                    <label class="  text-slate-800 text-sm font-medium mb-2 block">
                      Email Id
                    </label>
                  <input
                    id="email"
                    name="email"
                    value={signUpForm.email}
                    type="text"
                    onChange={handleCh}
                    onBlur={handleBlur}
                    class="text-slate-800 bg-white border border-slate-300 w-full text-sm px-4 py-3 rounded-md outline-gray-500"
                    placeholder="Enter email"
                    required
                  />
                  <br></br>
                  {errors.email && <small>{errors.email}</small>}
                </div>
                <div>
                  <label class="text-slate-800 text-sm font-medium mb-2 block">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    value={signUpForm.password}
                    type="password"
                    onChange={handleCh}
                    onBlur={handleBlur}
                    class="text-slate-800 bg-white border border-slate-300 w-full text-sm px-4 py-3 rounded-md outline-gray-500"
                    placeholder="Enter password"
                    required
                  />
                  <br></br>
                  {errors.password && <small>{errors.password}</small>}
                </div>
                <div>
                  <label class="text-slate-800 text-sm font-medium mb-2 block">
                    Confirm Password
                  </label>
                  <input
                    name="cpassword"
                    value={signUpForm.cpassword}
                    type="password"
                    onChange={handleCh}
                    onBlur={handleBlur}
                    class="text-slate-800 bg-white border border-slate-300 w-full text-sm px-4 py-3 rounded-md outline-gray-500"
                    placeholder="Enter confirm password"
                    required
                  />
                  {errors.cpassword && <small>{errors.cpassword}</small>}
                </div>
              </div>

              <div class="mt-12">
                <button
                  type="submit"
                  class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-96"
                  onClick={(e) => handleClick(e)}
                >
                  Sign Up
                </button>
              </div>
            </form>
            <p class="text-slate-800 text-sm mt-6 text-center">
              Already have an account?{" "}
              <a href="/Login" class="text-gray-600">
                Login here
              </a>{" "}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
// Break In 13:28PM to 14:10PM
export default SignUp;
