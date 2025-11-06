import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SubscriptionPlansManagement = () => {
    const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'requests'
    const [plans, setPlans] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        displayName: '',
        description: '',
        price: '',
        duration: '',
        planType: 'Silver',
        features: [''],
        includedServices: [{ serviceName: '', description: '', quantity: 1 }],
        manpower: {
            photographers: 0,
            videographers: 0,
            candidPhotographers: 0,
            cinematographers: 0,
            droneOperators: 0
        },
        maxBookingsPerMonth: '',
        discountPercentage: '',
        priority: '0',
        isActive: true
    });
    const [stats, setStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchPlans();
        fetchStats();
        fetchSubscriptions();
    }, []);

    const fetchPlans = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/subscriptions/admin/plans', {
                headers: { 'x-auth-token': token }
            });
            setPlans(response.data.data);
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/subscriptions/admin/stats', {
                headers: { 'x-auth-token': token }
            });
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchSubscriptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/subscriptions/admin/subscriptions', {
                headers: { 'x-auth-token': token }
            });
            setSubscriptions(response.data.data.subscriptions);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        }
    };

    const handleApproveSubscription = async (subscriptionId) => {
        if (!window.confirm('Are you sure you want to approve this subscription request?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/subscriptions/admin/subscriptions/${subscriptionId}/approve`, {}, {
                headers: { 'x-auth-token': token }
            });
            alert('Subscription approved successfully!');
            fetchSubscriptions();
            fetchStats();
        } catch (error) {
            console.error('Error approving subscription:', error);
            alert(error.response?.data?.message || 'Error approving subscription');
        }
    };

    const handleRejectSubscription = async (subscriptionId) => {
        const reason = prompt('Please enter rejection reason:');
        if (!reason) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/subscriptions/admin/subscriptions/${subscriptionId}/reject`, {
                rejectionReason: reason
            }, {
                headers: { 'x-auth-token': token }
            });
            alert('Subscription rejected successfully!');
            fetchSubscriptions();
            fetchStats();
        } catch (error) {
            console.error('Error rejecting subscription:', error);
            alert(error.response?.data?.message || 'Error rejecting subscription');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleManpowerChange = (field, value) => {
        setFormData({
            ...formData,
            manpower: {
                ...formData.manpower,
                [field]: parseInt(value) || 0
            }
        });
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData({ ...formData, features: newFeatures });
    };

    const addFeature = () => {
        setFormData({ ...formData, features: [...formData.features, ''] });
    };

    const removeFeature = (index) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures });
    };

    const handleServiceChange = (index, field, value) => {
        const newServices = [...formData.includedServices];
        newServices[index][field] = value;
        setFormData({ ...formData, includedServices: newServices });
    };

    const addService = () => {
        setFormData({ 
            ...formData, 
            includedServices: [...formData.includedServices, { serviceName: '', description: '', quantity: 1 }] 
        });
    };

    const removeService = (index) => {
        const newServices = formData.includedServices.filter((_, i) => i !== index);
        setFormData({ ...formData, includedServices: newServices });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const submitData = {
                ...formData,
                price: parseFloat(formData.price),
                duration: parseInt(formData.duration),
                maxBookingsPerMonth: parseInt(formData.maxBookingsPerMonth) || 0,
                discountPercentage: parseFloat(formData.discountPercentage) || 0,
                priority: parseInt(formData.priority) || 0,
                features: formData.features.filter(f => f.trim() !== ''),
                includedServices: formData.includedServices.filter(s => s.serviceName.trim() !== ''),
                manpower: {
                    photographers: parseInt(formData.manpower.photographers) || 0,
                    videographers: parseInt(formData.manpower.videographers) || 0,
                    candidPhotographers: parseInt(formData.manpower.candidPhotographers) || 0,
                    cinematographers: parseInt(formData.manpower.cinematographers) || 0,
                    droneOperators: parseInt(formData.manpower.droneOperators) || 0
                }
            };

            if (editingPlan) {
                await axios.put(`http://localhost:5000/api/subscriptions/admin/plans/${editingPlan._id}`, submitData, {
                    headers: { 'x-auth-token': token }
                });
                alert('Package updated successfully!');
            } else {
                await axios.post('http://localhost:5000/api/subscriptions/admin/plans', submitData, {
                    headers: { 'x-auth-token': token }
                });
                alert('Package created successfully!');
            }

            resetForm();
            fetchPlans();
            fetchStats();
        } catch (error) {
            console.error('Error saving package:', error);
            alert(error.response?.data?.message || 'Error saving package');
        }
    };

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            displayName: plan.displayName,
            description: plan.description,
            price: plan.price.toString(),
            duration: plan.duration.toString(),
            planType: plan.planType,
            features: plan.features.length > 0 ? plan.features : [''],
            includedServices: plan.includedServices.length > 0 ? plan.includedServices : [{ serviceName: '', description: '', quantity: 1 }],
            manpower: plan.manpower || {
                photographers: 0,
                videographers: 0,
                candidPhotographers: 0,
                cinematographers: 0,
                droneOperators: 0
            },
            maxBookingsPerMonth: plan.maxBookingsPerMonth.toString(),
            discountPercentage: plan.discountPercentage.toString(),
            priority: plan.priority.toString(),
            isActive: plan.isActive
        });
        setShowCreateForm(true);
    };

    const handleDelete = async (planId) => {
        if (window.confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/subscriptions/admin/plans/${planId}`, {
                    headers: { 'x-auth-token': token }
                });
                alert('Package deleted successfully!');
                fetchPlans();
                fetchStats();
            } catch (error) {
                console.error('Error deleting package:', error);
                alert(error.response?.data?.message || 'Error deleting package');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            displayName: '',
            description: '',
            price: '',
            duration: '',
            planType: 'Silver',
            features: [''],
            includedServices: [{ serviceName: '', description: '', quantity: 1 }],
            manpower: {
                photographers: 0,
                videographers: 0,
                candidPhotographers: 0,
                cinematographers: 0,
                droneOperators: 0
            },
            maxBookingsPerMonth: '',
            discountPercentage: '',
            priority: '0',
            isActive: true
        });
        setEditingPlan(null);
        setShowCreateForm(false);
    };

    const planTypeColors = {
        Silver: 'bg-gray-100 text-gray-800',
        Gold: 'bg-yellow-100 text-yellow-800',
        Platinum: 'bg-purple-100 text-purple-800',
        Diamond: 'bg-blue-100 text-blue-800'
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

    // Filter plans based on search and filter
    const filteredPlans = plans.filter(plan => {
        const matchesSearch = plan.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             plan.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || plan.planType === filterType;
        return matchesSearch && matchesFilter;
    });

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
                    <h1 className="text-2xl font-bold text-gray-900">Package Management</h1>
                    <p className="text-gray-600 mt-1">Manage photography packages & subscription requests</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4 md:mt-0 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium flex items-center transition-colors duration-200"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Create Package
                </button>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'plans'
                                ? 'border-gray-900 text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Packages
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'requests'
                                ? 'border-gray-900 text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Subscription Requests
                        {subscriptions.filter(s => s.status === 'Pending').length > 0 && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {subscriptions.filter(s => s.status === 'Pending').length}
                            </span>
                        )}
                    </button>
                </nav>
            </div>

            {/* Packages Tab */}
            {activeTab === 'plans' && (
                <div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Total Packages</h3>
                                <p className="text-xl font-bold text-gray-900">{stats.totalSubscriptions}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Active Packages</h3>
                                <p className="text-xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                                <p className="text-xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Available Packages</h3>
                                <p className="text-xl font-bold text-gray-900">{plans.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Packages</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="search"
                                placeholder="Search by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
                        <select
                            id="filter"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                        >
                            <option value="all">All Types</option>
                            <option value="Silver">Silver</option>
                            <option value="Gold">Gold</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Diamond">Diamond</option>
                        </select>
                    </div>
                </div>
            </div>

                    {/* Create/Edit Form Modal */}
                    {showCreateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
                        <div className="p-5 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingPlan ? 'Edit Package' : 'Create New Package'}
                                </h2>
                                <button
                                    onClick={resetForm}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div>
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Package Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Display Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="displayName"
                                                    value={formData.displayName}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Package Type
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {['Silver', 'Gold', 'Platinum', 'Diamond'].map((type) => (
                                                    <label key={type} className="flex items-center cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="planType"
                                                            value={type}
                                                            checked={formData.planType === type}
                                                            onChange={handleInputChange}
                                                            className="sr-only"
                                                        />
                                                        <div className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md border transition-all text-sm ${
                                                            formData.planType === type
                                                                ? 'border-gray-900 bg-gray-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}>
                                                            <span className="mr-1">{planTypeIcons[type]}</span>
                                                            <span>{type}</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Price (₹)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Duration (days)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="duration"
                                                    value={formData.duration}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Max Bookings/Month
                                                </label>
                                                <input
                                                    type="number"
                                                    name="maxBookingsPerMonth"
                                                    value={formData.maxBookingsPerMonth}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Discount (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="discountPercentage"
                                                    value={formData.discountPercentage}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    max="100"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Priority
                                            </label>
                                            <input
                                                type="number"
                                                name="priority"
                                                value={formData.priority}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                                required
                                            />
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="isActive"
                                                checked={formData.isActive}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                                            />
                                            <label className="ml-2 block text-sm text-gray-700">
                                                Active Package
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div>
                                    <div className="space-y-5">
                                        {/* Manpower Details */}
                                        <div className="border border-gray-200 rounded-lg p-4">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Manpower Details</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Photographers</label>
                                                    <input
                                                        type="number"
                                                        value={formData.manpower.photographers}
                                                        onChange={(e) => handleManpowerChange('photographers', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                                        min="0"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Videographers</label>
                                                    <input
                                                        type="number"
                                                        value={formData.manpower.videographers}
                                                        onChange={(e) => handleManpowerChange('videographers', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                                        min="0"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Candid Photographers</label>
                                                    <input
                                                        type="number"
                                                        value={formData.manpower.candidPhotographers}
                                                        onChange={(e) => handleManpowerChange('candidPhotographers', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                                        min="0"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Cinematographers</label>
                                                    <input
                                                        type="number"
                                                        value={formData.manpower.cinematographers}
                                                        onChange={(e) => handleManpowerChange('cinematographers', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                                        min="0"
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Drone Operators</label>
                                                    <input
                                                        type="number"
                                                        value={formData.manpower.droneOperators}
                                                        onChange={(e) => handleManpowerChange('droneOperators', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                                        min="0"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <div className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="text-sm font-semibold text-gray-900">Features</h3>
                                                <button
                                                    type="button"
                                                    onClick={addFeature}
                                                    className="text-gray-600 hover:text-gray-800 flex items-center text-xs font-medium"
                                                >
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                                    </svg>
                                                    Add
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {formData.features.map((feature, index) => (
                                                    <div key={index} className="flex items-center">
                                                        <input
                                                            type="text"
                                                            value={feature}
                                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                                            placeholder="Enter feature"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFeature(index)}
                                                            className="ml-2 p-1.5 text-red-500 hover:text-red-700"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Included Services */}
                                        <div className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="text-sm font-semibold text-gray-900">Included Services</h3>
                                                <button
                                                    type="button"
                                                    onClick={addService}
                                                    className="text-gray-600 hover:text-gray-800 flex items-center text-xs font-medium"
                                                >
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                                    </svg>
                                                    Add
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {formData.includedServices.map((service, index) => (
                                                    <div key={index} className="border border-gray-200 rounded-md p-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                                                            <input
                                                                type="text"
                                                                value={service.serviceName}
                                                                onChange={(e) => handleServiceChange(index, 'serviceName', e.target.value)}
                                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                                                placeholder="Service Name"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={service.description}
                                                                onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                                                placeholder="Description"
                                                            />
                                                            <input
                                                                type="number"
                                                                value={service.quantity}
                                                                onChange={(e) => handleServiceChange(index, 'quantity', e.target.value)}
                                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                                                placeholder="Qty"
                                                                min="1"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeService(index)}
                                                            className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center"
                                                        >
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                            </svg>
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md font-medium text-sm"
                                >
                                    {editingPlan ? 'Update Package' : 'Create Package'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

                    {/* Plans List */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Current Packages</h2>
                </div>
                
                {filteredPlans.length === 0 ? (
                    <div className="text-center py-10">
                        <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No packages found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || filterType !== 'all' 
                                ? 'No packages match your search criteria.' 
                                : 'Get started by creating a new package.'}
                        </p>
                        <div className="mt-4">
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                Create Package
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manpower</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPlans.map((plan) => (
                                    <tr key={plan._id} className="hover:bg-gray-50">
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-lg mr-2">{planTypeIcons[plan.planType]}</span>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{plan.displayName}</div>
                                                    <div className="text-xs text-gray-500">{plan.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${planTypeBadges[plan.planType]}`}>
                                                {plan.planType}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            ₹{plan.price.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {plan.duration}d
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex flex-col">
                                                <span>{plan.manpower?.photographers || 0}P</span>
                                                <span>{plan.manpower?.videographers || 0}V</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {plan.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(plan)}
                                                    className="text-gray-600 hover:text-gray-900 flex items-center text-xs"
                                                >
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                    </svg>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(plan._id)}
                                                    className="text-red-600 hover:text-red-900 flex items-center text-xs"
                                                >
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                    </div>
                </div>
            )}

            {/* Subscription Requests Tab */}
            {activeTab === 'requests' && (
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Requests</h2>
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {subscriptions.map((sub) => (
                                    <tr key={sub._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{sub.customerId?.name}</div>
                                                <div className="text-sm text-gray-500">{sub.customerId?.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{sub.subscriptionPlanId?.displayName}</div>
                                            <div className="text-sm text-gray-500">{sub.subscriptionPlanId?.planType}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ₹{sub.amountPaid?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                sub.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                sub.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                sub.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(sub.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {sub.status === 'Pending' ? (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleApproveSubscription(sub._id)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectSubscription(sub._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">No action</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {subscriptions.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No subscription requests found.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionPlansManagement;