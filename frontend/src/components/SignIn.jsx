import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import logo from "../images/LogoSmit.png";
import bgImage from "../images/Sony3.jpeg"; // Using a consistent background image
import { LogIn } from "lucide-react";

function SignIn() {
  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const nav = useNavigate();

  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const rememberedUser = localStorage.getItem("rememberedUser");

    // If token exists, verify if user is logged in
    if (token) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (user.role === "admin") {
        nav("/admin");
      } else {
        nav("/Home");
      }
      return;
    }

    // Load remembered credentials if available
    if (rememberedUser) {
      const userData = JSON.parse(rememberedUser);
      setSignInForm({
        email: userData.email,
        password: userData.password,
      });
      setRememberMe(true);
    }
  }, [nav]);

  const handleCh = (e) => {
    const { name, value } = e.target;
    setSignInForm({ ...signInForm, [name]: value });
  };

  const handleClick = async (e) => {
    e.preventDefault();
    const { email, password } = signInForm;

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!password) {
      toast.error("Password is required");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      // Save token and user info to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("loggedIn", true);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem(
          "rememberedUser",
          JSON.stringify({ email, password })
        );
      } else {
        localStorage.removeItem("rememberedUser");
      }

      toast.success("Login successful!");

      // Redirect based on user role
      if (res.data.user.role === "admin") {
        nav("/admin");
      } else {
        nav("/Home");
      }
    } catch (err) {
      console.error("Login Error:", err);
      toast.error(
        err.response?.data?.msg || err.response?.data?.error || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background image - fully visible */}
      <div className="fixed inset-0">
        <img
          src={bgImage}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen p-4 py-12">
        <div className="max-w-md w-full mx-auto">
          {/* Glassmorphism Card with near-white transparency */}
          <div className="bg-white/15 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 md:p-10">
            {/* Logo with transparent background */}
            <div className="text-center mb-8">
              <div className="inline-block bg-white/25 backdrop-blur-lg p-5 rounded-2xl border-2 border-white/40 shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  className="h-20 sm:h-24 hover:scale-105 transition-transform duration-300 drop-shadow-2xl"
                  src={logo}
                  alt="Logo"
                />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-white drop-shadow-lg">
                Welcome Back
              </h2>
              <p className="mt-2 text-sm text-gray-100 drop-shadow-md">
                Sign in to continue your journey
              </p>
            </div>

            <form onSubmit={handleClick}>
              <div className="space-y-6">
                <div>
                  <label className="text-white text-sm font-semibold mb-2 block drop-shadow-md">
                    Email Address
                  </label>
                  <input
                    name="email"
                    value={signInForm.email}
                    type="email"
                    onChange={handleCh}
                    className="bg-white/20 text-white placeholder-gray-200 border-2 border-white/40 w-full text-sm px-4 py-3.5 rounded-xl outline-none focus:border-white/70 focus:bg-white/30 focus:ring-2 focus:ring-white/30 transition-all hover:bg-white/25 hover:border-white/50 backdrop-blur-md"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-semibold mb-2 block drop-shadow-md">
                    Password
                  </label>
                  <input
                    name="password"
                    value={signInForm.password}
                    type="password"
                    onChange={handleCh}
                    className="bg-white/20 text-white placeholder-gray-200 border-2 border-white/40 w-full text-sm px-4 py-3.5 rounded-xl outline-none focus:border-white/70 focus:bg-white/30 focus:ring-2 focus:ring-white/30 transition-all hover:bg-white/25 hover:border-white/50 backdrop-blur-md"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {/* Remember me and Forgot password */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 mr-2 rounded border-white/40 bg-white/20 text-white focus:ring-white/50 cursor-pointer"
                    />
                    <span className="text-gray-100 group-hover:text-white transition-colors drop-shadow-md">
                      Remember me
                    </span>
                  </label>
                  <a
                    href="#"
                    className="text-gray-100 hover:text-white font-medium transition-colors drop-shadow-md"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-2 border-white/50 hover:border-white/70 backdrop-blur-lg drop-shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing In...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
            </form>

            <p className="text-gray-100 text-sm mt-6 text-center drop-shadow-md">
              Don't have an account?{" "}
              <a
                href="/"
                className="text-white hover:text-gray-100 font-semibold underline decoration-2 underline-offset-2 transition-colors drop-shadow-lg"
              >
                Register Here
              </a>
            </p>
          </div>

          {/* Footer text */}
          <p className="text-center text-gray-100 text-xs mt-6 drop-shadow-md">
            © 2025 PVF Studio. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;