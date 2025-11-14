import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import PaymentRequest from './PaymentRequest';
import { 
  FaCalendarAlt, FaCamera, FaCheckCircle, FaClock, FaTimesCircle,
  FaEye, FaEdit, FaTimes, FaDownload
} from 'react-icons/fa';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = filterStatus ? `?status=${filterStatus}` : '';
      const response = await axios.get(`http://localhost:5000/api/bookings/my-bookings${queryParams}`, {
        headers: { 'x-auth-token': token }
      });
      setBookings(response.data.bookings);
      setPagination({
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const viewBookingDetails = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: { 'x-auth-token': token }
      });
      setSelectedBooking(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      alert('Error fetching booking details');
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/bookings/${selectedBooking._id}/cancel`,
        { reason: cancelReason },
        { headers: { 'x-auth-token': token } }
      );
      alert('Booking cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(error.response?.data?.message || 'Error cancelling booking');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Confirmed': 'bg-blue-100 text-blue-800 border-blue-300',
      'In Progress': 'bg-purple-100 text-purple-800 border-purple-300',
      'Completed': 'bg-green-100 text-green-800 border-green-300',
      'Cancelled': 'bg-red-100 text-red-800 border-red-300',
      'Refunded': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': <FaClock className="h-4 w-4" />,
      'Confirmed': <FaCheckCircle className="h-4 w-4" />,
      'In Progress': <FaCamera className="h-4 w-4" />,
      'Completed': <FaCheckCircle className="h-4 w-4" />,
      'Cancelled': <FaTimesCircle className="h-4 w-4" />,
      'Refunded': <FaTimesCircle className="h-4 w-4" />
    };
    return icons[status] || <FaClock className="h-4 w-4" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const canCancelBooking = (booking) => {
    return ['Pending', 'Confirmed'].includes(booking.status);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 mt-1">View and manage your booking history</p>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Bookings</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Total Bookings: {pagination.total || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FaCalendarAlt className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-4">You haven't made any bookings yet</p>
              <a
                href="/EquipmentBooking"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Create New Booking
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      {/* Left Section - Booking Info */}
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">
                            {booking.bookingId}
                          </h3>
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span>{booking.status}</span>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FaCalendarAlt className="h-4 w-4 mr-2 text-gray-400" />
                            <span>Type: <span className="font-medium">{booking.bookingType}</span></span>
                          </div>
                          <div className="flex items-center">
                            <FaCamera className="h-4 w-4 mr-2 text-gray-400" />
                            <span>Event: <span className="font-medium">{booking.eventType}</span></span>
                          </div>
                          <div>
                            <span className="font-medium">Dates:</span> {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {booking.totalDays} days
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Price & Actions */}
                      <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end space-y-3">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(booking.pricing?.totalAmount || 0)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Payment: {booking.paymentStatus}
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewBookingDetails(booking._id)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <FaEye className="h-4 w-4 mr-1" />
                            View
                          </button>
                          
                          {canCancelBooking(booking) && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowCancelModal(true);
                              }}
                              className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                            >
                              <FaTimes className="h-4 w-4 mr-1" />
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Equipment Summary */}
                    {booking.equipmentList && booking.equipmentList.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Equipment:</p>
                        <div className="flex flex-wrap gap-2">
                          {booking.equipmentList.map((item, index) => (
                            <div key={index} className="flex items-center bg-gray-50 rounded-lg px-3 py-1">
                              {item.equipmentId?.image_url && (
                                <img
                                  src={item.equipmentId.image_url}
                                  alt={item.equipmentId?.name}
                                  className="h-6 w-6 rounded mr-2 object-cover"
                                />
                              )}
                              <span className="text-sm text-gray-700">
                                {item.equipmentId?.name || 'Equipment'} <span className="text-gray-500">x{item.quantity}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Booking Details - {selectedBooking.bookingId}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Booking Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Booking Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Booking ID:</span> {selectedBooking.bookingId}</p>
                  <p><span className="font-medium">Type:</span> {selectedBooking.bookingType}</p>
                  <p><span className="font-medium">Event:</span> {selectedBooking.eventType}</p>
                  <p><span className="font-medium">Start Date:</span> {formatDate(selectedBooking.startDate)}</p>
                  <p><span className="font-medium">End Date:</span> {formatDate(selectedBooking.endDate)}</p>
                  <p><span className="font-medium">Duration:</span> {selectedBooking.totalDays} days</p>
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedBooking.status)}`}>
                      {getStatusIcon(selectedBooking.status)}
                      <span>{selectedBooking.status}</span>
                    </span>
                  </p>
                </div>
              </div>

              {/* Pricing Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Pricing Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Equipment Total:</span> {formatCurrency(selectedBooking.pricing?.equipmentTotal || 0)}</p>
                  <p><span className="font-medium">Service Charges:</span> {formatCurrency(selectedBooking.pricing?.serviceCharges || 0)}</p>
                  <p><span className="font-medium">Taxes (18%):</span> {formatCurrency(selectedBooking.pricing?.taxes || 0)}</p>
                  {selectedBooking.pricing?.discount > 0 && (
                    <p><span className="font-medium">Discount:</span> -{formatCurrency(selectedBooking.pricing.discount)}</p>
                  )}
                  <hr className="my-2" />
                  <p className="text-lg"><span className="font-bold">Total Amount:</span> {formatCurrency(selectedBooking.pricing?.totalAmount || 0)}</p>
                  {selectedBooking.pricing?.advanceAmount > 0 && (
                    <>
                      <p><span className="font-medium">Advance Paid:</span> {formatCurrency(selectedBooking.pricing.advanceAmount)}</p>
                      <p><span className="font-medium">Remaining:</span> {formatCurrency(selectedBooking.pricing.remainingAmount)}</p>
                    </>
                  )}
                  <p><span className="font-medium">Payment Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                      selectedBooking.paymentStatus === 'Fully Paid' ? 'bg-green-100 text-green-800' :
                      selectedBooking.paymentStatus === 'Advance Paid' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedBooking.paymentStatus}
                    </span>
                  </p>
                </div>
              </div>

              {/* Event Details */}
              {selectedBooking.eventDetails && Object.values(selectedBooking.eventDetails).some(val => val) && (
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Event Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {selectedBooking.eventDetails.venue && (
                      <p><span className="font-medium">Venue:</span> {selectedBooking.eventDetails.venue}</p>
                    )}
                    {selectedBooking.eventDetails.address && (
                      <p><span className="font-medium">Address:</span> {selectedBooking.eventDetails.address}</p>
                    )}
                    {selectedBooking.eventDetails.contactPerson && (
                      <p><span className="font-medium">Contact Person:</span> {selectedBooking.eventDetails.contactPerson}</p>
                    )}
                    {selectedBooking.eventDetails.contactPhone && (
                      <p><span className="font-medium">Contact Phone:</span> {selectedBooking.eventDetails.contactPhone}</p>
                    )}
                    {selectedBooking.eventDetails.guestCount && (
                      <p><span className="font-medium">Guest Count:</span> {selectedBooking.eventDetails.guestCount}</p>
                    )}
                    {selectedBooking.eventDetails.specialRequirements && (
                      <p className="md:col-span-2"><span className="font-medium">Special Requirements:</span> {selectedBooking.eventDetails.specialRequirements}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Equipment List */}
            {selectedBooking.equipmentList && selectedBooking.equipmentList.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Equipment List</h4>
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
                      {selectedBooking.equipmentList.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              {item.equipmentId?.image_url && (
                                <img 
                                  src={item.equipmentId.image_url} 
                                  alt={item.equipmentId?.name}
                                  className="h-10 w-10 rounded mr-3 object-cover"
                                />
                              )}
                              <span className="text-sm font-medium">{item.equipmentId?.name || 'Equipment'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm">{formatCurrency(item.dailyRate)}</td>
                          <td className="px-4 py-2 text-sm font-medium">
                            {formatCurrency(item.dailyRate * item.quantity * selectedBooking.totalDays)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Assigned Staff */}
            {selectedBooking.assignedStaff && selectedBooking.assignedStaff.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Assigned Staff</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedBooking.assignedStaff.map((staff, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium">{staff.name}</p>
                      <p className="text-sm text-gray-600">{staff.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {(selectedBooking.customerNotes || selectedBooking.adminNotes) && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                {selectedBooking.customerNotes && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-2">
                    <p className="text-sm font-medium text-blue-900">Your Notes:</p>
                    <p className="text-sm text-blue-800">{selectedBooking.customerNotes}</p>
                  </div>
                )}
                {selectedBooking.adminNotes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Admin Notes:</p>
                    <p className="text-sm text-gray-700">{selectedBooking.adminNotes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Payment Request Section */}
            <div className="mt-6">
              <PaymentRequest 
                booking={selectedBooking} 
                onPaymentRequestCreated={fetchBookings}
              />
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cancel Booking</h3>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to cancel booking <span className="font-semibold">{selectedBooking.bookingId}</span>?
              </p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                placeholder="Please provide a reason for cancellation..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                No, Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Yes, Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyBookings;
