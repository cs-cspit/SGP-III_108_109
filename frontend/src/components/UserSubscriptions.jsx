import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
            console.error('Error fetching plans:', error);
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
            console.error('Error fetching current subscription:', error);
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
            alert('Subscription successful!');
            fetchCurrentSubscription();
            setShowConfirmation(false);
            setSelectedPlan(null);
        } catch (error) {
            console.error('Error subscribing:', error);
            alert(error.response?.data?.message || 'Error subscribing to plan');
        }
    };

    const handleCancelSubscription = async () => {
        if (window.confirm('Are you sure you want to cancel your subscription?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.put('http://localhost:5000/api/subscriptions/cancel', 
                    { reason: 'User requested cancellation' },
                    { headers: { 'x-auth-token': token } }
                );
                alert('Subscription cancelled successfully!');
                fetchCurrentSubscription();
            } catch (error) {
                console.error('Error cancelling subscription:', error);
                alert(error.response?.data?.message || 'Error cancelling subscription');
            }
        }
    };

    const planTypeColors = {
        Basic: 'border-gray-200 bg-white',
        Silver: 'border-gray-300 bg-gray-50',
        Gold: 'border-yellow-300 bg-yellow-50',
        Platinum: 'border-purple-300 bg-purple-50',
        Premium: 'border-blue-300 bg-blue-50'
    };

    const planTypeGradients = {
        Basic: 'from-gray-400 to-gray-600',
        Silver: 'from-gray-400 to-gray-600',
        Gold: 'from-yellow-400 to-yellow-600',
        Platinum: 'from-purple-400 to-purple-600',
        Premium: 'from-blue-400 to-blue-600'
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
        return diffDays;
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
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Subscription Plans</h1>

            {/* Current Subscription Status */}
            {currentSubscription && (
                <div className="mb-8 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Current Subscription</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Plan</p>
                            <p className="text-lg font-semibold text-blue-600">
                                {currentSubscription.subscriptionPlanId.displayName}
                            </p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r text-white ${planTypeGradients[currentSubscription.subscriptionPlanId.planType]}`}>
                                {currentSubscription.subscriptionPlanId.planType}
                            </span>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                currentSubscription.status === 'Active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {currentSubscription.status}
                            </span>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Valid Until</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {formatDate(currentSubscription.endDate)}
                            </p>
                            <p className="text-sm text-blue-600">
                                {getDaysRemaining(currentSubscription.endDate)} days remaining
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Bookings Used</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {currentSubscription.bookingsUsed} / {currentSubscription.maxBookingsAllowed || '∞'}
                            </p>
                        </div>
                    </div>
                    
                    {currentSubscription.status === 'Active' && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={handleCancelSubscription}
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
                            >
                                Cancel Subscription
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Available Plans */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    {currentSubscription ? 'Upgrade Your Plan' : 'Choose a Plan'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {availablePlans.map((plan) => (
                        <div
                            key={plan._id}
                            className={`relative rounded-2xl p-8 shadow-lg border-2 ${planTypeColors[plan.planType]} ${plan.planType === 'Gold' ? 'ring-2 ring-yellow-300' : ''}`}
                        >
                            {plan.planType === 'Gold' && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                        Most Popular
                                    </span>
                                </div>
                            )}
                            
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.displayName}</h3>
                                <div className={`inline-block px-4 py-2 rounded-full text-white font-medium bg-gradient-to-r ${planTypeGradients[plan.planType]} mb-4`}>
                                    {plan.planType}
                                </div>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">₹{plan.price.toLocaleString()}</span>
                                    <span className="text-gray-600">/{plan.duration} days</span>
                                </div>
                                <p className="text-gray-600 mb-6">{plan.description}</p>
                            </div>

                            {/* Features */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                                <ul className="space-y-2">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center text-sm text-gray-700">
                                            <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Included Services */}
                            {plan.includedServices.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-900 mb-3">Included Services:</h4>
                                    <ul className="space-y-2">
                                        {plan.includedServices.map((service, index) => (
                                            <li key={index} className="text-sm text-gray-700">
                                                <span className="font-medium">{service.serviceName}</span>
                                                {service.description && (
                                                    <p className="text-xs text-gray-500">{service.description}</p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Plan Details */}
                            <div className="mb-6 text-sm text-gray-600">
                                <div className="flex justify-between mb-2">
                                    <span>Duration:</span>
                                    <span className="font-medium">{plan.duration} days</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span>Max Bookings/Month:</span>
                                    <span className="font-medium">{plan.maxBookingsPerMonth || 'Unlimited'}</span>
                                </div>
                                {plan.discountPercentage > 0 && (
                                    <div className="flex justify-between mb-2">
                                        <span>Discount:</span>
                                        <span className="font-medium text-green-600">{plan.discountPercentage}% off</span>
                                    </div>
                                )}
                            </div>

                            {/* Subscribe Button */}
                            <button
                                onClick={() => {
                                    if (currentSubscription && currentSubscription.status === 'Active') {
                                        alert('You already have an active subscription. Please cancel it first to subscribe to a new plan.');
                                        return;
                                    }
                                    setSelectedPlan(plan);
                                    setShowConfirmation(true);
                                }}
                                disabled={currentSubscription && currentSubscription.status === 'Active'}
                                className={`w-full py-3 px-6 rounded-lg font-medium transition duration-200 ${
                                    currentSubscription && currentSubscription.status === 'Active'
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : plan.planType === 'Gold'
                                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                            >
                                {currentSubscription && currentSubscription.status === 'Active' 
                                    ? 'Current Plan Active' 
                                    : 'Subscribe Now'
                                }
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && selectedPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Subscription</h3>
                        
                        <div className="mb-6">
                            <p className="text-gray-700 mb-2">You're about to subscribe to:</p>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-lg">{selectedPlan.displayName}</h4>
                                <p className="text-gray-600">{selectedPlan.planType} Plan</p>
                                <p className="text-2xl font-bold text-blue-600 mt-2">₹{selectedPlan.price.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">Valid for {selectedPlan.duration} days</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mb-2">Payment Method:</p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-sm text-yellow-800">
                                    <strong>Demo Mode:</strong> This is a mock payment. In production, integrate with Razorpay/Stripe.
                                </p>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => {
                                    setShowConfirmation(false);
                                    setSelectedPlan(null);
                                }}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSubscribe(selectedPlan._id)}
                                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserSubscriptions;