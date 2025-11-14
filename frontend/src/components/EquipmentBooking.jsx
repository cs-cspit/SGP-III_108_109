import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import { Calendar, Clock, Camera, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { toast } from 'react-toastify';

const EquipmentBooking = () => {
  const [step, setStep] = useState(1);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '18:00',
    includeHours: false,
    totalDays: 0,
    totalHours: 0
  });
  const [customerDetails, setCustomerDetails] = useState({
    contactPerson: '',
    contactPhone: '',
    deliveryAddress: '',
    specialRequirements: ''
  });
  const [pricing, setPricing] = useState({
    equipmentTotal: 0,
    deliveryCharges: 500,
    taxes: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableEquipment();
  }, []);

  useEffect(() => {
    calculateDuration();
  }, [bookingData.startDate, bookingData.endDate, bookingData.startTime, bookingData.endTime, bookingData.includeHours]);

  useEffect(() => {
    calculatePricing();
  }, [selectedEquipment, bookingData.totalDays, bookingData.totalHours]);

  const fetchAvailableEquipment = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/cameras');
      setAvailableEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast.error('Failed to load equipment');
    }
  };

  const calculateDuration = () => {
    if (!bookingData.startDate || !bookingData.endDate) {
      setBookingData(prev => ({ ...prev, totalDays: 0, totalHours: 0 }));
      return;
    }

    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(bookingData.endDate);
    
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    let totalHours = 0;
    if (bookingData.includeHours && bookingData.startTime && bookingData.endTime) {
      const [startHour, startMin] = bookingData.startTime.split(':').map(Number);
      const [endHour, endMin] = bookingData.endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      const dailyHours = (endMinutes - startMinutes) / 60;
      totalHours = dailyHours * daysDiff;
    }

    setBookingData(prev => ({
      ...prev,
      totalDays: daysDiff,
      totalHours: Math.max(0, totalHours)
    }));
  };

  const calculatePricing = () => {
    if (selectedEquipment.length === 0 || bookingData.totalDays === 0) {
      setPricing(prev => ({ ...prev, equipmentTotal: 0, taxes: 0, totalAmount: 500 }));
      return;
    }

    let equipmentTotal = 0;
    selectedEquipment.forEach(item => {
      const dailyRate = item.price * 0.1;
      let itemTotal = dailyRate * item.quantity * bookingData.totalDays;
      
      if (bookingData.includeHours && bookingData.totalHours > 0) {
        const hourlyRate = dailyRate * 0.15;
        itemTotal += hourlyRate * item.quantity * bookingData.totalHours;
      }
      
      equipmentTotal += itemTotal;
    });

    const taxes = (equipmentTotal + pricing.deliveryCharges) * 0.18;
    const totalAmount = equipmentTotal + pricing.deliveryCharges + taxes;

    setPricing(prev => ({
      ...prev,
      equipmentTotal,
      taxes,
      totalAmount
    }));
  };

  const addEquipment = (equipment) => {
    const existing = selectedEquipment.find(item => item._id === equipment._id);
    if (existing) {
      setSelectedEquipment(prev =>
        prev.map(item =>
          item._id === equipment._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedEquipment(prev => [...prev, { ...equipment, quantity: 1 }]);
    }
    toast.success(`${equipment.name} added to selection`);
  };

  const updateQuantity = (equipmentId, newQuantity) => {
    if (newQuantity <= 0) {
      removeEquipment(equipmentId);
    } else {
      setSelectedEquipment(prev =>
        prev.map(item =>
          item._id === equipmentId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const removeEquipment = (equipmentId) => {
    const equipment = selectedEquipment.find(item => item._id === equipmentId);
    setSelectedEquipment(prev => prev.filter(item => item._id !== equipmentId));
    toast.warning(`${equipment?.name} removed from selection`);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('customer.')) {
      const field = name.split('.')[1];
      setCustomerDetails(prev => ({ ...prev, [field]: value }));
    } else {
      setBookingData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const submitBooking = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const bookingPayload = {
        bookingType: 'Equipment Rental',
        eventType: 'Other',
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        startTime: bookingData.includeHours ? bookingData.startTime : null,
        endTime: bookingData.includeHours ? bookingData.endTime : null,
        equipmentList: selectedEquipment.map(item => ({
          equipmentId: item._id,
          quantity: item.quantity,
          dailyRate: item.dailyRate || item.price || 0,
          totalDays: bookingData.totalDays
        })),
        eventDetails: {
          venue: customerDetails.deliveryAddress || '',
          address: customerDetails.deliveryAddress || '',
          contactPerson: customerDetails.contactPerson || '',
          contactPhone: customerDetails.contactPhone || '',
          specialRequirements: customerDetails.specialRequirements || ''
        },
        totalDays: bookingData.totalDays,
        totalHours: bookingData.includeHours ? bookingData.totalHours : 0,
        includeHours: bookingData.includeHours
      };

      console.log('=== Frontend: Submitting Booking ===');
      console.log('Booking Payload:', JSON.stringify(bookingPayload, null, 2));

      const response = await axios.post('http://localhost:5000/api/bookings/create', bookingPayload, {
        headers: { 'x-auth-token': token }
      });

      toast.success(`Equipment booking created successfully! Booking ID: ${response.data.bookingId}`);
      
      setStep(1);
      setSelectedEquipment([]);
      setBookingData({
        startDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '18:00',
        includeHours: false,
        totalDays: 0,
        totalHours: 0
      });
      setCustomerDetails({
        contactPerson: '',
        contactPhone: '',
        deliveryAddress: '',
        specialRequirements: ''
      });
    } catch (error) {
      console.error('=== Frontend: Booking Error ===');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Error creating equipment booking. Please try again.';
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.errors && Array.isArray(data.errors)) {
          // Validation errors array
          errorMessage = 'Validation Error: ' + data.errors.join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const canProceedToNextStep = () => {
    switch (step) {
      case 1:
        return bookingData.startDate && bookingData.endDate && 
               (!bookingData.includeHours || (bookingData.startTime && bookingData.endTime));
      case 2:
        return selectedEquipment.length > 0;
      case 3:
        return customerDetails.contactPhone && customerDetails.deliveryAddress;
      default:
        return false;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
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
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Equipment <span className="text-gray-600">Rental Booking</span>
              </h1>
              <p className="text-xl text-gray-600">
                Rent professional photography equipment with flexible duration options
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-center">
                {[1, 2, 3, 4].map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div className={`rounded-full h-10 w-10 flex items-center justify-center text-sm font-medium ${
                      step >= stepNum ? 'bg-gray-900 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {stepNum}
                    </div>
                    {stepNum < 4 && (
                      <div className={`h-1 w-16 mx-3 ${
                        step > stepNum ? 'bg-gray-900' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <p className="text-sm text-gray-600">
                  Step {step} of 4: {
                    step === 1 ? 'Duration & Time' :
                    step === 2 ? 'Select Equipment' :
                    step === 3 ? 'Delivery Details' :
                    'Review & Confirm'
                  }
                </p>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-8">
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-gray-600" />
                    Select Duration & Time
                  </h2>
                  
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
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        name="includeHours"
                        checked={bookingData.includeHours}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                      />
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Include specific time duration (optional)
                      </label>
                    </div>
                    
                    {bookingData.includeHours && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                          <input
                            type="time"
                            name="startTime"
                            value={bookingData.startTime}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                          <input
                            type="time"
                            name="endTime"
                            value={bookingData.endTime}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {bookingData.totalDays > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Duration Summary:</h3>
                      <div className="space-y-1 text-sm text-blue-800">
                        <p>Total Days: <span className="font-medium">{bookingData.totalDays} days</span></p>
                        {bookingData.includeHours && bookingData.totalHours > 0 && (
                          <p>Total Hours: <span className="font-medium">{bookingData.totalHours.toFixed(1)} hours</span></p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Camera className="w-6 h-6 text-gray-600" />
                    Select Equipment
                  </h2>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Equipment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableEquipment.map((equipment) => (
                        <div key={equipment._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3">
                            <img
                              src={equipment.image_url}
                              alt={equipment.name}
                              className="h-16 w-16 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{equipment.name}</h4>
                              <p className="text-sm text-gray-600">{formatCurrency(equipment.price * 0.1)}/day</p>
                              <div className="flex items-center mt-1">
                                <span className="text-yellow-400 text-sm">★</span>
                                <span className="text-sm text-gray-600 ml-1">{equipment.rating}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => addEquipment(equipment)}
                              className="bg-gray-900 text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedEquipment.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Equipment</h3>
                      <div className="space-y-3">
                        {selectedEquipment.map((item) => (
                          <div key={item._id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="h-12 w-12 object-cover rounded-lg"
                              />
                              <div>
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                <p className="text-sm text-gray-600">{formatCurrency(item.price * 0.1)}/day</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                className="bg-gray-300 text-gray-700 p-1 rounded-lg hover:bg-gray-400 transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="font-medium w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                className="bg-gray-300 text-gray-700 p-1 rounded-lg hover:bg-gray-400 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => removeEquipment(item._id)}
                                className="bg-red-500 text-white p-1 rounded-lg hover:bg-red-600 transition-colors ml-2"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Delivery & Contact Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                      <input
                        type="text"
                        name="customer.contactPerson"
                        value={customerDetails.contactPerson}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                        placeholder="Contact person name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone *</label>
                      <input
                        type="tel"
                        name="customer.contactPhone"
                        value={customerDetails.contactPhone}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                        placeholder="Contact phone number"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address *</label>
                      <textarea
                        name="customer.deliveryAddress"
                        value={customerDetails.deliveryAddress}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                        placeholder="Full delivery address"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
                      <textarea
                        name="customer.specialRequirements"
                        value={customerDetails.specialRequirements}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                        placeholder="Any special requirements or notes..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Review & Confirm Booking</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h3 className="font-semibold text-gray-900 mb-4">Rental Details</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Duration:</span> {bookingData.startDate} to {bookingData.endDate}</p>
                        <p><span className="font-medium">Total Days:</span> {bookingData.totalDays} days</p>
                        {bookingData.includeHours && (
                          <>
                            <p><span className="font-medium">Time:</span> {bookingData.startTime} to {bookingData.endTime}</p>
                            <p><span className="font-medium">Total Hours:</span> {bookingData.totalHours.toFixed(1)} hours</p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h3 className="font-semibold text-gray-900 mb-4">Pricing Breakdown</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Equipment:</span> {formatCurrency(pricing.equipmentTotal)}</p>
                        <p><span className="font-medium">Delivery:</span> {formatCurrency(pricing.deliveryCharges)}</p>
                        <p><span className="font-medium">Taxes:</span> {formatCurrency(pricing.taxes)}</p>
                        <hr className="my-2" />
                        <p className="text-lg font-bold"><span>Total:</span> {formatCurrency(pricing.totalAmount)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Terms & Conditions</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Equipment must be returned in the same condition as received</li>
                      <li>• Any damage to equipment will be charged separately</li>
                      <li>• Delivery charges apply for equipment delivery and pickup</li>
                      <li>• 50% advance payment required for booking confirmation</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                  className="px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {step < 4 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceedToNextStep()}
                    className="px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={submitBooking}
                    disabled={loading}
                    className="px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                  >
                    {loading ? (
                      'Creating Booking...'
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Confirm Equipment Booking
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default EquipmentBooking;