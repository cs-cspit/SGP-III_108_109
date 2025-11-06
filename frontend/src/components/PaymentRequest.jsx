import React, { useState } from 'react';
import axios from 'axios';

const PaymentRequest = ({ booking, onPaymentRequestCreated }) => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: booking.pricing.remainingAmount.toString(),
    paymentMethod: 'Cash'
  });
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/bookings/${booking._id}/payment-request`,
        paymentData,
        { headers: { 'x-auth-token': token } }
      );
      
      alert('Payment request submitted successfully!');
      setShowRequestForm(false);
      setPaymentData({ 
        amount: booking.pricing.remainingAmount.toString(), 
        paymentMethod: 'Cash' 
      });
      
      // Notify parent component
      if (onPaymentRequestCreated) {
        onPaymentRequestCreated(response.data.data);
      }
    } catch (error) {
      console.error('Error submitting payment request:', error);
      alert(error.response?.data?.message || 'Error submitting payment request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this payment request?')) {
      return;
    }
    
    setCancelLoading(prev => ({ ...prev, [requestId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/bookings/${booking._id}/payment-requests/${requestId}`,
        { headers: { 'x-auth-token': token } }
      );
      
      alert('Payment request cancelled successfully!');
      
      // Notify parent component to refresh data
      if (onPaymentRequestCreated) {
        onPaymentRequestCreated();
      }
    } catch (error) {
      console.error('Error cancelling payment request:', error);
      alert(error.response?.data?.message || 'Error cancelling payment request');
    } finally {
      setCancelLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Request</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(booking.pricing.totalAmount)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Amount Paid</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(booking.pricing.totalAmount - booking.pricing.remainingAmount)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Remaining Amount</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(booking.pricing.remainingAmount)}</p>
        </div>
      </div>

      {booking.paymentRequests && booking.paymentRequests.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Recent Payment Requests</h4>
          <div className="space-y-3">
            {booking.paymentRequests.slice(0, 5).map((request) => (
              <div key={request._id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{formatCurrency(request.amount)}</p>
                  <p className="text-sm text-gray-600">{request.paymentMethod}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}>
                      {request.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </p>
                  </div>
                  {request.status === 'Pending' && (
                    <button
                      onClick={() => handleCancelRequest(request._id)}
                      disabled={cancelLoading[request._id]}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      {cancelLoading[request._id] ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showRequestForm ? (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowRequestForm(true)}
            className="flex-1 py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
          >
            Request Payment
          </button>
          {booking.paymentStatus !== 'Fully Paid' && (
            <button
              onClick={() => {
                setPaymentData({
                  amount: booking.pricing.remainingAmount.toString(),
                  paymentMethod: 'Cash'
                });
                setShowRequestForm(true);
              }}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Pay Full Amount
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              name="amount"
              value={paymentData.amount}
              onChange={handleInputChange}
              min="1"
              max={booking.pricing.remainingAmount}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum: {formatCurrency(booking.pricing.remainingAmount)}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={paymentData.paymentMethod}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              required
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cheque">Cheque</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowRequestForm(false)}
              className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PaymentRequest;