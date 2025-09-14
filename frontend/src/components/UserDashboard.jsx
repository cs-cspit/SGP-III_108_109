import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [userInfo, setUserInfo] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [payments, setPayments] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editProfile, setEditProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({});

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Fetch user info
            const userResponse = await axios.get('http://localhost:5000/api/auth/user', {
                headers: { 'x-auth-token': token }
            });
            setUserInfo(userResponse.data);
            setProfileForm(userResponse.data);

            // Fetch user bookings
            const bookingsResponse = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
                headers: { 'x-auth-token': token }
            });
            setBookings(bookingsResponse.data.data);

            // Fetch user payments
            const paymentsResponse = await axios.get('http://localhost:5000/api/payments/my-payments', {
                headers: { 'x-auth-token': token }
            });
            setPayments(paymentsResponse.data.data.payments);

            // Fetch user subscription
            const subscriptionResponse = await axios.get('http://localhost:5000/api/subscriptions/my-subscription', {
                headers: { 'x-auth-token': token }
            });
            setSubscription(subscriptionResponse.data.data);

        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/auth/update-profile', profileForm, {
                headers: { 'x-auth-token': token }
            });
            
            alert('Profile updated successfully!');
            setEditProfile(false);
            fetchUserData();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        }
    };

    const handleProfileFormChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setProfileForm({
                ...profileForm,
                [parent]: {
                    ...profileForm[parent],
                    [child]: value
                }
            });
        } else {
            setProfileForm({
                ...profileForm,
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

    const getStatusBadge = (status) => {
        const statusColors = {
            'Confirmed': 'bg-green-100 text-green-800',
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Cancelled': 'bg-red-100 text-red-800',
            'Completed': 'bg-green-100 text-green-800',
            'Failed': 'bg-red-100 text-red-800'
        };
        
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Welcome, {userInfo?.name}!</h1>
                    <p className="text-gray-600">Manage your bookings, payments, and profile</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                        {userInfo?.name?.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'overview', name: 'Overview', icon: '📊' },
                        { id: 'bookings', name: 'My Bookings', icon: '📅' },
                        { id: 'payments', name: 'Payment History', icon: '💳' },
                        { id: 'subscription', name: 'Subscription', icon: '⭐' },
                        { id: 'profile', name: 'Profile', icon: '👤' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Bookings</h3>
                            <p className="text-3xl font-bold text-blue-600">{bookings.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Spent</h3>
                            <p className="text-3xl font-bold text-green-600">
                                ₹{payments.reduce((sum, payment) => sum + (payment.amount || 0), 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Bookings</h3>
                            <p className="text-3xl font-bold text-orange-600">
                                {bookings.filter(b => b.status === 'Confirmed').length}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Subscription Status</h3>
                            <p className="text-lg font-bold text-purple-600">
                                {subscription ? subscription.subscriptionPlanId.displayName : 'No Plan'}
                            </p>
                        </div>
                    </div>

                    {/* Recent Bookings */}
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">Recent Bookings</h2>
                        </div>
                        <div className="p-6">
                            {bookings.slice(0, 5).map((booking) => (
                                <div key={booking._id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{booking.bookingId}</h3>
                                        <p className="text-sm text-gray-600">{booking.eventType} - {formatDate(booking.eventDate)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">₹{booking.totalAmount.toLocaleString()}</p>
                                        {getStatusBadge(booking.status)}
                                    </div>
                                </div>
                            ))}
                            {bookings.length === 0 && (
                                <p className="text-gray-500 text-center py-8">No bookings yet. Start by booking your first event!</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
                <div className="bg-white rounded-lg shadow-md">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">My Bookings</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {booking.bookingId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{booking.eventType}</div>
                                                <div className="text-sm text-gray-500">{booking.venue}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(booking.eventDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ₹{booking.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(booking.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-indigo-600 hover:text-indigo-900">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
                <div className="bg-white rounded-lg shadow-md">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Payment History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {payment.paymentId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {payment.bookingId?.bookingId || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ₹{payment.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {payment.paymentMethod}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(payment.paymentDate)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
                <div className="space-y-6">
                    {subscription ? (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Subscription</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-600 mb-2">
                                        {subscription.subscriptionPlanId.displayName}
                                    </h3>
                                    <p className="text-gray-600 mb-4">{subscription.subscriptionPlanId.description}</p>
                                    <div className="space-y-2">
                                        <p><strong>Status:</strong> {getStatusBadge(subscription.status)}</p>
                                        <p><strong>Valid Until:</strong> {formatDate(subscription.endDate)}</p>
                                        <p><strong>Bookings Used:</strong> {subscription.bookingsUsed} / {subscription.maxBookingsAllowed || '∞'}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">Plan Features:</h4>
                                    <ul className="space-y-1">
                                        {subscription.subscriptionPlanId.features.map((feature, index) => (
                                            <li key={index} className="text-sm text-gray-700 flex items-center">
                                                <span className="text-green-500 mr-2">✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">No Active Subscription</h2>
                            <p className="text-gray-600 mb-6">Subscribe to a plan to enjoy exclusive benefits and discounts.</p>
                            <button 
                                onClick={() => window.location.href = '/Subscriptions'}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
                            >
                                View Available Plans
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="bg-white rounded-lg shadow-md">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
                        <button
                            onClick={() => setEditProfile(!editProfile)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                        >
                            {editProfile ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>
                    
                    {editProfile ? (
                        <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profileForm.name || ''}
                                        onChange={handleProfileFormChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileForm.email || ''}
                                        onChange={handleProfileFormChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profileForm.phone || ''}
                                        onChange={handleProfileFormChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        name="address.city"
                                        value={profileForm.address?.city || ''}
                                        onChange={handleProfileFormChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setEditProfile(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Name</label>
                                        <p className="text-lg text-gray-900">{userInfo?.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <p className="text-lg text-gray-900">{userInfo?.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Phone</label>
                                        <p className="text-lg text-gray-900">{userInfo?.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Member Since</label>
                                        <p className="text-lg text-gray-900">{formatDate(userInfo?.createdAt)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Account Status</label>
                                        <p className="text-lg text-gray-900">
                                            {userInfo?.isVerified ? '✅ Verified' : '⏳ Pending Verification'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Location</label>
                                        <p className="text-lg text-gray-900">
                                            {userInfo?.address?.city ? `${userInfo.address.city}, ${userInfo.address.state}` : 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;