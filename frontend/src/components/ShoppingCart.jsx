import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import Footer from './Footer';
import { useMyContext } from './CartContext';
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft,
  Heart,
  Star
} from 'lucide-react';

function ShoppingCart() {
  const navigate = useNavigate();
  const { cart, setCart, increase, decrease, getCartTotal, getCartItemCount, clearCart } = useMyContext();
  const [loading, setLoading] = useState(false);

  // Handle removing item from cart
  const handleRemoveItem = (itemId) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    toast.success('Item removed from cart', {
      position: 'top-right',
      autoClose: 2000
    });
  };

  // Handle quantity increase
  const handleIncrease = (itemId) => {
    increase(itemId);
    toast.success('Quantity increased', {
      position: 'top-right',
      autoClose: 1000
    });
  };

  // Handle quantity decrease
  const handleDecrease = (itemId) => {
    decrease(itemId);
    toast.success('Quantity decreased', {
      position: 'top-right',
      autoClose: 1000
    });
  };

  // Handle clear entire cart
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      clearCart();
      toast.success('Cart cleared successfully', {
        position: 'top-right',
        autoClose: 2000
      });
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty', {
        position: 'top-right',
        autoClose: 2000
      });
      return;
    }
    
    // Navigate to checkout page
    navigate('/Checkout');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Go Back"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Shopping Cart
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'} in your cart
                  </p>
                </div>
              </div>
              
              {cart.length > 0 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClearCart();
                  }}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium flex items-center space-x-2 border border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Cart</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Cart Content */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 mb-8">
                  Start adding some photography equipment to your cart to see them here.
                </p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate('/Rent');
                  }}
                  className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
              {/* Cart Items */}
              <div className="lg:col-span-7">
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                      <div className="flex items-center p-6">
                        {/* Image */}
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <img
                            src={item.image_url || item.image}
                            alt={item.name || item.title}
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
                                {item.name || item.title}
                              </h3>
                              
                              {/* Rating */}
                              {item.rating && (
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
                              )}
                              
                              {/* Category */}
                              {item.category && (
                                <p className="text-sm text-gray-500 mb-3">
                                  {item.category}
                                </p>
                              )}
                              
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
                            
                            {/* Remove Button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveItem(item.id);
                              }}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove from Cart"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-700">Quantity:</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDecrease(item.id);
                                  }}
                                  className="p-1 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                  disabled={item.count <= 1}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-medium">
                                  {item.count}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleIncrease(item.id);
                                  }}
                                  className="p-1 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                  disabled={item.count >= 10}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Subtotal */}
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                {formatCurrency(item.price * item.count)}
                              </p>
                              <p className="text-sm text-gray-500">
                                Subtotal
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-5 mt-16 lg:mt-0">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Order Summary
                  </h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items ({getCartItemCount()})</span>
                      <span className="font-medium">{formatCurrency(getCartTotal())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">{formatCurrency(getCartTotal() * 0.18)}</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(getCartTotal() * 1.18)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCheckout();
                    }}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium mb-4"
                  >
                    Proceed to Checkout
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate('/Rent');
                    }}
                    className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Continue Shopping
                  </button>
                  
                  {/* Features */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Free shipping on orders over ₹5,000</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>30-day return policy</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Secure checkout with SSL encryption</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default ShoppingCart;
