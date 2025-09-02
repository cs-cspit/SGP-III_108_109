
import { useState } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { useMyContext } from "./CartContext";
import { BiHeart } from "react-icons/bi";
import { FaHeart } from "react-icons/fa";




function Favorite() {
  
  const { fav,setFav }  = useMyContext();

  const handleRemove = (id) =>{
    const fa = fav.filter((item) => item.id !== id)
    setFav(fa)
  }
  return (
    <>
      <div className="flex h-vh bg-[url('./images/Background.jpg')]  bg-no-repeat bg-fixed">
        
        <div className="flex-1">
          <div className="sticky top-0">
            <Navbar />
          </div>

          <section className="py-8">
            
            <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
              {/* <ToastContainer /> */}
              <div className="mb-4 grid gap-4 sm:grid-cols-2 md:mb-8 lg:grid-cols-3 xl:grid-cols-4">
                {fav.map((pro) => {
                  return (
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                      <button onClick={() =>  handleRemove(pro.id)}  >
                        <FaHeart className="text-red-500" size={25} />
                      </button>
                      <div className="h-56 w-full">
                        <a href="#">
                          {" "}
                          <img
                            className="mx-auto h-full"
                            src={pro.image}
                            alt=""
                          />
                        </a>
                      </div>
                      <div className="pt-6">
                        <div className="mb-4 flex items-center justify-between gap-4">
                          {/* <span className="me-2 rounded bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-300"> Up to 35% off </span> */}

                          <div className="flex items-center justify-end gap-1"></div>
                        </div>

                        <a
                          href="#"
                          className="text-lg font-semibold leading-tight text-gray-900 hover:underline dark:text-white"
                        >
                          {pro.title}
                        </a>

                        <ul className="mt-2 flex items-center gap-4">
                          <li className="flex items-center gap-2">
                            {/* <svg
                          className="h-4 w-4 text-gray-500 dark:text-gray-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 7h6l2 4m-8-4v8m0-8V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v9h2m8 0H9m4 0h2m4 0h2v-4m0 0h-5m3.5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-10 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
                          />
                        </svg> */}
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Fast Delivery
                            </p>
                          </li>

                          <li className="flex items-center gap-2">
                            {/* <svg
                          className="h-4 w-4 text-gray-500 dark:text-gray-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-width="2"
                            d="M8 7V6c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1h-1M3 18v-7c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1H4a1 1 0 0 1-1-1Zm8-3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                          />
                        </svg> */}
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Best Price
                            </p>
                          </li>
                        </ul>

                        <div className="mt-4 flex items-end justify-between gap-4">
                          <p className="text-2xl font-extrabold leading-tight text-gray-900 dark:text-white">
                            ${pro.price}
                          </p>
                          <p className=" font-semibold leading-tight text-gray-900 dark:text-white">
                            {pro.category}
                          </p>
                        </div>
                      </div>
                      <br></br>
                      
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
           <div className="flex flex-col min-h-screen">
           <main className="flex-1">
              {/* <h1>Welcome</h1> */}
           </main>
           <Footer />
         </div>
        </div>
      </div>
    </>
  );
}

export default Favorite;
