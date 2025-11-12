import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/LogoSmit.png";
import bgImage from "../images/Sony3.jpeg";
import { toast } from "react-toastify";
import axios from "axios";

function SignUp() {
  const [signUpForm, setSignUpForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    cpassword: ""
  });

  const nav = useNavigate();

  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (user.role === 'admin') {
        nav('/admin');
      } else {
        nav('/Home');
      }
    }
  }, [nav]);

  const handleClick = async (e) => {
    e.preventDefault();

    const { name, email, phone, password, cpassword } = signUpForm;

    // Validation
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!password) {
      toast.error("Password is required");
      return;
    }

    if (password !== cpassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
        phone,
        address: {
          street: "",
          city: "",
          state: "",
          pincode: "",
          country: "India"
        }
      });

      // Save token and user info to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("loggedIn", true);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Registration successful!");
      nav("/Home");
    } catch (err) {
      console.error("Registration Error:", err);
      
      if (err.response) {
        toast.error(err.response.data.msg || err.response.data.error || "Registration failed");
      } else if (err.request) {
        toast.error("No response from server. Please check if backend is running.");
      } else {
        toast.error("Error: " + err.message);
      }
    }
  };

  const handleCh = (e) => {
    const { name, value } = e.target;
    setSignUpForm({ ...signUpForm, [name]: value });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background image */}
      <div className="fixed inset-0 z-0">
        <img
          src={bgImage}
          alt="Background"
          className="w-full h-full object-cover"
        />
        {/* Overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen p-4 py-12">
        <div className="max-w-xl w-full mx-auto">
          {/* Card */}
          <div className="bg-white/15 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 md:p-10">
            {/* Logo with rounded rectangle background */}
            <div className="text-center mb-8">
              <div className="inline-block bg-white/25 backdrop-blur-lg p-5 rounded-2xl border-2 border-white/40 shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  className="h-16 sm:h-20 hover:scale-105 transition-transform duration-300"
                  src={logo}
                  alt="Logo"
                />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-white drop-shadow-lg">Create Account</h2>
              <p className="mt-2 text-sm text-gray-100 drop-shadow-md">Join us and start capturing memories</p>
            </div>
            
            <form onSubmit={handleClick}>
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="text-white text-sm font-semibold mb-2 block drop-shadow-md">
                    Full Name <span className="text-red-300">*</span>
                  </label>
                  <input
                    name="name"
                    value={signUpForm.name}
                    type="text"
                    onChange={handleCh}
                    className="bg-white/20 text-white placeholder-gray-200 border-2 border-white/40 w-full text-sm px-4 py-3.5 rounded-xl outline-none focus:border-white/70 focus:bg-white/30 focus:ring-2 focus:ring-white/30 transition-all hover:bg-white/25 hover:border-white/50 backdrop-blur-md"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Email and Phone in a row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-semibold mb-2 block drop-shadow-md">
                      Email <span className="text-red-300">*</span>
                    </label>
                    <input
                      name="email"
                      value={signUpForm.email}
                      type="email"
                      onChange={handleCh}
                      className="bg-white/20 text-white placeholder-gray-200 border-2 border-white/40 w-full text-sm px-4 py-3.5 rounded-xl outline-none focus:border-white/70 focus:bg-white/30 focus:ring-2 focus:ring-white/30 transition-all hover:bg-white/25 hover:border-white/50 backdrop-blur-md"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-semibold mb-2 block drop-shadow-md">
                      Phone Number
                    </label>
                    <input
                      name="phone"
                      value={signUpForm.phone}
                      type="tel"
                      onChange={handleCh}
                      className="bg-white/20 text-white placeholder-gray-200 border-2 border-white/40 w-full text-sm px-4 py-3.5 rounded-xl outline-none focus:border-white/70 focus:bg-white/30 focus:ring-2 focus:ring-white/30 transition-all hover:bg-white/25 hover:border-white/50 backdrop-blur-md"
                      placeholder="10-digit number"
                      pattern="[0-9]{10}"
                      maxLength="10"
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-white text-sm font-semibold mb-2 block drop-shadow-md">
                      Password <span className="text-red-300">*</span>
                    </label>
                    <input
                      name="password"
                      value={signUpForm.password}
                      type="password"
                      onChange={handleCh}
                      className="bg-white/20 text-white placeholder-gray-200 border-2 border-white/40 w-full text-sm px-4 py-3.5 rounded-xl outline-none focus:border-white/70 focus:bg-white/30 focus:ring-2 focus:ring-white/30 transition-all hover:bg-white/25 hover:border-white/50 backdrop-blur-md"
                      placeholder="Min. 6 characters"
                      required
                      minLength="6"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-semibold mb-2 block drop-shadow-md">
                      Confirm Password <span className="text-red-300">*</span>
                    </label>
                    <input
                      name="cpassword"
                      value={signUpForm.cpassword}
                      type="password"
                      onChange={handleCh}
                      className="bg-white/20 text-white placeholder-gray-200 border-2 border-white/40 w-full text-sm px-4 py-3.5 rounded-xl outline-none focus:border-white/70 focus:bg-white/30 focus:ring-2 focus:ring-white/30 transition-all hover:bg-white/25 hover:border-white/50 backdrop-blur-md"
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] border-2 border-white/50 hover:border-white/70 backdrop-blur-lg drop-shadow-lg"
                >
                  Create Account
                </button>
              </div>
            </form>

            <p className="text-gray-100 text-sm mt-6 text-center drop-shadow-md">
              Already have an account?{" "}
              <a href="/Login" className="text-white hover:text-gray-100 font-semibold underline decoration-2 underline-offset-2 transition-colors drop-shadow-lg">
                Sign In
              </a>
            </p>
          </div>

          {/* Footer text */}
          <p className="text-center text-gray-100 text-xs mt-6 drop-shadow-md">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
