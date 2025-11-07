import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../images/LogoHeader.png';
import { toast } from 'react-toastify';
import axios from 'axios';

function SignIn() {
  const [signInForm, setSignInForm] = useState({
    email: '',
    password: '',
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
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      // Save token and user info to localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('loggedIn', true);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      toast.success('Login successful!');
      
      // Redirect based on user role
      if (res.data.user.role === 'admin') {
        nav('/admin');
      } else {
        nav('/Home');
      }
    } catch (err) {
      console.error(err.response?.data?.msg);
      toast.error(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div>
      <div className="bg-[url('./images/SonyBackground.jpg')] bg-fixed bg-cover flex flex-col justify-center sm:h-screen p-4">
        <div className="max-w-md w-full mx-auto border justify-center border-gray-400 rounded-2xl shadow-2xs p-8 bg-white">
          <div className="text-center mb-12"></div>
          <img
            className="w-50 ml-25 h-3 sm:h-18 rounded-2xl shadow-xl mx-1.5 border-b-blue-300"
            src={logo}
            alt=""
          />
          <br />
          <form>
            <div className="space-y-6">
              <div>
                <label className="text-slate-800 text-sm font-medium mb-2 block">
                  Email Id
                </label>
                <input
                  name="email"
                  value={signInForm.email}
                  type="text"
                  onChange={handleCh}
                  className="text-slate-800 bg-white border border-slate-300 w-full text-sm px-4 py-3 rounded-md outline-gray-500"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="text-slate-800 text-sm font-medium mb-2 block">
                  Password
                </label>
                <input
                  name="password"
                  value={signInForm.password}
                  type="password"
                  onChange={handleCh}
                  className="text-slate-800 bg-white border border-slate-300 w-full text-sm px-4 py-3 rounded-md outline-gray-500"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <div className="mt-12">
              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-96"
                onClick={handleClick}
              >
                Sign In
              </button>
            </div>
          </form>
          <p className="text-slate-800 text-sm mt-6 text-center">
            Don't have an account?{' '}
            <a href="/" className="text-gray-600">
              Register Here
            </a>{' '}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;