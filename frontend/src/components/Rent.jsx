import axios from "axios";
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Heart, Search, Star, ShoppingCart, Filter, X } from "lucide-react";
import { useMyContext } from "./CartContext";
import { toast } from "react-toastify";


function Rent() {
  const [rentItems, setRentItems] = useState([]);
  const [originalRentItems, setOriginalRentItems] = useState([]);

  
  const { cart, setCart, toggleFavorite, isFavorite } = useMyContext();
  const { rec, setRec } = useMyContext();

  const { quantity, setQuantity} = useMyContext();
  const [search, setSearch] = useState({
    tit: "",
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleFav = (id, item) => {
    const wasAdded = toggleFavorite(item);
    if (wasAdded) {
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
    } else {
      toast.warning("Removed From Favorites", {
        autoClose: 1000,
      });
    }
  };
  const addToCart = (item, id) => {
    const inCart = cart?.find((cartItem) => cartItem.id === id);
    if (inCart) {
      setCart((data) => 
        data.map((cartItem) => 
          cartItem.id === id && cartItem.count < 10 
            ? { ...cartItem, count: cartItem.count + 1 } 
            : cartItem
        )
      );
      toast.success("Quantity is Increased!", {
        autoClose: 1000,
      });
    } else {
      const cartItem = {
        ...item,
        id: item._id, // Ensure consistent ID field
        count: 1
      };
      setCart([...cart, cartItem]);
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
  const fetchRentItems = () => {
    axios
      .get("http://localhost:5000/api/cameras")
      .then((res) => {
        console.log(res.data);
        setRentItems(res.data);
        setOriginalRentItems(res.data);
        // setRec(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleSearch = (e) => {
    const { name, value } = e.target;
    setSearch({ ...search, [name]: value });
    
    // Real-time search as user types
    if (value.trim() === '') {
      setRentItems(originalRentItems);
    } else {
      const searchTerm = value.toLowerCase().trim();
      const filteredData = originalRentItems.filter((item) => {
        const itemName = item.name.toLowerCase();
        // Split search term by spaces to match multiple words
        const searchWords = searchTerm.split(' ').filter(word => word.length > 0);
        
        // Check if all search words are found anywhere in the item name
        return searchWords.every(word => itemName.includes(word));
      });
      setRentItems(filteredData);
    }
  };
  
  const handleSearchClick = () => {
    // Manual search button click (same logic as real-time)
    const searchTerm = search.tit.toLowerCase().trim();
    
    if (!searchTerm) {
      setRentItems(originalRentItems);
      return;
    }
    
    const searchWords = searchTerm.split(' ').filter(word => word.length > 0);
    const filteredData = originalRentItems.filter((item) => {
      const itemName = item.name.toLowerCase();
      return searchWords.every(word => itemName.includes(word));
    });
    
    setRentItems(filteredData);
  };
  
  const resetSearch = () => {
    setSearch({ tit: "" });
    setRentItems(originalRentItems);
  };
  useEffect(() => {
    fetchRentItems();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-300 rounded-full opacity-15 blur-3xl"></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gray-100 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Fixed Navbar */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>

        {/* Header Section */}
        <section className="pt-32 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Equipment <span className="text-gray-600">Rental</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional photography equipment for rent. High-quality cameras, lenses, and accessories for your perfect shoot.
            </p>
          </div>
        </section>

        {/* Search Section */}
        <section className="pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search equipment... (e.g., 'Canon camera', 'lens 50mm', 'tripod')"
                    value={search.tit}
                    name="tit"
                    onChange={(e) => handleSearch(e)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchClick()}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
                    onClick={handleSearchClick}
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                  {search.tit && (
                    <button 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2" 
                      onClick={resetSearch}
                    >
                      <X className="w-4 h-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Products Grid */}
        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rentItems.map((item) => {
                return (
                  <div key={item._id} className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex justify-end mb-4">
                      <button
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleFav(item._id, item)}
                      >
                        {isFavorite(item._id) ? (
                          <Heart className="w-6 h-6 text-red-500 fill-current" />
                        ) : (
                          <Heart className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors duration-200" />
                        )}
                      </button>
                    </div>

                    <div className="mb-6">
                      <div className="h-48 w-full overflow-hidden rounded-xl bg-gray-100">
                        <img
                          className="h-full w-full object-cover object-center hover:scale-105 transition-transform duration-300"
                          src={item.image_url}
                          alt={item.name}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 hover:text-gray-700 transition-colors duration-200">
                        {item.name}
                      </h3>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium">Fast Delivery</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">Best Price</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-gray-900">
                            ₹{item.price}
                            <span className="text-sm font-normal text-gray-500">/day</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold text-gray-900">{item.rating}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => addToCart(item, item._id)}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

export default Rent;
