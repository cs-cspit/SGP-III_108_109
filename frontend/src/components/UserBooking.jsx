import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import { FaCalendarAlt, FaCamera, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

const UserBooking = () => {
  const [step, setStep] = useState(1);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [bookingData, setBookingData] = useState({
    bookingType: 'Equipment Rental',
    eventType: 'Other',
    startDate: '',
    endDate: '',
    eventDetails: {
      venue: '',
      address: '',
      contactPerson: '',
      contactPhone: '',
      guestCount: '',
      specialRequirements: ''
    }
  });
  const [pricing, setPricing] = useState({
    equipmentTotal: 0,
    serviceCharges: 0,
    taxes: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableEquipment();
  }, []);

  useEffect(() => {
    calculatePricing();
  }, [selectedEquipment, bookingData.startDate, bookingData.endDate]);

  const fetchAvailableEquipment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/bookings/available-equipment', {
        headers: { 'x-auth-token': token }
      });
      setAvailableEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const calculatePricing = () => {
    if (!bookingData.startDate || !bookingData.endDate || selectedEquipment.length === 0) {
      setPricing({ equipmentTotal: 0, serviceCharges: 0, taxes: 0, totalAmount: 0 });
      return;
    }

    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(bookingData.endDate);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    let equipmentTotal = 0;
    selectedEquipment.forEach(item => {
      const dailyRate = item.price * 0.1; // 10% of equipment price as daily rate
      equipmentTotal += dailyRate * item.quantity * totalDays;
    });

    const serviceCharges = bookingData.bookingType === 'Function Shoot' ? 5000 : 1000;
    const taxes = (equipmentTotal + serviceCharges) * 0.18; // 18% GST
    const totalAmount = equipmentTotal + serviceCharges + taxes;

    setPricing({
      equipmentTotal,
      serviceCharges,
      taxes,
      totalAmount
    });
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
  };

  const updateEquipmentQuantity = (equipmentId, newQuantity) => {
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
    setSelectedEquipment(prev => prev.filter(item => item._id !== equipmentId));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('eventDetails.')) {
      const field = name.split('.')[1];
      setBookingData(prev => ({
        ...prev,
        eventDetails: {
          ...prev.eventDetails,
          [field]: value
        }
      }));
    } else {
      setBookingData(prev => ({ ...prev, [name]: value }));
    }
  };

  const submitBooking = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const bookingPayload = {
        ...bookingData,
        equipmentList: selectedEquipment.map(item => ({
          equipmentId: item._id,
          quantity: item.quantity
        })),
        specialRequirements: bookingData.eventDetails.specialRequirements
      };

      const response = await axios.post('http://localhost:5000/api/bookings/create', bookingPayload, {
        headers: { 'x-auth-token': token }
      });

      alert(`Booking created successfully! Booking ID: ${response.data.bookingId}`);
      
      // Reset form
      setStep(1);
      setSelectedEquipment([]);
      setBookingData({
        bookingType: 'Equipment Rental',
        eventType: 'Other',
        startDate: '',
        endDate: '',
        eventDetails: {
          venue: '',
          address: '',
          contactPerson: '',
          contactPhone: '',
          guestCount: '',
          specialRequirements: ''
        }
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceedToNextStep = () => {
    switch (step) {
      case 1:
        return bookingData.bookingType && bookingData.eventType && bookingData.startDate && bookingData.endDate;
      case 2:
        return selectedEquipment.length > 0;
      case 3:
        return true; // Event details are optional
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium ${
                    step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 4 && (
                    <div className={`h-1 w-12 mx-2 ${
                      step > stepNum ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Step {step} of 4: {
                    step === 1 ? 'Booking Details' :
                    step === 2 ? 'Select Equipment' :
                    step === 3 ? 'Event Information' :
                    'Review & Confirm'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            {/* Step 1: Booking Details */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking Type *
                    </label>
                    <select
                      name="bookingType"
                      value={bookingData.bookingType}
                      onChange={handleInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="Equipment Rental">Equipment Rental</option>
                      <option value="Function Shoot">Function Shoot</option>
                      <option value="Event Coverage">Event Coverage</option>
                      <option value="Studio Session">Studio Session</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type *
                    </label>
                    <select
                      name="eventType"
                      value={bookingData.eventType}
                      onChange={handleInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="Wedding">Wedding</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Party">Party</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Portrait">Portrait</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Product">Product</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={bookingData.startDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={bookingData.endDate}
                      onChange={handleInputChange}
                      min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Select Equipment */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Select Equipment</h2>
                
                {/* Available Equipment */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Equipment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableEquipment.map((equipment) => (
                      <div key={equipment._id} className="border rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={equipment.image_url}
                            alt={equipment.name}
                            className="h-16 w-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{equipment.name}</h4>
                            <p className="text-sm text-gray-600">{formatCurrency(equipment.price * 0.1)}/day</p>
                            <div className="flex items-center mt-2">
                              <span className="text-yellow-400">★</span>
                              <span className="text-sm text-gray-600 ml-1">{equipment.rating}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => addEquipment(equipment)}
                            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                          >
                            <FaPlus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Equipment */}
                {selectedEquipment.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Equipment</h3>
                    <div className="space-y-3">
                      {selectedEquipment.map((item) => (
                        <div key={item._id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-12 w-12 object-cover rounded"
                            />
                            <div>
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600">{formatCurrency(item.price * 0.1)}/day</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateEquipmentQuantity(item._id, item.quantity - 1)}
                              className="bg-gray-300 text-gray-700 p-1 rounded hover:bg-gray-400"
                            >
                              <FaMinus className="h-3 w-3" />
                            </button>
                            <span className="font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateEquipmentQuantity(item._id, item.quantity + 1)}
                              className="bg-gray-300 text-gray-700 p-1 rounded hover:bg-gray-400"
                            >
                              <FaPlus className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => removeEquipment(item._id)}
                              className="bg-red-500 text-white p-1 rounded hover:bg-red-600 ml-2"
                            >
                              <FaTrash className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Event Information */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Event Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue
                    </label>
                    <input
                      type="text"
                      name="eventDetails.venue"
                      value={bookingData.eventDetails.venue}
                      onChange={handleInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Event venue name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="eventDetails.contactPerson"
                      value={bookingData.eventDetails.contactPerson}
                      onChange={handleInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Contact person name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="eventDetails.contactPhone"
                      value={bookingData.eventDetails.contactPhone}
                      onChange={handleInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Contact phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guest Count (Approximate)
                    </label>
                    <input
                      type="number"
                      name="eventDetails.guestCount"
                      value={bookingData.eventDetails.guestCount}
                      onChange={handleInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Number of guests"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      name="eventDetails.address"
                      value={bookingData.eventDetails.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Full address of the venue"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requirements
                    </label>
                    <textarea
                      name="eventDetails.specialRequirements"
                      value={bookingData.eventDetails.specialRequirements}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Any special requirements or notes..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Confirm */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Review & Confirm</h2>
                
                {/* Booking Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Type:</span> {bookingData.bookingType}</p>
                      <p><span className="font-medium">Event:</span> {bookingData.eventType}</p>
                      <p><span className="font-medium">Dates:</span> {bookingData.startDate} to {bookingData.endDate}</p>
                      <p><span className="font-medium">Duration:</span> {Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24)) + 1} days</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Pricing Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Equipment:</span> {formatCurrency(pricing.equipmentTotal)}</p>
                      <p><span className="font-medium">Service Charges:</span> {formatCurrency(pricing.serviceCharges)}</p>
                      <p><span className="font-medium">Taxes (18%):</span> {formatCurrency(pricing.taxes)}</p>
                      <hr className="my-2" />
                      <p className="text-lg font-bold"><span>Total:</span> {formatCurrency(pricing.totalAmount)}</p>
                    </div>
                  </div>
                </div>

                {/* Selected Equipment Summary */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Selected Equipment</h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Daily Rate</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedEquipment.map((item, index) => {
                          const dailyRate = item.price * 0.1;
                          const days = Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                          return (
                            <tr key={index}>
                              <td className="px-4 py-2">
                                <div className="flex items-center">
                                  <img 
                                    src={item.image_url} 
                                    alt={item.name}
                                    className="h-8 w-8 rounded mr-3 object-cover"
                                  />
                                  <span className="text-sm">{item.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm">{item.quantity}</td>
                              <td className="px-4 py-2 text-sm">{formatCurrency(dailyRate)}</td>
                              <td className="px-4 py-2 text-sm font-medium">
                                {formatCurrency(dailyRate * item.quantity * days)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Terms & Conditions</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Equipment must be returned in the same condition as received</li>
                    <li>• Any damage to equipment will be charged separately</li>
                    <li>• Cancellation must be done at least 24 hours before the event</li>
                    <li>• 50% advance payment required for booking confirmation</li>
                    <li>• Late return charges may apply beyond the agreed return time</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceedToNextStep()}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={submitBooking}
                  disabled={loading}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Creating Booking...' : 'Confirm Booking'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserBooking;