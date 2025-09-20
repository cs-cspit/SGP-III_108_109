import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showCustomerDetails, setShowCustomerDetails] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    useEffect(() => {
        fetchCustomers();
        fetchStats();
    }, [currentPage, searchTerm, statusFilter]);

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/admin/customers', {
                headers: { 'x-auth-token': token },
                params: {
                    page: currentPage,
                    limit: 10,
                    search: searchTerm,
                    status: statusFilter
                }
            });
            setCustomers(response.data.customers);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/admin/customers/stats', {
                headers: { 'x-auth-token': token }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching customer stats:', error);
        }
    };

    const fetchCustomerDetails = async (customerId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/admin/customers/${customerId}`, {
                headers: { 'x-auth-token': token }
            });
            setSelectedCustomer(response.data);
            setShowCustomerDetails(true);
        } catch (error) {
            console.error('Error fetching customer details:', error);
            alert('Error fetching customer details');
        }
    };

    const handleToggleBlacklist = async (customerId, isCurrentlyBlacklisted) => {
        const reason = isCurrentlyBlacklisted 
            ? '' 
            : prompt('Please provide a reason for blacklisting this customer:');
        
        if (!isCurrentlyBlacklisted && !reason) {
            return; // User cancelled or didn't provide reason
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/customers/${customerId}/blacklist`, 
                { reason },
                { headers: { 'x-auth-token': token } }
            );
            
            alert(`Customer ${isCurrentlyBlacklisted ? 'removed from blacklist' : 'blacklisted'} successfully!`);
            fetchCustomers();
            fetchStats();
        } catch (error) {
            console.error('Error updating customer blacklist status:', error);
            alert('Error updating customer status');
        }
    };

    const handleVerifyCustomer = async (customerId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/customers/${customerId}/verify`, {}, {
                headers: { 'x-auth-token': token }
            });
            
            alert('Customer verified successfully!');
            fetchCustomers();
            fetchStats();
        } catch (error) {
            console.error('Error verifying customer:', error);
            alert('Error verifying customer');
        }
    };

    const handleEditCustomer = (customer) => {
        setEditFormData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone || '',
            address: {
                street: customer.address?.street || '',
                city: customer.address?.city || '',
                state: customer.address?.state || '',
                pincode: customer.address?.pincode || '',
                country: customer.address?.country || 'India'
            }
        });
        setSelectedCustomer(customer);
        setShowEditForm(true);
    };

    const handleUpdateCustomer = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/customers/${selectedCustomer._id}`, 
                editFormData,
                { headers: { 'x-auth-token': token } }
            );
            
            alert('Customer updated successfully!');
            setShowEditForm(false);
            fetchCustomers();
        } catch (error) {
            console.error('Error updating customer:', error);
            alert('Error updating customer');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setEditFormData({
                ...editFormData,
                [parent]: {
                    ...editFormData[parent],
                    [child]: value
                }
            });
        } else {
            setEditFormData({
                ...editFormData,
                [name]: value
            });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (customer) => {
        if (customer.isBlacklisted) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Blacklisted</span>;
        }
        if (customer.isVerified) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Verified</span>;
        }
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Unverified</span>;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Customers</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.overview.totalCustomers}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Customers</h3>
                        <p className="text-3xl font-bold text-green-600">{stats.overview.activeCustomers}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Verified Customers</h3>
                        <p className="text-3xl font-bold text-purple-600">{stats.overview.verifiedCustomers}</p>
                        <p className="text-sm text-gray-500">{stats.overview.verificationRate}% verified</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Blacklisted</h3>
                        <p className="text-3xl font-bold text-red-600">{stats.overview.blacklistedCustomers}</p>
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search Customers</label>
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Customers</option>
                            <option value="active">Active</option>
                            <option value="verified">Verified</option>
                            <option value="unverified">Unverified</option>
                            <option value="blacklisted">Blacklisted</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('');
                                setCurrentPage(1);
                            }}
                            className="w-full p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Customers List</h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {customers.map((customer) => (
                                <tr key={customer._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                                <div className="text-sm text-gray-500">{customer.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{customer.phone || 'Not provided'}</div>
                                        <div className="text-sm text-gray-500">
                                            {customer.address?.city ? `${customer.address.city}, ${customer.address.state}` : 'Address not provided'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(customer)}
                                        {customer.stats?.currentSubscription && (
                                            <div className="mt-1">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {customer.stats.currentSubscription.subscriptionPlanId.displayName}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {customer.stats?.totalBookings || 0} bookings
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            ₹{(customer.stats?.totalSpent || 0).toLocaleString()} spent
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(customer.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => fetchCustomerDetails(customer._id)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleEditCustomer(customer)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </button>
                                            {!customer.isVerified && (
                                                <button
                                                    onClick={() => handleVerifyCustomer(customer._id)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Verify
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleToggleBlacklist(customer._id, customer.isBlacklisted)}
                                                className={customer.isBlacklisted ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}
                                            >
                                                {customer.isBlacklisted ? 'Unblock' : 'Block'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between items-center">
                        <p className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Details Modal */}
            {showCustomerDetails && selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Customer Details</h2>
                            <button
                                onClick={() => setShowCustomerDetails(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                                <div className="space-y-2">
                                    <p><strong>Name:</strong> {selectedCustomer.customer.name}</p>
                                    <p><strong>Email:</strong> {selectedCustomer.customer.email}</p>
                                    <p><strong>Phone:</strong> {selectedCustomer.customer.phone || 'Not provided'}</p>
                                    <p><strong>Status:</strong> {getStatusBadge(selectedCustomer.customer)}</p>
                                    <p><strong>Joined:</strong> {formatDate(selectedCustomer.customer.createdAt)}</p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4">Statistics</h3>
                                <div className="space-y-2">
                                    <p><strong>Total Bookings:</strong> {selectedCustomer.stats.totalBookings}</p>
                                    <p><strong>Total Spent:</strong> ₹{selectedCustomer.stats.totalSpent.toLocaleString()}</p>
                                    <p><strong>Average Order Value:</strong> ₹{selectedCustomer.stats.averageOrderValue.toFixed(2)}</p>
                                    <p><strong>Active Subscriptions:</strong> {selectedCustomer.stats.activeSubscriptions}</p>
                                    {selectedCustomer.stats.lastBookingDate && (
                                        <p><strong>Last Booking:</strong> {formatDate(selectedCustomer.stats.lastBookingDate)}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Bookings */}
                        {selectedCustomer.bookings.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {selectedCustomer.bookings.slice(0, 5).map((booking) => (
                                                <tr key={booking._id}>
                                                    <td className="px-4 py-2 text-sm">{booking.bookingId}</td>
                                                    <td className="px-4 py-2 text-sm">{formatDate(booking.createdAt)}</td>
                                                    <td className="px-4 py-2 text-sm">{booking.eventType}</td>
                                                    <td className="px-4 py-2 text-sm">₹{booking.totalAmount.toLocaleString()}</td>
                                                    <td className="px-4 py-2 text-sm">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                            booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {booking.status}
                                                        </span>
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
            )}

            {/* Edit Customer Modal */}
            {showEditForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Edit Customer</h2>
                            <button
                                onClick={() => setShowEditForm(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateCustomer} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editFormData.name}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editFormData.email}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={editFormData.phone}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                                    <input
                                        type="text"
                                        name="address.street"
                                        value={editFormData.address?.street}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        name="address.city"
                                        value={editFormData.address?.city}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        name="address.state"
                                        value={editFormData.address?.state}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                    <input
                                        type="text"
                                        name="address.pincode"
                                        value={editFormData.address?.pincode}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <input
                                        type="text"
                                        name="address.country"
                                        value={editFormData.address?.country}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditForm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Update Customer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerManagement;