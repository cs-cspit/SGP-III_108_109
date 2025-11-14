import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import Footer from './Footer';
import { useMyContext } from './CartContext';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Search, 
  Grid3X3, 
  List, 
  Trash2, 
  Eye
} from 'lucide-react';

function Favorite() {
  const navigate = useNavigate();
  const { fav, setFav, cart, setCart } = useMyContext();
  const [loading, setLoading] = useState(true);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  

  
  useEffect(() => {
    fetchFavoriteItems();
  }, [fav, setFav]); // Added setFav as dependency

  const fetchFavoriteItems = async () => {
    if (fav.length === 0) {
      setFavoriteItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const favoriteItemsFormatted = fav.map((favItem) => ({
        _id: favItem.id,
        name: favItem.name,
        price: favItem.price,
        image_url: favItem.image_url,
        rating: favItem.rating || 4.0
      }));
      
      setFavoriteItems(favoriteItemsFormatted);
      
    } catch (error) {
      setFavoriteItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = (itemId) => {
    const updatedFav = fav.filter(favItem => favItem.id !== itemId);
    setFav(updatedFav);
    toast.success('Removed from favorites', {
      position: 'top-right',
      autoClose: 2000
    });
  };

  const handleAddToCart = (item) => {
    const existingCartItem = cart.find(cartItem => cartItem.id === item._id);
    
    if (existingCartItem) {
      setCart(prev => 
        prev.map(cartItem => 
          cartItem.id === item._id 
            ? { ...cartItem, count: cartItem.count + 1 }
            : cartItem
        )
      );
    } else {
      const cartItem = {
        id: item._id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        rating: item.rating,
        count: 1
      };
      setCart(prev => [...prev, cartItem]);
    }
    
    toast.success('Added to cart!', {
      position: 'top-right',
      autoClose: 2000
    });
  };

  const handleQuickView = (item) => {
    // Navigate to detailed view or show modal
    navigate(`/Rent?highlight=${item._id}`);
  };

  const filteredAndSortedItems = favoriteItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredAndSortedItems.map((item) => (
        <div key={item._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
          {/* Image Section */}
          <div className="relative h-48 w-full overflow-hidden rounded-xl bg-gray-100">
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover object-center hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                if (e.target.src !== 'https://via.placeholder.com/300x300/e5e7eb/6b7280?text=Camera') {
                  e.target.src = 'https://via.placeholder.com/300x300/e5e7eb/6b7280?text=Camera';
                }
              }}
            />
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleQuickView(item);
                  }}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                  title="Quick View"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart(item);
                  }}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                  title="Add to Cart"
                >
                  <ShoppingCart className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Remove from Favorites */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRemoveFromFavorites(item._id);
              }}
              className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors group z-10"
              title="Remove from Favorites"
            >
              <Heart className="w-5 h-5 text-red-500 fill-current" />
            </button>
          </div>
          
          {/* Content Section */}
          <div className="p-6">
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                {item.name}
              </h3>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(item.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {item.rating} ({Math.floor(Math.random() * 100) + 10} reviews)
                </span>
              </div>
            </div>
            
            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(item.price)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(item.price * 0.1)}/day rent
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart(item);
                  }}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredAndSortedItems.map((item) => (
        <div key={item._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="flex items-center p-6">
            {/* Image */}
            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (e.target.src !== 'https://via.placeholder.com/96x96/e5e7eb/6b7280?text=Cam') {
                    e.target.src = 'https://via.placeholder.com/96x96/e5e7eb/6b7280?text=Cam';
                  }
                }}
              />
            </div>
            
            {/* Content */}
            <div className="flex-1 ml-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">
                    {item.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(item.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {item.rating}
                    </span>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center space-x-4">
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(item.price)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(item.price * 0.1)}/day rent
                    </p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuickView(item);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Quick View"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(item);
                    }}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    Add to Cart
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFromFavorites(item._id);
                    }}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    title="Remove from Favorites"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      
      {/* Main Content */}
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                My Favorites
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Your carefully curated collection of photography equipment
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search favorites..."
                    value={searchTerm}
                    onChange={(e) => {
                      e.preventDefault();
                      setSearchTerm(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    e.preventDefault();
                    setSortBy(e.target.value);
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setViewMode('grid');
                  }}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setViewMode('list');
                  }}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{favoriteItems.length}</span> favorites
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{filteredAndSortedItems.length}</span> showing
                </div>
                {favoriteItems.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Total value: <span className="font-semibold text-gray-900">
                      {formatCurrency(favoriteItems.reduce((sum, item) => sum + item.price, 0))}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                
                {favoriteItems.length > 0 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to clear all favorites?')) {
                          localStorage.removeItem('PVFstudio_favorites');
                          setFav([]);
                          toast.success('All favorites cleared!');
                        }
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium flex items-center space-x-2 border border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear All</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        favoriteItems.forEach(item => handleAddToCart(item));
                      }}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center space-x-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add All to Cart</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : favoriteItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <Heart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  No favorites yet
                </h3>
                <p className="text-gray-600 mb-8">
                  Start building your favorite collection by adding equipment you love from our rental catalog.
                </p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate('/Rent');
                  }}
                  className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                >
                  Browse Equipment
                </button>
              </div>
            </div>
          ) : filteredAndSortedItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <Search className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  No results found
                </h3>
                <p className="text-gray-600 mb-8">
                  Try adjusting your search terms to find what you're looking for.
                </p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSearchTerm('');
                    setSortBy('name');
                  }}
                  className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                >
                  Clear Search
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              {viewMode === 'grid' ? renderGridView() : renderListView()}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Favorite;
