import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function AdminProtected({ children }) {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      
      // Check if token exists
      if (!token) {
        toast.error("Please login to access this page");
        nav("/Login");
        return;
      }

      // Check if user data exists and role is admin
      if (user) {
        const userData = JSON.parse(user);
        
        if (userData.role !== 'admin') {
          toast.error("Access Denied! Admin privileges required.");
          nav("/Home"); // Redirect normal users to home
          return;
        }
      } else {
        toast.error("User data not found. Please login again.");
        nav("/Login");
        return;
      }

      try {
        // Verify token with backend
        const response = await axios.get("http://localhost:5000/api/auth/protected", {
          headers: { "x-auth-token": token },
        });

        // Double check role from backend response if available
        if (response.data.user && response.data.user.role !== 'admin') {
          toast.error("Access Denied! Admin privileges required.");
          nav("/Home");
          return;
        }

        setAuthorized(true);
        setLoading(false);
      } catch (err) {
        // Token is invalid or expired
        console.error("Admin auth error:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("user");
        toast.error("Session expired. Please login again.");
        nav("/Login");
      }
    };

    checkAdminAuth();
  }, [nav]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}

export default AdminProtected;
