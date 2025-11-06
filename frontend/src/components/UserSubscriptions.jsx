import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';

const UserSubscriptions = () => {
    const [availablePlans, setAvailablePlans] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        fetchAvailablePlans();
        fetchCurrentSubscription();
    }, []);

    const fetchAvailablePlans = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/subscriptions/plans');
            setAvailablePlans(response.data.data);
        } catch (error) {
            console.error('Error fetching packages:', error);
        }
    };

    const fetchCurrentSubscription = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/subscriptions/my-subscription', {
                headers: { 'x-auth-token': token }
            });
            setCurrentSubscription(response.data.data);
        } catch (error) {
            console.error('Error fetching current package:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (planId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/subscriptions/subscribe', 
                { planId, paymentMethod: 'mock' },
                { headers: { 'x-auth-token': token } }
            );
            alert('Package purchased successfully!');
            fetchCurrentSubscription();
            setShowConfirmation(false);
            setSelectedPlan(null);
        } catch (error) {
            console.error('Error purchasing package:', error);
            alert(error.response?.data?.message || 'Error purchasing package');
        }
    };

    const handleCancelSubscription = async () => {
        if (window.confirm('Are you sure you want to cancel your package? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.put('http://localhost:5000/api/subscriptions/cancel', 
                    { reason: 'User requested cancellation' },
                    { headers: { 'x-auth-token': token } }
                );
                alert('Package cancelled successfully!');
                fetchCurrentSubscription();
            } catch (error) {
                console.error('Error cancelling package:', error);
                alert(error.response?.data?.message || 'Error cancelling package');
            }
        }
    };

    // Function to display package details
    const displayPackageDetails = (plan) => {
        const manpower = plan.manpower || {};
        const details = [];
        
        if (manpower.photographers > 0) {
            details.push(`${manpower.photographers} Photographer${manpower.photographers > 1 ? 's' : ''}`);
        }
        if (manpower.videographers > 0) {
            details.push(`${manpower.videographers} Videographer${manpower.videographers > 1 ? 's' : ''}`);
        }
        if (manpower.candidPhotographers > 0) {
            details.push(`${manpower.candidPhotographers} Candid Photographer${manpower.candidPhotographers > 1 ? 's' : ''}`);
        }
        if (manpower.cinematographers > 0) {
            details.push(`${manpower.cinematographers} Cinematographer${manpower.cinematographers > 1 ? 's' : ''}`);
        }
        if (manpower.droneOperators > 0) {
            details.push(`${manpower.droneOperators} Drone Operator${manpower.droneOperators > 1 ? 's' : ''}`);
        }
        
        return details.join(', ') || 'No manpower details';
    };

    // Function to get manpower details as array
    const getManpowerDetails = (plan) => {
        const manpower = plan.manpower || {};
        const details = [];
        
        if (manpower.photographers > 0) {
            details.push({ role: 'Photographer', count: manpower.photographers });
        }
        if (manpower.videographers > 0) {
            details.push({ role: 'Videographer', count: manpower.videographers });
        }
        if (manpower.candidPhotographers > 0) {
            details.push({ role: 'Candid Photographer', count: manpower.candidPhotographers });
        }
        if (manpower.cinematographers > 0) {
            details.push({ role: 'Cinematographer', count: manpower.cinematographers });
        }
        if (manpower.droneOperators > 0) {
            details.push({ role: 'Drone Operator', count: manpower.droneOperators });
        }
        
        return details;
    };

    const planTypeColors = {
        Silver: 'border-gray-300 bg-white',
        Gold: 'border-yellow-300 bg-yellow-50',
        Platinum: 'border-purple-300 bg-purple-50',
        Diamond: 'border-blue-300 bg-blue-50'
    };

    const planTypeBadges = {
        Silver: 'bg-gray-100 text-gray-800',
        Gold: 'bg-yellow-100 text-yellow-800',
        Platinum: 'bg-purple-100 text-purple-800',
        Diamond: 'bg-blue-100 text-blue-800'
    };

    const planTypeIcons = {
        Silver: '🥈',
        Gold: '🥇',
        Platinum: '🏆',
        Diamond: '💎'
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDaysRemaining = (endDate) => {
        const end = new Date(endDate);
        const now = new Date();
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="fixed top-0 left-0 right-0 z-50">
                    <Navbar />
                </div>
                <div className="pt-24 flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar />
            </div>
            
            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Photography Packages</h1>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Professional photography services tailored to your event needs
                        </p>
                    </div>

                    {/* Current Package Status */}
                    {currentSubscription && (
                        <div className="mb-12 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 md:mb-0">Your Current Package</h2>
                                {currentSubscription.status === 'Active' && (
                                    <button
                                        onClick={handleCancelSubscription}
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                        Cancel Package
                                    </button>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center mb-2">
                                        <span className="text-xl mr-2">{planTypeIcons[currentSubscription.subscriptionPlanId.planType]}</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{currentSubscription.subscriptionPlanId.displayName}</h3>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${planTypeBadges[currentSubscription.subscriptionPlanId.planType]}`}>
                                                {currentSubscription.subscriptionPlanId.planType}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">₹{currentSubscription.subscriptionPlanId.price.toLocaleString()}</p>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                        currentSubscription.status === 'Active' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {currentSubscription.status}
                                    </span>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Valid Until</h4>
                                    <p className="font-semibold text-gray-900">{formatDate(currentSubscription.endDate)}</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        {getDaysRemaining(currentSubscription.endDate)} days remaining
                                    </p>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Bookings Used</h4>
                                    <p className="font-semibold text-gray-900">
                                        {currentSubscription.bookingsUsed} / {currentSubscription.maxBookingsAllowed || '∞'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Available Packages */}
                    <div className="mb-8">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Package</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Select from our professionally designed photography packages
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {availablePlans.map((plan) => (
                                <div
                                    key={plan._id}
                                    className={`rounded-xl overflow-hidden shadow-sm border-2 transition-all duration-200 hover:shadow-md ${planTypeColors[plan.planType]} ${plan.planType === 'Gold' ? 'ring-1 ring-yellow-300' : ''}`}
                                >
                                    {plan.planType === 'Gold' && (
                                        <div className="bg-yellow-400 text-white text-center py-1 text-xs font-bold">
                                            MOST POPULAR
                                        </div>
                                    )}
                                    
                                    <div className="p-6">
                                        <div className="text-center mb-5">
                                            <div className="flex justify-center mb-2">
                                                <span className="text-3xl">{planTypeIcons[plan.planType]}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.displayName}</h3>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${planTypeBadges[plan.planType]}`}>
                                                {plan.planType}
                                            </span>
                                        </div>
                                        
                                        <div className="mb-5 text-center">
                                            <div className="mb-1">
                                                <span className="text-3xl font-bold text-gray-900">₹{plan.price.toLocaleString()}</span>
                                            </div>
                                            <p className="text-gray-600 text-sm">for {plan.duration} day{plan.duration > 1 ? 's' : ''}</p>
                                        </div>
                                        
                                        <p className="text-gray-600 text-center text-sm mb-5 h-12 overflow-hidden">{plan.description}</p>
                                        
                                        {/* Manpower Details */}
                                        <div className="mb-5">
                                            <h4 className="font-semibold text-gray-900 mb-2 text-center text-sm">Team Composition</h4>
                                            <div className="space-y-1.5">
                                                {getManpowerDetails(plan).map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                                                        <span className="text-gray-700 text-sm">{item.role}</span>
                                                        <span className="font-semibold text-gray-900 text-sm">{item.count}</span>
                                                    </div>
                                                ))}
                                                {getManpowerDetails(plan).length === 0 && (
                                                    <p className="text-gray-500 text-center py-1 text-sm">No manpower details</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Features Preview */}
                                        <div className="mb-6">
                                            <h4 className="font-semibold text-gray-900 mb-2 text-center text-sm">Features</h4>
                                            <ul className="space-y-1.5">
                                                {plan.features.slice(0, 3).map((feature, index) => (
                                                    <li key={index} className="flex items-start text-sm text-gray-700">
                                                        <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                        </svg>
                                                        <span className="truncate">{feature}</span>
                                                    </li>
                                                ))}
                                                {plan.features.length > 3 && (
                                                    <li className="text-xs text-gray-500 text-center">+{plan.features.length - 3} more features</li>
                                                )}
                                            </ul>
                                        </div>
                                        
                                        {/* Purchase Button */}
                                        <button
                                            onClick={() => {
                                                if (currentSubscription && currentSubscription.status === 'Active') {
                                                    const confirmUpgrade = window.confirm('You already have an active package. Purchasing a new package will replace your current one. Do you want to continue?');
                                                    if (!confirmUpgrade) return;
                                                }
                                                setSelectedPlan(plan);
                                                setShowConfirmation(true);
                                            }}
                                            className={`w-full py-2.5 px-4 rounded-lg font-medium transition duration-200 text-sm ${
                                                plan.planType === 'Gold'
                                                    ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                                                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                                            }`}
                                        >
                                            {currentSubscription && currentSubscription.status === 'Active' 
                                                ? 'Upgrade Package' 
                                                : 'Choose Package'
                                            }
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Confirmation Modal */}
                    {showConfirmation && selectedPlan && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold text-gray-900">Confirm Package</h3>
                                        <button
                                            onClick={() => {
                                                setShowConfirmation(false);
                                                setSelectedPlan(null);
                                            }}
                                            className="text-gray-400 hover:text-gray-500"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    <div className="mb-6">
                                        <div className="bg-gray-50 rounded-lg p-5 mb-5">
                                            <div className="flex items-center mb-4">
                                                <span className="text-2xl mr-2">{planTypeIcons[selectedPlan.planType]}</span>
                                                <div>
                                                    <h4 className="font-bold text-lg text-gray-900">{selectedPlan.displayName}</h4>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${planTypeBadges[selectedPlan.planType]}`}>
                                                        {selectedPlan.planType}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Price</p>
                                                    <p className="font-bold text-gray-900">₹{selectedPlan.price.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Duration</p>
                                                    <p className="font-bold text-gray-900">{selectedPlan.duration} day{selectedPlan.duration > 1 ? 's' : ''}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="border-t border-gray-200 pt-4">
                                                <p className="text-xs text-gray-500 mb-2">Team Composition</p>
                                                <div className="space-y-1">
                                                    {getManpowerDetails(selectedPlan).map((item, index) => (
                                                        <div key={index} className="flex justify-between text-sm">
                                                            <span className="text-gray-600">{item.role}</span>
                                                            <span className="font-medium text-gray-900">{item.count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-5">
                                            <p className="text-sm text-yellow-700">
                                                <span className="font-medium">Note:</span> This is a demo payment. In production, you would be redirected to a secure payment gateway.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={() => {
                                                setShowConfirmation(false);
                                                setSelectedPlan(null);
                                            }}
                                            className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleSubscribe(selectedPlan._id)}
                                            className="flex-1 py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium text-sm"
                                        >
                                            Confirm Payment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default UserSubscriptions;