import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import NavLogo from "../images/LogoSmit.png";
import { 
  BarChart, 
  Camera, 
  ChevronDown,
  Heart, 
  LogOut, 
  ShoppingCart, 
  User, 
  Menu,
  X,
  Star,
  Bell,
  Search
} from "lucide-react";
import { useMyContext } from "./CartContext";
import { toast } from 'react-toastify';
function Navbar() {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showBookingDropdown, setShowBookingDropdown] = useState(false);
  const userMenuRef = useRef(null);
  const bookingDropdownRef = useRef(null);
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (bookingDropdownRef.current && !bookingDropdownRef.current.contains(event.target)) {
        setShowBookingDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = async () => {
    try {
      // Check if user wants to keep credentials for next login
      const rememberedUser = localStorage.getItem("rememberedUser");
      
      // Clear authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("user");
      localStorage.removeItem("PVFstudio_cart");
      localStorage.removeItem("PVFstudio_favorites");
      
      // Keep rememberedUser if it exists (for "Remember Me" functionality)
      // If user didn't check "Remember Me", this will be null anyway
      
      // Show success message
      toast.success('Logged out successfully!');
      
      // Navigate to login page
      navigate("/Login");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    }
  };
  
  const login = localStorage.getItem("loggedIn");
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const { cart, getCartItemCount, fav } = useMyContext();
  
  const handleMenuItemClick = () => {
    setShowUserMenu(false);
    setShowMobileMenu(false);
    setShowBookingDropdown(false);
  };


  
  return (
    <nav className="bg-gray-100 shadow-lg border-b border-gray-300 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/Home" className="flex items-center space-x-3">
            <img
              src={NavLogo}
              className="h-10 w-auto rounded-lg"
              alt="PVF Studio"
            />
            <span className="hidden sm:block text-xl font-bold text-gray-800">
              PVF Studio
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/Home"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-white bg-gray-700'
                    : 'text-gray-700 hover:text-white hover:bg-gray-600'
                }`
              }
            >
              Home
            </NavLink>
            
            <NavLink
              to="/Rent"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-white bg-gray-700'
                    : 'text-gray-700 hover:text-white hover:bg-gray-600'
                }`
              }
            >
              Rent
            </NavLink>

            {/* Booking Dropdown */}
            <div className="relative group">
              <button className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-white hover:bg-gray-600 transition-colors duration-200">
                Booking
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <NavLink
                    to="/EquipmentBooking"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={handleMenuItemClick}
                  >
                    <div className="flex items-center">
                      <Camera className="w-5 h-5 mr-3 text-gray-500" />
                      <div>
                        <div className="font-medium">Equipment Rental</div>
                        <div className="text-xs text-gray-500">Rent cameras & equipment</div>
                      </div>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/MyBookings"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={handleMenuItemClick}
                  >
                    <div className="flex items-center">
                      <BarChart className="w-5 h-5 mr-3 text-gray-500" />
                      <div>
                        <div className="font-medium">My Bookings</div>
                        <div className="text-xs text-gray-500">View booking history</div>
                      </div>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/EventBooking"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={handleMenuItemClick}
                  >
                    <div className="flex items-center">
                      <Star className="w-5 h-5 mr-3 text-gray-500" />
                      <div>
                        <div className="font-medium">Event Photography</div>
                        <div className="text-xs text-gray-500">Book photo sessions</div>
                      </div>
                    </div>
                  </NavLink>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Favorites */}
            <NavLink
              to="/Favorite"
              className={({ isActive }) =>
                `relative p-2 rounded-full transition-colors duration-200 ${
                  isActive
                    ? 'text-white bg-gray-700'
                    : 'text-gray-600 hover:text-white hover:bg-gray-600'
                }`
              }
            >
              <Heart className="h-5 w-5" />
              {fav && fav.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {fav.length}
                </span>
              )}
            </NavLink>

            {/* Cart */}
            <NavLink
              to="/Cart"
              className={({ isActive }) =>
                `relative p-2 rounded-full transition-colors duration-200 ${
                  isActive
                    ? 'text-white bg-gray-700'
                    : 'text-gray-600 hover:text-white hover:bg-gray-600'
                }`
              }
            >
              <ShoppingCart className="h-5 w-5" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </NavLink>

            {/* User Menu */}
            {login ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-300 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    
                    <Link
                      to="/Dashboard"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={handleMenuItemClick}
                    >
                      <User className="w-4 h-4 mr-3 text-gray-500" />
                      Dashboard
                    </Link>
                    
                    <Link
                      to="/MyBookings"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={handleMenuItemClick}
                    >
                      <BarChart className="w-4 h-4 mr-3 text-gray-500" />
                      My Bookings
                    </Link>
                    
                    <Link
                      to="/Packages"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={handleMenuItemClick}
                    >
                      <Star className="w-4 h-4 mr-3 text-gray-500" />
                      Packages
                    </Link>
                    
                    <div className="border-t border-gray-100 mt-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/Login"
                className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-800 transition-colors duration-200"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition-colors duration-200"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-300 py-4 bg-gray-50">
            <div className="space-y-2">
              <NavLink
                to="/Home"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-white bg-gray-700'
                      : 'text-gray-700 hover:text-white hover:bg-gray-600'
                  }`
                }
                onClick={handleMenuItemClick}
              >
                Home
              </NavLink>
              
              <NavLink
                to="/Rent"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-white bg-gray-700'
                      : 'text-gray-700 hover:text-white hover:bg-gray-600'
                  }`
                }
                onClick={handleMenuItemClick}
              >
                Rent
              </NavLink>
              
              <div className="px-3 py-2">
                <div className="text-base font-medium text-gray-900 mb-2">Booking</div>
                <div className="ml-4 space-y-2">
                  <NavLink
                    to="/EquipmentBooking"
                    className="block px-3 py-2 text-sm text-gray-700 hover:text-white hover:bg-gray-600 rounded-md transition-colors duration-200"
                    onClick={handleMenuItemClick}
                  >
                    Equipment Rental
                  </NavLink>
                  <NavLink
                    to="/MyBookings"
                    className="block px-3 py-2 text-sm text-gray-700 hover:text-white hover:bg-gray-600 rounded-md transition-colors duration-200"
                    onClick={handleMenuItemClick}
                  >
                    My Bookings
                  </NavLink>
                  <NavLink
                    to="/EventBooking"
                    className="block px-3 py-2 text-sm text-gray-700 hover:text-white hover:bg-gray-600 rounded-md transition-colors duration-200"
                    onClick={handleMenuItemClick}
                  >
                    Event Photography
                  </NavLink>
                </div>
              </div>
              
              <NavLink
                to="/Favorite"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-white bg-gray-700'
                      : 'text-gray-700 hover:text-white hover:bg-gray-600'
                  }`
                }
                onClick={handleMenuItemClick}
              >
                <Heart className="h-5 w-5 mr-2" />
                Favorites
                {fav && fav.length > 0 && (
                  <span className="ml-auto bg-gray-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {fav.length}
                  </span>
                )}
              </NavLink>
              
              <NavLink
                to="/Cart"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-white bg-gray-700'
                      : 'text-gray-700 hover:text-white hover:bg-gray-600'
                  }`
                }
                onClick={handleMenuItemClick}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart
                {getCartItemCount() > 0 && (
                  <span className="ml-auto bg-gray-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
