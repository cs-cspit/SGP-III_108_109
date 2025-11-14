// import React, { useEffect } from 'react'
// import { useNavigate } from 'react-router';

// function Protected(props) {
//     const { Pro } = props
//     const nav = useNavigate();
//     const logIn = localStorage.getItem("loggedIn");
//     useEffect(() =>{
//          if(!logIn){
//             nav("/Login")
//          }

         
//     })
//   return (
//     <div>
//       <Pro  />
//     </div>
//   )
// }

// export default Protected


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function Protected({ Pro }) {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Please login to access this page");
        nav("/Login");
        return;
      }

      // Check if user is admin and trying to access customer routes
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        if (userData.role === 'admin') {
          toast.info("Redirecting to admin dashboard");
          nav("/admin");
          return;
        }
      }

      try {
        // Verify token with backend
        await axios.get("http://localhost:5000/api/auth/protected", {
          headers: { "x-auth-token": token },
        });
        setLoading(false); // token is valid
      } catch (err) {
        // Token is invalid or expired
        localStorage.removeItem("token");
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("user");
        // Don't remove rememberedUser - keep credentials for next login
        toast.error("Session expired. Please login again.");
        nav("/Login");
      }
    };

    checkAuth();
  }, [nav]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <Pro />;
}

export default Protected;
