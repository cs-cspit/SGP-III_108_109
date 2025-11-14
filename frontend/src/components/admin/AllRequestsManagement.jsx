import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AllRequestsManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchAllRequests();
  }, [filterType, filterStatus, page]);

  const fetchAllRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch payment requests
      const paymentResponse = await axios.get(
        `http://localhost:5000/api/admin/payment-requests?status=${filterStatus === 'Active' ? '' : filterStatus}&page=${page}&limit=10`,
        { headers: { 'x-auth-token': token } }
      );
      
      // Fetch subscription requests
      const subscriptionResponse = await axios.get(
        `http://localhost:5000/api/subscriptions/admin/subscriptions`,
        { headers: { 'x-auth-token': token } }
      );
      
      // Process payment requests
      const paymentRequests = paymentResponse.data.data.paymentRequests.map(request => ({
        ...request,
        id: request._id,
        type: 'Payment',
        amount: request.paymentRequests.amount,
        paymentMethod: request.paymentRequests.paymentMethod,
        requestDate: request.paymentRequests.requestDate,
        status: request.paymentRequests.status,
        adminNotes: request.paymentRequests.adminNotes,
        processedDate: request.paymentRequests.processedDate,
        requestId: request.paymentRequests._id
      }));
      
      // Process subscription requests
      const subscriptionRequests = subscriptionResponse.data.data.subscriptions
        .filter(sub => filterStatus === '' || sub.status === filterStatus || (filterStatus === 'Active' && sub.status === 'Active'))
        .map(subscription => ({
          ...subscription,
          id: subscription._id,
          type: 'Subscription',
          amount: subscription.amountPaid,
          requestDate: subscription.createdAt,
          packageName: subscription.subscriptionPlanId?.displayName,
          packageType: subscription.subscriptionPlanId?.planType,
          customerName: subscription.customerId?.name,
          customerEmail: subscription.customerId?.email
        }));
      
      // Combine and sort requests
      const allRequests = [...paymentRequests, ...subscriptionRequests];
      allRequests.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
      
      setRequests(allRequests);
      setTotalPages(paymentResponse.data.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPaymentRequest = async (bookingId, requestId, status, adminNotes = '') => {
    try {
      const token = localStorage.getItem('token');
      setProcessing(prev => ({ ...prev, [requestId]: true }));
      
      await axios.put(
        `http://localhost:5000/api/admin/bookings/${bookingId}/payment-requests/${requestId}`,
        { status, adminNotes },
        { headers: { 'x-auth-token': token } }
      );
      
      alert(`Payment request ${status.toLowerCase()} successfully!`);
      fetchAllRequests(); // Refresh the list
      return Promise.resolve();
    } catch (error) {
      console.error('Error processing payment request:', error);
      alert(error.response?.data?.message || 'Error processing payment request');
      return Promise.reject(error);
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleProcessSubscriptionRequest = async (subscriptionId, status, adminNotes = '', rejectionReason = '') => {
    try {
      const token = localStorage.getItem('token');
      setProcessing(prev => ({ ...prev, [subscriptionId]: true }));
      
      if (status === 'Accepted') {
        await axios.put(
          `http://localhost:5000/api/subscriptions/admin/subscriptions/${subscriptionId}/approve`,
          { adminNotes },
          { headers: { 'x-auth-token': token } }
        );
        alert('Subscription approved successfully!');
      } else if (status === 'Rejected') {
        await axios.put(
          `http://localhost:5000/api/subscriptions/admin/subscriptions/${subscriptionId}/reject`,
          { rejectionReason, adminNotes },
          { headers: { 'x-auth-token': token } }
        );
        alert('Subscription rejected successfully!');
      }
      
      fetchAllRequests(); // Refresh the list
      return Promise.resolve();
    } catch (error) {
      console.error('Error processing subscription request:', error);
      alert(error.response?.data?.message || 'Error processing subscription request');
      return Promise.reject(error);
    } finally {
      setProcessing(prev => ({ ...prev, [subscriptionId]: false }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status, type) => {
    // Special handling for subscription status
    if (type === 'Subscription') {
      switch (status) {
        case 'Pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'Active':
          return 'bg-green-100 text-green-800';
        case 'Rejected':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    // Payment request status
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openProcessModal = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const closeProcessModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleProcessRequest = async (request, status, adminNotes, rejectionReason = '') => {
    if (request.type === 'Payment') {
      return handleProcessPaymentRequest(request._id, request.requestId, status, adminNotes);
    } else {
      return handleProcessSubscriptionRequest(request.id, status, adminNotes, rejectionReason);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Requests</h1>
          <p className="text-gray-600 mt-1">Manage all customer payment and subscription requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
            >
              <option value="">All Types</option>
              <option value="Payment">Payment Requests</option>
              <option value="Subscription">Subscription Requests</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Active">Active</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={fetchAllRequests}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterType === '' && filterStatus === '' 
              ? 'No requests found.' 
              : `No ${filterType.toLowerCase()} requests with ${filterStatus.toLowerCase()} status found.`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests
                  .filter(request => filterType === '' || request.type === filterType)
                  .map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.type === 'Payment' ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.customer.name}</div>
                            <div className="text-sm text-gray-500">{request.customer.email}</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.customerName}</div>
                            <div className="text-sm text-gray-500">{request.customerEmail}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {request.type === 'Payment' ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.bookingId}</div>
                            <div className="text-sm text-gray-500">{request.eventType}</div>
                            <div className="text-sm text-gray-500">{request.paymentMethod}</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.packageName}</div>
                            <div className="text-sm text-gray-500">{request.packageType}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(request.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(request.requestDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(request.status, request.type)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === 'Pending' && (
                          <button
                            onClick={() => openProcessModal(request)}
                            className="text-blue-600 hover:text-blue-900"
                            disabled={processing[request.id] || processing[request.requestId]}
                          >
                            {processing[request.id] || processing[request.requestId] ? 'Processing...' : 'Process'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === i + 1
                            ? 'z-10 bg-gray-50 border-gray-500 text-gray-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Process Request Modal */}
      {selectedRequest && (
        <ProcessRequestModal
          isOpen={isModalOpen}
          onClose={closeProcessModal}
          onRequestProcessed={handleProcessRequest}
          request={selectedRequest}
        />
      )}
    </div>
  );
};

// Process Request Modal Component
const ProcessRequestModal = ({ isOpen, onClose, onRequestProcessed, request }) => {
  const [status, setStatus] = useState('Accepted');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onRequestProcessed(request, status, adminNotes, rejectionReason);
      onClose();
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-500 bg-opacity-75"
        onClick={onClose}
      ></div>

      <div className="relative z-10 w-full max-w-lg bg-white rounded-lg shadow-xl">
        <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="w-full">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Process {request.type} Request
            </h3>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">
                    {request.type === 'Payment' ? request.customer.name : request.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {request.type === 'Payment' ? 'Booking ID' : 'Package'}
                  </p>
                  <p className="font-medium">
                    {request.type === 'Payment' ? request.bookingId : request.packageName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-medium">
                    ₹{request.amount.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Method</p>
                  <p className="font-medium">
                    {request.type === 'Payment' ? request.paymentMethod : 'Subscription'}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="Accepted"
                      checked={status === 'Accepted'}
                      onChange={(e) => setStatus(e.target.value)}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {request.type === 'Subscription' ? 'Approve' : 'Accept'}
                    </span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="Rejected"
                      checked={status === 'Rejected'}
                      onChange={(e) => setStatus(e.target.value)}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-600">Reject</span>
                  </label>
                </div>
              </div>

              {status === 'Rejected' && request.type === 'Subscription' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejection Reason
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Enter rejection reason..."
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                  placeholder="Enter notes or reason..."
                />
              </div>
            </form>
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
              status === 'Accepted'
                ? 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            }`}
          >
            {loading ? 'Processing...' : status === 'Accepted' ?
              (request.type === 'Subscription' ? 'Approve Request' : 'Accept Request') :
              'Reject Request'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllRequestsManagement;