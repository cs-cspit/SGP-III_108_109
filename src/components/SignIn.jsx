import React, { useState } from "react";
// import Home from "./Home";
import { useNavigate } from "react-router";
import logo from "../images/LogoHeader.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

function SignIn() {
  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
  });

  const handleCh = (e) => {
    const { name, value } = e.target;
    setSignInForm({ ...signInForm, [name]: value });
  };

  const nav = useNavigate();

const handleClick = async (e) => {
  e.preventDefault();
  const { email, password } = signInForm;

  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });

    // Save token to localStorage
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("loggedIn", true); // so Protected.jsx can detect it

    toast.success("Login successful!");
    nav("/Home");
  } catch (err) {
    console.error(err.response?.data?.msg);
    toast.error(err.response?.data?.msg || "Login failed");
  }
};

  return (
    <div>
      <div class="bg-[url('./images/SonyBackground.jpg')] bg-fixed bg-cover flex flex-col justify-center sm:h-screen p-4 ">
        <div class="max-w-md w-full mx-auto border justify-center border-gray-400  rounded-2xl shadow-2xs p-8  bg-white">
          <ToastContainer />
          <div class="text-center mb-12"></div>
          <img
            class="w-50 ml-25 h-3 sm:h-18 rounded-2xl shadow-xl mx-1.5 border-b-blue-300"
            src={logo}
            alt=""
          ></img>
          <br></br>
          <form>
            <div class="space-y-6">
              <div>
                <label class="text-slate-800 text-sm font-medium mb-2 block">
                  Email Id
                </label>
                <input
                  name="email"
                  value={signInForm.email}
                  type="text"
                  onChange={handleCh}
                  class="text-slate-800 bg-white border border-slate-300 w-full text-sm px-4 py-3 rounded-md outline-gray-500"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label class="text-slate-800 text-sm font-medium mb-2 block">
                  Password
                </label>
                <input
                  name="password"
                  value={signInForm.password}
                  type="password"
                  onChange={handleCh}
                  class="text-slate-800 bg-white border border-slate-300 w-full text-sm px-4 py-3 rounded-md outline-gray-500"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <div class="mt-12">
              <button
                type="button"
                class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-96"
                onClick={handleClick}
              >
                Sign In
              </button>
            </div>
          </form>
          <p class="text-slate-800 text-sm mt-6 text-center">
            Don't have an account?{" "}
            <a href="/" class="text-gray-600">
              Register Here
            </a>{" "}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
