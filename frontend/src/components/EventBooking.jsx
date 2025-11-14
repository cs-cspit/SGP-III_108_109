import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import { Calendar, Camera, Crown, Star } from 'lucide-react';
import { toast } from 'react-toastify';

const EventBooking = () => {
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [bookingData, setBookingData] = useState({
    eventType: 'Wedding',
    serviceType: 'custom',
    selectedPlan: null,
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '18:00'
  });
  const [eventDetails, setEventDetails] = useState({
    venue: '',
    contactPerson: '',
    contactPhone: '',
    specialRequirements: ''
  });

  useEffect(() => {
    fetchSubscriptionPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/subscriptions/plans');
      setSubscriptionPlans(response.data.data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/subscriptions/my-subscription', {
        headers: { 'x-auth-token': token }
      });
      setCurrentSubscription(response.data.data);
    } catch (error) {
      console.error('Error fetching current package:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('event.')) {
      const field = name.split('.')[1];
      setEventDetails(prev => ({ ...prev, [field]: value }));
    } else {
      setBookingData(prev => ({ ...prev, [name]: value }));
    }
  };

  const submitBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const bookingPayload = {
        bookingType: bookingData.serviceType === 'subscription' ? 'Function Shoot' : 'Event Coverage',
        eventType: bookingData.eventType,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        equipmentList: [], // Empty for event bookings
        eventDetails: {
          venue: eventDetails.venue || '',
          address: eventDetails.venue || '',
          contactPerson: eventDetails.contactPerson || '',
          contactPhone: eventDetails.contactPhone || '',
          specialRequirements: eventDetails.specialRequirements || ''
        },
        totalDays: Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24)) + 1,
        serviceType: bookingData.serviceType
      };

      if (bookingData.serviceType === 'subscription' && bookingData.selectedPlan) {
        bookingPayload.subscriptionPlanId = bookingData.selectedPlan._id;
      }

      console.log('=== Frontend: Submitting Event Booking ===');
      console.log('Booking Payload:', JSON.stringify(bookingPayload, null, 2));

      const response = await axios.post('http://localhost:5000/api/bookings/create', bookingPayload, {
        headers: { 'x-auth-token': token }
      });

      toast.success(`Event booking created successfully! Booking ID: ${response.data.bookingId}`);
      
      // Reset form
      setBookingData({
        eventType: 'Wedding',
        serviceType: 'custom',
        selectedPlan: null,
        startDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '18:00'
      });
      setEventDetails({
        venue: '',
        contactPerson: '',
        contactPhone: '',
        specialRequirements: ''
      });
    } catch (error) {
      console.error('=== Frontend: Event Booking Error ===');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Error creating event booking. Please try again.';
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.errors && Array.isArray(data.errors)) {
          // Validation errors array
          errorMessage = 'Validation Error: ' + data.errors.join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.details) {
          errorMessage = data.details;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  // Function to display package details
  const displayPackageDetails = (plan) => {
    const manpower = plan.manpower || {};
    const details = [];
    
    if (manpower.photographers > 0) {
      details.push(`${manpower.photographers} Photographer${manpower.photographers > 1 ? 's' : ''}`);
    }
    if (manpower.videographers > 0) {
      details.push(`${manpower.videographers} Videographer${manpower.videographers > 1 ? 's' : ''}`);
    }
    if (manpower.candidPhotographers > 0) {
      details.push(`${manpower.candidPhotographers} Candid Photographer${manpower.candidPhotographers > 1 ? 's' : ''}`);
    }
    if (manpower.cinematographers > 0) {
      details.push(`${manpower.cinematographers} Cinematographer${manpower.cinematographers > 1 ? 's' : ''}`);
    }
    if (manpower.droneOperators > 0) {
      details.push(`${manpower.droneOperators} Drone Operator${manpower.droneOperators > 1 ? 's' : ''}`);
    }
    
    return details.join(', ') || 'No manpower details';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-300 rounded-full opacity-15 blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>

        <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Event <span className="text-gray-600">Photography Booking</span>
              </h1>
              <p className="text-xl text-gray-600">
                Book professional photography services with custom packages or premium packages
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-8">
              {/* Service Type Selection */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Camera className="w-6 h-6 text-gray-600" />
                  Select Service Type
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div 
                    onClick={() => setBookingData(prev => ({ ...prev, serviceType: 'custom', selectedPlan: null }))}
                    className={`cursor-pointer border-2 rounded-xl p-6 transition-all ${
                      bookingData.serviceType === 'custom' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Star className="w-6 h-6 text-yellow-500" />
                      <h3 className="text-lg font-semibold">Custom Package</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Tailor-made photography service with flexible pricing based on your requirements.
                    </p>
                  </div>

                  <div 
                    onClick={() => setBookingData(prev => ({ ...prev, serviceType: 'subscription' }))}
                    className={`cursor-pointer border-2 rounded-xl p-6 transition-all ${
                      bookingData.serviceType === 'subscription' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Crown className="w-6 h-6 text-purple-500" />
                      <h3 className="text-lg font-semibold">Premium Packages</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Choose from our premium packages with pre-defined services and benefits.
                    </p>
                  </div>
                </div>

                {/* Event Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Event Type *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Wedding', 'Birthday', 'Corporate', 'Party', 'Portrait', 'Fashion', 'Product', 'Other'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setBookingData(prev => ({ ...prev, eventType: type }))}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          bookingData.eventType === type
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Package Selection */}
                {bookingData.serviceType === 'subscription' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Select Package *</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {subscriptionPlans.map((plan) => (
                        <div 
                          key={plan._id}
                          onClick={() => setBookingData(prev => ({ ...prev, selectedPlan: plan }))}
                          className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                            bookingData.selectedPlan?._id === plan._id 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">{plan.displayName}</h4>
                              <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                              <div className="mt-2 text-sm">
                                <p className="font-medium text-gray-900">₹{plan.price.toLocaleString()}</p>
                                <p className="text-gray-600">{displayPackageDetails(plan)}</p>
                              </div>
                            </div>
                            {bookingData.selectedPlan?._id === plan._id && (
                              <div className="bg-purple-500 rounded-full p-1">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {subscriptionPlans.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No packages available at the moment.</p>
                    )}
                  </div>
                )}

                {/* Current Subscription Display */}
                {bookingData.serviceType === 'subscription' && currentSubscription && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-semibold text-green-900 mb-3">
                      Your Active Package: {currentSubscription.subscriptionPlanId.displayName}
                    </h4>
                    <button
                      onClick={() => setBookingData(prev => ({ ...prev, selectedPlan: currentSubscription.subscriptionPlanId }))}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Use This Package for Booking
                    </button>
                  </div>
                )}
              </div>

              {/* Date & Time Selection */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Date & Time
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={bookingData.startDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={bookingData.endDate}
                      onChange={handleInputChange}
                      min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      name="startTime"
                      value={bookingData.startTime}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      name="endTime"
                      value={bookingData.endTime}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                    <input
                      type="text"
                      name="event.contactPerson"
                      value={eventDetails.contactPerson}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                      placeholder="Contact person name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone *</label>
                    <input
                      type="tel"
                      name="event.contactPhone"
                      value={eventDetails.contactPhone}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                      placeholder="Contact phone number"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue *</label>
                    <input
                      type="text"
                      name="event.venue"
                      value={eventDetails.venue}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                      placeholder="Event venue"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
                    <textarea
                      name="event.specialRequirements"
                      value={eventDetails.specialRequirements}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                      placeholder="Any special requirements..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  onClick={submitBooking}
                  disabled={
                    !bookingData.startDate || 
                    !bookingData.endDate || 
                    !eventDetails.contactPerson || 
                    !eventDetails.contactPhone || 
                    !eventDetails.venue ||
                    (bookingData.serviceType === 'subscription' && !bookingData.selectedPlan)
                  }
                  className="px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
                >
                  <Camera className="w-5 h-5" />
                  Confirm Event Booking
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default EventBooking;