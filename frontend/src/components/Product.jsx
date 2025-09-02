import axios from "axios";
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { BiHeart, BiSearch } from "react-icons/bi";
import { useMyContext } from "./CartContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaHeart } from "react-icons/fa";
import { FaStar } from "react-icons/fa";


function Product() {
  const [products, setProducts] = useState([]);

  
  const { cart,setCart } = useMyContext();
  const { fav, setFav } = useMyContext();
  const { rec, setRec } = useMyContext();

  const { quantity, setQuantity} = useMyContext();
  const [search, setSearch] = useState({
    tit: "",
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [category, setCategory] = useState("");
  const [showCat, setShowCategory] = useState([]);
  const [showCat1, setShowCat1] = useState([]);
  const [showCat2, setShowCat2] = useState([]);
  const [showCat3, setShowCat3] = useState([]);

  const handleCategory = (e) => {
    e.preventDefault();
    var flag = 0;

    var cat = [...showCat1];
    var cat1 = [...showCat];
    var cat2 = [...showCat2];
    var cat3 = [...showCat3];
    // var cat1 = [...products,showCat];
    // console.log(cat1)

    // if (category == "Marriage") {
    //   cat = showCat1.filter((item) => item.category == category);
    //   setProducts(cat);
    // } else if (category == "Birthday") {
    //   cat1 = showCat.filter((item) => item.category == category);
    //   setProducts(cat1);
    // } else if (category == "Party") {
    //   cat2 = showCat2.filter((item) => item.category == category);
    //   setProducts(cat2);
    // } else if (category == "") {
    //   cat3 = showCat3.filter((item) => item.category == category);
    //   setProducts(cat3);
    // }
  };
  const handleCat = (e) => {
    setCategory(e.target.value);
  };
  const handleFav = (id, pro) => {
    console.log(fav);
    const alreadyThere = fav?.find((item) => item.id === id);
    if (fav.includes(alreadyThere)) {
      // console.log("Helle lin 55");
      const f = fav.filter((item) => item.id !== id);
      setFav(f);
      toast.warning("Removed From Favorites", {
        autoClose: 1000,
      });
    } else {
      toast.success("Added To Favorites❤️!", {
        theme: "light",
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setFav([...fav, pro]);
    }
  };
  const addToCart = (pro, id) => {
    // console.log(cart);

    const inCart = cart?.find((item) => item.id === id);
    if (cart.includes(inCart)) {
      console.log(cart);
      setCart((data) => data.map((item) => item.id === id && item.count != 10 ?{...item,count:item.count+1}: item));
      toast.success("Quantity is Increased!", {
        autoClose: 1000,
      });
    } else {
      setCart([...cart,{...pro,count:1}]);
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
      const inRec = cart?.find((item) => item.category === pro.category);
      if (!cart.includes(inRec)) {
        var cat = [...showCat1];
        var cat1 = [...showCat];
        var cat2 = [...showCat2];
        var cat3 = [...showCat3];
        // var cat1 = [...products,showCat];
        // console.log(cat1)
        // console.log(pro.category);

        // if (pro.category == "Marriage") {
        //   cat = showCat1.filter((item) => item.category == pro.category);

        //   setRec(rec.concat(cat));
        //   console.log(rec);

        //   console.log(cat);
        // } else if (pro.category == "Birthday") {
        //   cat1 = showCat.filter((item) => item.category == pro.category);
        //   setRec(rec.concat(cat1));
        // } else if (pro.category == "Party") {
        //   cat2 = showCat2.filter((item) => item.category == pro.category);
        //   setRec(rec.concat(cat2));
        // } 
      }
    }
  };
  const fetchProducts = () => {
    axios
      .get("http://localhost:5000/api/cameras")
      .then((res) => {
        console.log(res.data);
        setProducts(res.data);
        setShowCategory(res.data);
        setShowCat1(res.data);
        setShowCat2(res.data);
        setShowCat3(res.data);
        // setRec(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleSearch = (e) => {
    const { name, value } = e.target;
    setSearch({ ...search, [name]: value });
  };
  const handleSearchClick = () => {
    const newData = products.filter((item) =>
      item.title.toLowerCase().includes(search.tit.toLowerCase())
    );
    // console.log(res.data);
    setProducts(newData);
  };
  useEffect(() => {
    fetchProducts();
  }, []);
  return (
    <>
      <div className="flex h-vh bg-[url('./images/SonyBackground.jpg')] bg-cover bg-no-repeat bg-fixed">
        <div className="flex-1">
          <div className="sticky top-0">
            <Navbar />
          </div>

          <section className="py-8">
            <div className="flex justify-center">
              <input
                type="text"
                placeholder="Search"
                value={search.tit}
                name="tit"
                onChange={(e) => handleSearch(e)}
                className="bg-gray-50 border border-gray-300  text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-75 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              ></input>
              <button className="btn btn-dark" onClick={handleSearchClick}>
                <div>
                  <BiSearch size={35} />
                </div>
              </button>
              <div>
                <select
                  id="countries"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  onClick={(e) => handleCategory(e)}
                  onChange={(e) => handleCat(e)}
                >
                  <option selected value="all">
                    Choose a Category
                  </option>
                  <option value="Marriage">Marriage</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Party">Party</option>
                </select>
              </div>
            </div>
            <br></br>
            <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
              <ToastContainer />
              <div className="mb-4 grid gap-4 sm:grid-cols-2 md:mb-8 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((pro) => {
                  return (
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                      <button
                        className="place-self-end object-fill"
                        onClick={() => handleFav(pro._id, pro)}
                      >
                        {fav?.find((item) => item.id === pro._id) ? (
                          <FaHeart className="text-red-500" size={25} />
                        ) : (
                          <BiHeart className="" size={25} />
                        )}
                      </button>

                      <div className="h-56 w-full">
                        <a href="#">
                          {" "}
                          <img
                            className="mx-auto h-full w-full object-cover object-center rounded"
                            src={pro.image_url}
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
                          {pro.name}
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
                            RS. {pro.price}
                          </p>
                          <p className=" font-semibold leading-tight text-gray-900 dark:text-white">
                            {pro.rating}<FaStar className="inline text-yellow-500 mb-1" />
                          </p>
                        </div>
                      </div>
                      <br></br>
                      <div className="flex justify-center">
                        <button
                          onClick={() => addToCart(pro, pro._id)}
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

export default Product;
