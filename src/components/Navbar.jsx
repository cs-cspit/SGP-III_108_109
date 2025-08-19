import React, {  useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import NavLogo from "../images/LogoHeader.png";
import { BarChart, ChevronFirst, Heart, LogOut, ShoppingCart } from "lucide-react";


function Navbar() {
  const nav = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    nav("/Login");
  };
  const login = localStorage.getItem("loggedIn");
  const [click,setClick] = useState(false)
//   const {cart} = useMyContext();
  const  handleProfile = () => {
     if(login){
      console.log(login);
      setClick(true);
      nav("/Profile");
     }
    
    
  };

//   const countArr = []
//   cart.map((item,i=0) => {
//     console.log(item);
    
//      countArr[i] = item.count;
//      i += 1;
//   })
//   console.log(countArr);
  
  return (
    <>
    <div className="bg-linear-to-r/srgb from-gray-500 to-gray-300 w-full">
      <nav class="bg-white border-gray-200 w-full ">
        <div class="max-w-screen flex flex-wrap items-center justify-between mx-1 p-4">
          <div className="flex">
            
            <div className="navbar-start items-center  justify-between max-md:w-full">
              <a
                href="#"
                class="flex items-end space-x-3 rounded-2xl rtl:space-x-reverse"
              >
                <img
                  src={NavLogo}
                  class="h-9 justify-start rounded-2xl"
                  alt="Navbar Logo"
                />

                {/* <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              Flowbite
            </span> */}
              </a>
            </div>
          </div>
           
          {/* <br></br> */}
          {/* <button
            data-collapse-toggle="navbar-dropdown"
            type="button"
            class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-dropdown"
            aria-expanded="false"
          >
            <span class="sr-only">Open main menu</span>
            <svg
              class="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button> */}
          <div class="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul class="font-medium flex flex-col p-4 md:p-0 mt-4 justify-end border border-gray-100 rounded-lg  md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <NavLink  
                  to="/Home"
                  style={({ isActive }) => ({
                    color: isActive ? "gray" : "black",
                    fontWeight: isActive ? "bold" : "normal",
                    textDecoration: "none",
                    marginRight: "15px",
                  })}
                  // aria-current="page"
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/Products"
                  style={({ isActive }) => ({
                    color: isActive ? "gray" : "black",
                    fontWeight: isActive ? "bold" : "normal",
                    textDecoration: "none",
                    marginRight: "15px",
                  })}
                >
                  Products
                </NavLink>
              </li>
              {/* <li>
                <NavLink
                  to="/Favorite"
                  style={({ isActive }) => ({
                    color: isActive ? "red" : "black",
                    fontWeight: isActive ? "bold" : "normal",
                    textDecoration: "none",
                    marginRight: "15px",
                  })} 
                >
                  <FaHeart size={23} />
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/Cart"
                  style={({ isActive }) => ({
                    color: isActive ? "gray" : "black",
                    fontWeight: isActive ? "bold" : "normal",
                    textDecoration: "none",
                    marginRight: "15px",
                  })}
                >
                   {<h1 className="ml-5 flex justify-end "><ShoppingCart /> {cart.length != 0 ? (countArr.reduce((total,val) =>{return total + val})): (0)}</h1>}
                  
                </NavLink>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  class="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-gray-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                >
                  <LogOut />
                </button>
              </li> */}
            </ul>

            {/* <ul class="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <NavLink
                  to="/Home"
                  style={({ isActive }) => ({
                    color: isActive ? "blue" : "black",
                    fontWeight: isActive ? "bold" : "normal",
                    textDecoration: "none",
                    marginRight: "15px",
                  })}
                  // aria-current="page"
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/EmpDB"
                  style={({ isActive }) => ({
                    color: isActive ? "blue" : "black",
                    fontWeight: isActive ? "bold" : "normal",
                    textDecoration: "none",
                    marginRight: "15px",
                  })}
                >
                  EmployeeDB
                </NavLink>
              </li>
              <li>
                <Link
                  href="#"
                  class="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                >
                  Todo App
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  class="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                >
                  Contact
                </a>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  class="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                >
                  Logout
                </button>
              </li>
              <li>
                <div class="profile-image">
                  {login == "dhruv@gmail.com" ? (
                    <img
                      src={profileLogo1}
                      alt="Your Profile"
                      class="w-10 h-10 rounded-full object-cover object-center ring-2 ring-gray-300"
                    />
                  ) : (
                    console.log("")
                  )}

                  {login == "narendra.modi@gmail.com" ? (
                    <img
                      src={profileLogo2}
                      alt="Your Profile"
                      class="w-10 h-10 rounded-full object-cover object-center ring-2 ring-gray-300"
                    />
                  ) : (
                    console.log("")
                  )}
                </div>
              </li>
            </ul> */}
          </div>
        </div>
      </nav>
    </div>
    </>
  );
}

export default Navbar;
