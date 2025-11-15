import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import Footer from './Footer';
import { useMyContext } from './CartContext';
import {
  ArrowLeft,
  ShoppingBag,
  Lock,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  DollarSign,
  Package
} from 'lucide-react';

function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, getCartItemCount, clearCart } = useMyContext();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Form states
  const [shippingForm, setShippingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  const [paymentForm, setPaymentForm] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const [errors, setErrors] = useState({});

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !orderPlaced) {
      toast.error('Your cart is empty!');
      navigate('/Cart');
    }
  }, [cart, navigate, orderPlaced]);

  // Validate shipping form
  const validateShippingForm = () => {
    const newErrors = {};
    
    if (!shippingForm.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingForm.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingForm.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingForm.email)) newErrors.email = 'Invalid email';
    if (!shippingForm.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(shippingForm.phone.replace(/\D/g, ''))) newErrors.phone = 'Invalid phone number';
    if (!shippingForm.address.trim()) newErrors.address = 'Address is required';
    if (!shippingForm.city.trim()) newErrors.city = 'City is required';
    if (!shippingForm.state.trim()) newErrors.state = 'State is required';
    if (!shippingForm.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate payment form
  const validatePaymentForm = () => {
    const newErrors = {};
    
    if (!paymentForm.cardName.trim()) newErrors.cardName = 'Name on card is required';
    if (!paymentForm.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
    else if (!/^\d{16}$/.test(paymentForm.cardNumber.replace(/\s/g, ''))) newErrors.cardNumber = 'Invalid card number';
    if (!paymentForm.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
    else if (!/^\d{2}\/\d{2}$/.test(paymentForm.expiryDate)) newErrors.expiryDate = 'Use MM/YY format';
    if (!paymentForm.cvv.trim()) newErrors.cvv = 'CVV is required';
    else if (!/^\d{3,4}$/.test(paymentForm.cvv)) newErrors.cvv = 'Invalid CVV';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle shipping form submission
  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (validateShippingForm()) {
      setStep(2);
      toast.success('Shipping information saved!');
    }
  };

  // Handle payment form submission
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!validatePaymentForm()) return;

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate order ID
      const newOrderId = `ORD-${Date.now()}`;
      setOrderId(newOrderId);
      setOrderPlaced(true);

      // Clear cart
      clearCart();

      toast.success('Order placed successfully!');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/MyBookings');
      }, 3000);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Handle input changes
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePaymentChange = (e) => {
    let { name, value } = e.target;

    // Format card number with spaces
    if (name === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    // Format expiry date
    if (name === 'expiryDate') {
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
    }

    // Format CVV
    if (name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }

    setPaymentForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>

        <div className="pt-32 pb-16">
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <CheckCircle className="w-20 h-20 text-gray-800 animate-bounce" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Order Confirmed!
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                Thank you for your order
              </p>
              <p className="text-lg font-semibold text-gray-900 mb-8">
                Order ID: {orderId}
              </p>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-left">
                    <Package className="w-6 h-6 text-gray-700 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Total Items</p>
                      <p className="text-gray-600">{getCartItemCount()} items in your order</p>
                    </div>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex items-center space-x-4 text-left">
                    <Truck className="w-6 h-6 text-gray-700 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Delivery Status</p>
                      <p className="text-gray-600">Your order will be delivered within 3-5 business days</p>
                    </div>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex items-center space-x-4 text-left">
                    <Mail className="w-6 h-6 text-gray-700 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Confirmation Email</p>
                      <p className="text-gray-600">Check your email for order details</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/MyBookings')}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium mb-4"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate('/Rent')}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => {
                if (step === 2) {
                  setStep(1);
                } else {
                  navigate('/Cart');
                }
              }}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{step === 2 ? 'Back to Shipping' : 'Back to Cart'}</span>
            </button>
            
            <h1 className="text-3xl font-bold text-gray-900">
              Checkout
            </h1>
            <p className="text-gray-600 mt-2">
              {step === 1 ? 'Enter your shipping details' : 'Complete your payment'}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-12 flex items-center justify-center space-x-8">
            <div className={`flex flex-col items-center ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white mb-2 ${
                step >= 1 ? 'bg-gray-900' : 'bg-gray-300'
              }`}>
                {step > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
              </div>
              <span className="text-sm font-medium text-gray-700">Shipping</span>
            </div>

            <div className={`h-1 w-16 ${step > 1 ? 'bg-gray-900' : 'bg-gray-300'}`}></div>

            <div className={`flex flex-col items-center ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white mb-2 ${
                step >= 2 ? 'bg-gray-900' : 'bg-gray-300'
              }`}>
                2
              </div>
              <span className="text-sm font-medium text-gray-700">Payment</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              {/* Step 1: Shipping Form */}
              {step === 1 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                    <MapPin className="w-6 h-6 text-gray-900" />
                    <span>Shipping Address</span>
                  </h2>

                  <form onSubmit={handleShippingSubmit} className="space-y-6">
                    {/* Name Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={shippingForm.firstName}
                          onChange={handleShippingChange}
                          placeholder="John"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${
                            errors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.firstName}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={shippingForm.lastName}
                          onChange={handleShippingChange}
                          placeholder="Doe"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${
                            errors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.lastName}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email Row */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={shippingForm.email}
                        onChange={handleShippingChange}
                        placeholder="john@example.com"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>

                    {/* Phone Row */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingForm.phone}
                        onChange={handleShippingChange}
                        placeholder="9876543210"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>

                    {/* Address Row */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={shippingForm.address}
                        onChange={handleShippingChange}
                        placeholder="123 Main Street"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${
                          errors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.address}</span>
                        </p>
                      )}
                    </div>

                    {/* City, State, Zip Row */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={shippingForm.city}
                          onChange={handleShippingChange}
                          placeholder="New York"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${
                            errors.city ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.city && (
                          <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.city}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={shippingForm.state}
                          onChange={handleShippingChange}
                          placeholder="NY"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${
                            errors.state ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.state && (
                          <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.state}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={shippingForm.zipCode}
                          onChange={handleShippingChange}
                          placeholder="10001"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${
                            errors.zipCode ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.zipCode && (
                          <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.zipCode}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Country Row */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <select
                        name="country"
                        value={shippingForm.country}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                      >
                        <option>India</option>
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Canada</option>
                      </select>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center justify-center space-x-2 mt-8"
                    >
                      <span>Continue to Payment</span>
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </button>
                  </form>
                </div>
              )}

              {/* Step 2: Payment Form */}
              {step === 2 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                    <CreditCard className="w-6 h-6 text-gray-900" />
                    <span>Payment Details</span>
                  </h2>

                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    {/* Card Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name on Card *
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={paymentForm.cardName}
                        onChange={handlePaymentChange}
                        placeholder="John Doe"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${
                          errors.cardName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.cardName && (
                        <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.cardName}</span>
                        </p>
                      )}
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentForm.cardNumber}
                        onChange={handlePaymentChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all font-mono ${
                          errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.cardNumber && (
                        <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.cardNumber}</span>
                        </p>
                      )}
                    </div>

                    {/* Expiry and CVV Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={paymentForm.expiryDate}
                          onChange={handlePaymentChange}
                          placeholder="MM/YY"
                          maxLength="5"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all font-mono ${
                            errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.expiryDate && (
                          <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.expiryDate}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={paymentForm.cvv}
                          onChange={handlePaymentChange}
                          placeholder="123"
                          maxLength="4"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all font-mono ${
                            errors.cvv ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.cvv && (
                          <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.cvv}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 flex items-start space-x-3">
                      <Lock className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Secure Payment</p>
                        <p className="text-sm text-gray-700">Your payment information is encrypted and secure</p>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center justify-center space-x-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processing Payment...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          <span>Complete Purchase</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-start pb-4 border-b border-gray-100">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {item.name || item.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.count}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.price * item.count)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-gray-200 pt-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-gray-700">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-medium">{formatCurrency(getCartTotal() * 0.18)}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-gray-900">{formatCurrency(getCartTotal() * 1.18)}</span>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-3 bg-gray-100 p-3 rounded-lg">
                    <Truck className="w-5 h-5 text-gray-900 flex-shrink-0" />
                    <span className="text-sm text-gray-900">Free Shipping</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-gray-100 p-3 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-700 flex-shrink-0" />
                    <span className="text-sm text-gray-900">3-5 Business Days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Checkout;
