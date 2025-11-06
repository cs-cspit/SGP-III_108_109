import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllRequests();
  }, [filterType, filterStatus]);

  const fetchAllRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch payment requests (from bookings)
      const paymentResponse = await axios.get(
        `http://localhost:5000/api/bookings/my-bookings`,
        { headers: { 'x-auth-token': token } }
      );
      
      // Fetch subscription requests
      const subscriptionResponse = await axios.get(
        'http://localhost:5000/api/subscriptions/my-subscription',
        { headers: { 'x-auth-token': token } }
      );
      
      // Process payment requests
      const paymentRequests = [];
      paymentResponse.data.bookings.forEach(booking => {
        booking.paymentRequests.forEach(request => {
          paymentRequests.push({
            id: request._id,
            type: 'Payment',
            bookingId: booking.bookingId,
            eventType: booking.eventType,
            amount: request.amount,
            paymentMethod: request.paymentMethod,
            requestDate: request.requestDate,
            status: request.status,
            adminNotes: request.adminNotes,
            processedDate: request.processedDate,
            totalAmount: booking.pricing.totalAmount,
            paidAmount: booking.pricing.totalAmount - booking.pricing.remainingAmount
          });
        });
      });
      
      // Process subscription requests
      const subscriptionRequests = [];
      if (subscriptionResponse.data.data) {
        const subscription = subscriptionResponse.data.data;
        subscriptionRequests.push({
          id: subscription._id,
          type: 'Subscription',
          packageName: subscription.subscriptionPlanId?.displayName,
          packageType: subscription.subscriptionPlanId?.planType,
          amount: subscription.amountPaid,
          requestDate: subscription.createdAt,
          status: subscription.status,
          adminNotes: subscription.adminApproval?.adminNotes,
          rejectionReason: subscription.adminApproval?.rejectionReason,
          approvalDate: subscription.adminApproval?.approvalDate,
          startDate: subscription.startDate,
          endDate: subscription.endDate
        });
      }
      
      // Combine all requests
      const allRequests = [...paymentRequests, ...subscriptionRequests];
      
      // Sort by request date (newest first)
      allRequests.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
      
      setRequests(allRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
      }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
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

  // Filter requests based on type and status
  const filteredRequests = requests.filter(request => {
    const typeMatch = filterType === '' || request.type === filterType;
    const statusMatch = filterStatus === '' || request.status === filterStatus;
    return typeMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-600 mt-1">View and manage all your payment and subscription requests</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
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
                onChange={(e) => setFilterStatus(e.target.value)}
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
                onClick={() => navigate('/Dashboard')}
                className="w-full px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterType === '' && filterStatus === '' 
                ? 'You have not submitted any requests yet.' 
                : `No requests match your filter criteria.`}
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/Dashboard')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                View Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.type}</div>
                      </td>
                      <td className="px-6 py-4">
                        {request.type === 'Payment' ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.bookingId}</div>
                            <div className="text-sm text-gray-500">{request.eventType}</div>
                            <div className="text-xs text-gray-500">
                              {formatCurrency(request.paidAmount)} / {formatCurrency(request.totalAmount)}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.packageName}</div>
                            <div className="text-sm text-gray-500">{request.packageType}</div>
                            {request.rejectionReason && (
                              <div className="text-xs text-red-600 mt-1">Reason: {request.rejectionReason}</div>
                            )}
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
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        {request.adminNotes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;