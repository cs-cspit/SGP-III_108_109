import React, { useState } from 'react';

const ProcessPaymentModal = ({ isOpen, onClose, onRequestProcessed, request }) => {
  const [status, setStatus] = useState('Accepted');
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!request) {
      return;
    }
    setLoading(true);
    
    try {
      await onRequestProcessed(request.bookingId, request.paymentRequests._id, status, adminNotes);
      onClose();
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6 sm:p-0">
      <div
        className="absolute inset-0 bg-gray-500 bg-opacity-75"
        onClick={onClose}
      ></div>

      <div className="relative z-10 inline-block w-full max-w-lg align-bottom overflow-hidden rounded-lg bg-white text-left shadow-xl transform transition-all sm:my-8 sm:w-full sm:align-middle">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Process Payment Request
              </h3>
              <div className="mt-4">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="font-medium">{request.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Booking ID</p>
                      <p className="font-medium">{request.bookingId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-medium">
                        ₹{request.paymentRequests.amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Method</p>
                      <p className="font-medium">{request.paymentRequests.paymentMethod}</p>
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
                        <span className="ml-2 text-sm text-gray-600">Accept</span>
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
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {loading ? 'Processing...' : status === 'Accepted' ? 'Accept Request' : 'Reject Request'}
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

export default ProcessPaymentModal;