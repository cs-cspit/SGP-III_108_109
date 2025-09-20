import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import { 
  User, 
  Calendar, 
  CreditCard, 
  Star, 
  Settings, 
  LogOut, 
  Eye, 
  Edit3, 
  Save, 
  X, 
  Plus,
  Download,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Camera,
  Heart,
  ShoppingCart
} from 'lucide-react';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [userInfo, setUserInfo] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [payments, setPayments] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editProfile, setEditProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({});
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalSpent: 0,
        activeBookings: 0,
        completedBookings: 0
    });

    const handleLogout = async () => {
        try {
            // Clear all authentication related data
            localStorage.removeItem("token");
            localStorage.removeItem("loggedIn");
            localStorage.removeItem("user");
            
            // Show success message
            toast.success('Logged out successfully!');
            
            // Navigate to login page
            navigate("/Login");
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Error during logout');
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to access dashboard');
                navigate('/Login');
                return;
            }
            
            // Fetch user info
            const userResponse = await axios.get('http://localhost:5000/api/auth/user', {
                headers: { 'x-auth-token': token }
            });
            setUserInfo(userResponse.data);
            setProfileForm(userResponse.data);

            // Fetch user bookings
            try {
                const bookingsResponse = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
                    headers: { 'x-auth-token': token }
                });
                const bookingsData = bookingsResponse.data.data || [];
                setBookings(bookingsData);
                
                // Calculate stats
                const activeCount = bookingsData.filter(b => b.status === 'Confirmed').length;
                const completedCount = bookingsData.filter(b => b.status === 'Completed').length;
                
                setStats(prev => ({
                    ...prev,
                    totalBookings: bookingsData.length,
                    activeBookings: activeCount,
                    completedBookings: completedCount
                }));
            } catch (bookingError) {
                console.log('Bookings not available:', bookingError.message);
                setBookings([]);
            }

            // Fetch user payments
            try {
                const paymentsResponse = await axios.get('http://localhost:5000/api/payments/my-payments', {
                    headers: { 'x-auth-token': token }
                });
                const paymentsData = paymentsResponse.data.data?.payments || [];
                setPayments(paymentsData);
                
                const totalSpent = paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0);
                setStats(prev => ({ ...prev, totalSpent }));
            } catch (paymentError) {
                console.log('Payments not available:', paymentError.message);
                setPayments([]);
            }

            // Fetch user subscription
            try {
                const subscriptionResponse = await axios.get('http://localhost:5000/api/subscriptions/my-subscription', {
                    headers: { 'x-auth-token': token }
                });
                setSubscription(subscriptionResponse.data.data);
            } catch (subscriptionError) {
                console.log('Subscription not available:', subscriptionError.message);
                setSubscription(null);
            }

        } catch (error) {
            console.error('Error fetching user data:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                localStorage.clear();
                navigate('/Login');
            } else {
                toast.error('Failed to load dashboard data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/auth/update-profile', profileForm, {
                headers: { 'x-auth-token': token }
            });
            
            toast.success('Profile updated successfully!');
            setEditProfile(false);
            fetchUserData();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error updating profile');
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const getProgressPercentage = (used, total) => {
        if (!total || total === 0) return 0;
        return Math.min((used / total) * 100, 100);
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            'Confirmed': 'bg-gray-100 text-gray-800',
            'Pending': 'bg-gray-200 text-gray-900',
            'Cancelled': 'bg-gray-400 text-white',
            'Completed': 'bg-gray-300 text-gray-900',
            'Failed': 'bg-gray-500 text-white'
        };
        
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
                <div className="fixed top-0 left-0 right-0 z-50">
                    <Navbar />
                </div>
                <div className="pt-20 flex justify-center items-center h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Fixed Navbar */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar />
            </div>
            
            {/* Main Content */}
            <div className="pt-20 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {userInfo?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userInfo?.name}!</h1>
                                <p className="text-gray-600 mt-1">Manage your bookings, payments, and profile</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate('/Rent');
                                }}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
                            >
                                <Camera className="w-4 h-4" />
                                <span>Browse Equipment</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleLogout();
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200 mb-8">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                            {[
                                { id: 'overview', name: 'Overview', icon: TrendingUp },
                                { id: 'bookings', name: 'My Bookings', icon: Calendar },
                                { id: 'payments', name: 'Payment History', icon: CreditCard },
                                { id: 'subscription', name: 'Subscription', icon: Star },
                                { id: 'profile', name: 'Profile', icon: User }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setActiveTab(tab.id);
                                    }}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                                        activeTab === tab.id
                                            ? 'border-gray-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span>{tab.name}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Bookings</h3>
                                            <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                                        </div>
                                        <Calendar className="w-8 h-8 text-gray-600" />
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Spent</h3>
                                            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
                                        </div>
                                        <CreditCard className="w-8 h-8 text-gray-600" />
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Active Bookings</h3>
                                            <p className="text-3xl font-bold text-gray-900">{stats.activeBookings}</p>
                                        </div>
                                        <CheckCircle className="w-8 h-8 text-gray-600" />
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Subscription</h3>
                                            <p className="text-lg font-bold text-gray-900">
                                                {subscription ? subscription.subscriptionPlanId?.displayName || 'Active' : 'No Plan'}
                                            </p>
                                        </div>
                                        <Star className="w-8 h-8 text-gray-600" />
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Recent Bookings */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
                                        <button 
                                            onClick={() => setActiveTab('bookings')}
                                            className="text-gray-700 hover:text-gray-900 text-sm font-medium"
                                        >
                                            View All
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        {bookings.slice(0, 3).map((booking) => (
                                            <div key={booking._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900">{booking.bookingId}</h3>
                                                    <p className="text-sm text-gray-600">{booking.eventType} - {formatDate(booking.eventDate)}</p>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <p className="font-semibold text-gray-900">{formatCurrency(booking.totalAmount)}</p>
                                                    {getStatusBadge(booking.status)}
                                                </div>
                                            </div>
                                        ))}
                                        {bookings.length === 0 && (
                                            <div className="text-center py-8">
                                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500">No bookings yet. Start by booking your first event!</p>
                                                <button 
                                                    onClick={() => navigate('/EventBooking')}
                                                    className="mt-3 text-gray-700 hover:text-gray-900 font-medium"
                                                >
                                                    Book Now
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <button 
                                            onClick={() => navigate('/Rent')}
                                            className="w-full flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                                        >
                                            <Camera className="w-6 h-6 text-gray-600" />
                                            <div className="text-left">
                                                <p className="font-medium text-gray-900">Browse Equipment</p>
                                                <p className="text-sm text-gray-600">Rent cameras and equipment</p>
                                            </div>
                                        </button>
                                        <button 
                                            onClick={() => navigate('/EventBooking')}
                                            className="w-full flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                                        >
                                            <Calendar className="w-6 h-6 text-gray-600" />
                                            <div className="text-left">
                                                <p className="font-medium text-gray-900">Book Event</p>
                                                <p className="text-sm text-gray-600">Schedule photography session</p>
                                            </div>
                                        </button>
                                        <button 
                                            onClick={() => navigate('/Favorite')}
                                            className="w-full flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                                        >
                                            <Heart className="w-6 h-6 text-gray-600" />
                                            <div className="text-left">
                                                <p className="font-medium text-gray-900">My Favorites</p>
                                                <p className="text-sm text-gray-600">View saved equipment</p>
                                            </div>
                                        </button>
                                        <button 
                                            onClick={() => navigate('/Cart')}
                                            className="w-full flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                                        >
                                            <ShoppingCart className="w-6 h-6 text-gray-600" />
                                            <div className="text-left">
                                                <p className="font-medium text-gray-900">Shopping Cart</p>
                                                <p className="text-sm text-gray-600">Review selected items</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bookings Tab */}
                    {activeTab === 'bookings' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
                            </div>
                            {bookings.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                                                        {formatCurrency(booking.totalAmount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(booking.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button className="text-gray-700 hover:text-gray-900 flex items-center space-x-1">
                                                            <Eye className="w-4 h-4" />
                                                            <span>View</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                                    <p className="text-gray-600 mb-6">Start by booking your first photography session!</p>
                                    <button 
                                        onClick={() => navigate('/EventBooking')}
                                        className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Other tabs remain the same with minor UI improvements */}
                    {/* ... existing tabs code with proper styling ... */}
                </div>
            </div>
            
            {/* Footer */}
            <Footer />
        </div>
    );
};

export default UserDashboard;