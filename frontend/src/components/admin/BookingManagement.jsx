import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaCalendarAlt, FaUser, FaCheck, FaTimes, FaEdit, FaEye,
  FaClock, FaCamera, FaMoneyBillWave, FaFilter
} from 'react-icons/fa';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    bookingType: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(`http://localhost:5000/api/admin/bookings?${queryParams}`, {
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
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus, notes = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/bookings/${bookingId}/status`, {
        status: newStatus,
        adminNotes: notes
      }, {
        headers: { 'x-auth-token': token }
      });
      
      alert(`Booking ${newStatus.toLowerCase()} successfully`);
      fetchBookings();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error updating booking status');
    }
  };

  const viewBookingDetails = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/admin/bookings/${bookingId}`, {
        headers: { 'x-auth-token': token }
      });
      setSelectedBooking(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching booking details:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Confirmed': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-purple-100 text-purple-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Refunded': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600">Manage customer bookings and approvals</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Total: {pagination.total || 0} bookings</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Type</label>
            <select
              value={filters.bookingType}
              onChange={(e) => handleFilterChange('bookingType', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Equipment Rental">Equipment Rental</option>
              <option value="Function Shoot">Function Shoot</option>
              <option value="Event Coverage">Event Coverage</option>
              <option value="Studio Session">Studio Session</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                status: '', bookingType: '', dateFrom: '', dateTo: '', page: 1, limit: 10
              })}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            >
              <FaFilter className="h-4 w-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.bookingId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.bookingType} - {booking.eventType}
                          </div>
                          <div className="text-xs text-gray-400">
                            {booking.equipmentList?.length || 0} items
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.customerId?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.customerId?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(booking.startDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          to {formatDate(booking.endDate)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {booking.totalDays} days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(booking.pricing?.totalAmount || 0)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.paymentStatus}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewBookingDetails(booking._id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                          {booking.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'Confirmed')}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <FaCheck className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'Cancelled', 'Rejected by admin')}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <FaTimes className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                    disabled={filters.page <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handleFilterChange('page', Math.min(pagination.totalPages, filters.page + 1))}
                    disabled={filters.page >= pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((filters.page - 1) * filters.limit) + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(filters.page * filters.limit, pagination.total)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handleFilterChange('page', page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === filters.page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Booking Details - {selectedBooking.bookingId}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedBooking.customerId?.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedBooking.customerId?.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedBooking.customerId?.phone || 'N/A'}</p>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Booking Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Type:</span> {selectedBooking.bookingType}</p>
                    <p><span className="font-medium">Event:</span> {selectedBooking.eventType}</p>
                    <p><span className="font-medium">Duration:</span> {selectedBooking.totalDays} days</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Event Details */}
                {selectedBooking.eventDetails && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Event Details</h4>
                    <div className="space-y-2">
                      {selectedBooking.eventDetails.venue && (
                        <p><span className="font-medium">Venue:</span> {selectedBooking.eventDetails.venue}</p>
                      )}
                      {selectedBooking.eventDetails.address && (
                        <p><span className="font-medium">Address:</span> {selectedBooking.eventDetails.address}</p>
                      )}
                      {selectedBooking.eventDetails.guestCount && (
                        <p><span className="font-medium">Guest Count:</span> {selectedBooking.eventDetails.guestCount}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Pricing Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Pricing Breakdown</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Equipment:</span> {formatCurrency(selectedBooking.pricing?.equipmentTotal || 0)}</p>
                    <p><span className="font-medium">Service Charges:</span> {formatCurrency(selectedBooking.pricing?.serviceCharges || 0)}</p>
                    <p><span className="font-medium">Taxes:</span> {formatCurrency(selectedBooking.pricing?.taxes || 0)}</p>
                    <hr className="my-2" />
                    <p className="text-lg"><span className="font-bold">Total:</span> {formatCurrency(selectedBooking.pricing?.totalAmount || 0)}</p>
                  </div>
                </div>
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
                                    className="h-8 w-8 rounded mr-3 object-cover"
                                  />
                                )}
                                <span className="text-sm">{item.equipmentId?.name || 'Equipment'}</span>
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

              {/* Action Buttons */}
              {selectedBooking.status === 'Pending' && (
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => handleStatusUpdate(selectedBooking._id, 'Cancelled', 'Rejected by admin')}
                    className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    Reject Booking
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedBooking._id, 'Confirmed')}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    Approve Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;