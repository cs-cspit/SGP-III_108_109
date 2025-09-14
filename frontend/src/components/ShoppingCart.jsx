import React from "react";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useMyContext } from "./CartContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Minus, Plus } from "lucide-react";
import { NavLink } from "react-router";

function ShoppingCart() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { cart, setCart } = useMyContext();
  const { rec, setRec } = useMyContext();
  const { increase, decrease } = useMyContext();
  // const { handleIncrease,handleDecrease } = useMyContext();
  cart.map((item) => {
    console.log(item);
  });

  const handleRemove = (pro) => {
    const dt = cart.filter((item) => item.id !== pro.id);
    setCart(dt);
    var cat1 = [];
    const checkRec = dt?.find((item) => item.category === pro.category);
    console.log(checkRec);

    if (!dt.includes(checkRec)) {
      cat1 = rec.filter((item) => item.category !== pro.category);
      console.log("bdb", cat1);
      setRec(cat1);
    }

    // console.log(rec);

    // console.log(cat);

    // else if (pro.category == "men's clothing") {
    //   cat1 = showCat.filter((item) => item.category == pro.category);
    //   setRec([...rec,cat1]);
    // } else if (pro.category == "electronics") {
    //   cat2 = showCat2.filter((item) => item.category == pro.category);
    //   setRec([...rec,cat2]);
    // } else if (pro.category == "jewelery") {
    //   cat3 = showCat3.filter((item) => item.category == pro.category);
    //   setRec([...rec,cat3]);
    // }
    toast.success("Removed Successfully", {
      theme: "light",
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  const addToCart = (pro, id) => {
    // console.log(cart);

    const inCart = cart?.find((item) => item.id === id);
    if (cart.includes(inCart)) {
      console.log(cart);
      setCart((data) =>
        data.map((item) =>
          item.id === id && item.count != 10
            ? { ...item, count: item.count + 1 }
            : item
        )
      );
      toast.success("Quantity is Increased!", {
        autoClose: 1000,
      });
    } else {
      setCart([...cart, { ...pro, count: 1 }]);
      toast.success("Added Successfully!", {
        theme: "light",
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };
  return (
    <>
      <div className="flex h-vh bg-[url('./images/Background.jpg')]  bg-cover bg-no-repeat bg-fixed">
        
        <div className="flex-1">
          <div className="sticky top-0">
            <Navbar />
          </div>
          <section className="py-8 ">
            <br></br>
            <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
              <ToastContainer />
              <div className="mb-4 grid gap-4 sm:grid-cols-2 md:mb-8 lg:grid-cols-3 xl:grid-cols-4">
                {cart.map((pro) => {
                  return (
                    <div className="rounded-lg max-w-md border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:max-w-2xl">
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
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Fast Delivery
                            </p>
                          </li>

                          <li className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Best Price
                            </p>
                          </li>
                        </ul>

                        <div className="mt-4 flex items-end justify-between gap-4">
                          <p className="font-semibold leading-tight text-gray-900 dark:text-white">
                            Quantity :{" "}
                            <button onClick={() => decrease(pro.id)}>
                              {" "}
                              <Minus size={15} />{" "}
                            </button>{" "}
                            {pro.count}{" "}
                            <button onClick={() => increase(pro.id)}>
                              {" "}
                              <Plus size={15} />{" "}
                            </button>
                          </p>
                        </div>
                        <div className="mt-4 flex items-end justify-between gap-4">
                          <p className="text-2xl font-extrabold leading-tight text-gray-900 dark:text-white">
                            ${pro.price * pro.count}
                          </p>
                        </div>

                        <p className=" font-semibold leading-tight text-gray-900 dark:text-white">
                          {pro.category}
                        </p>
                      </div>
                      <br></br>
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleRemove(pro)}
                          className=" text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800"
                        >
                          Remove Item
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {cart.length > 0 ? (
              <div>
                <div className="flex justify-center">
                  <button className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800">
                    Pay $
                    {cart?.reduce(
                      (total, val) => total + val.price * val.count,
                      0
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-center">
                  <NavLink
                    to="/Rent"
                    style={({ isActive }) => ({
                      color: isActive ? "gray" : "black",
                      fontWeight: isActive ? "bold" : "normal",
                      textDecoration: "none",
                      marginRight: "15px",
                    })}
                  >
                    Rent
                  </NavLink>
                </div>
              </div>
            )}
          </section>
          <section className="py-8">
            <br></br>
            <div className="mx-auto mt-35 max-w-md overflow-hidden rounded-xl bg-white shadow-md md:max-w-2xl text-center">
              Recommended For You
            </div>
            <br></br>
            <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
              <div className="mb-4 grid gap-4 sm:grid-cols-2 md:mb-8 lg:grid-cols-3 xl:grid-cols-4">
                {rec.map((pro) => {
                  return (
                    <div className="rounded-lg max-w-md border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:max-w-2xl">
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
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Fast Delivery
                            </p>
                          </li>

                          <li className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Best Price
                            </p>
                          </li>
                        </ul>

                        <div className="mt-4 flex items-end justify-between gap-4">
                          <p className="text-2xl font-extrabold leading-tight text-gray-900 dark:text-white">
                            ${pro.price}
                          </p>
                        </div>
                        <p className=" font-semibold leading-tight text-gray-900 dark:text-white">
                          {pro.category}
                        </p>
                      </div>
                      <br></br>
                      <div className="flex justify-center">
                        <button
                          onClick={() => addToCart(pro, pro.id)}
                          className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
         <div className="flex flex-col ">
            {/* <main className="flex-1"><h1>Welcome</h1></main> */}
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}

export default ShoppingCart;
