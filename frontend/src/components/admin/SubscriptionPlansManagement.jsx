import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SubscriptionPlansManagement = () => {
    const [plans, setPlans] = useState([]);
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
        includedServices: [{ serviceName: '', description: '' }],
        maxBookingsPerMonth: '',
        discountPercentage: '',
        priority: '0',
        isActive: true
    });
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchPlans();
        fetchStats();
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

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
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
            includedServices: [...formData.includedServices, { serviceName: '', description: '' }] 
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
                includedServices: formData.includedServices.filter(s => s.serviceName.trim() !== '')
            };

            if (editingPlan) {
                await axios.put(`http://localhost:5000/api/subscriptions/admin/plans/${editingPlan._id}`, submitData, {
                    headers: { 'x-auth-token': token }
                });
                alert('Plan updated successfully!');
            } else {
                await axios.post('http://localhost:5000/api/subscriptions/admin/plans', submitData, {
                    headers: { 'x-auth-token': token }
                });
                alert('Plan created successfully!');
            }

            resetForm();
            fetchPlans();
            fetchStats();
        } catch (error) {
            console.error('Error saving plan:', error);
            alert(error.response?.data?.message || 'Error saving plan');
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
            includedServices: plan.includedServices.length > 0 ? plan.includedServices : [{ serviceName: '', description: '' }],
            maxBookingsPerMonth: plan.maxBookingsPerMonth.toString(),
            discountPercentage: plan.discountPercentage.toString(),
            priority: plan.priority.toString(),
            isActive: plan.isActive
        });
        setShowCreateForm(true);
    };

    const handleDelete = async (planId) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/subscriptions/admin/plans/${planId}`, {
                    headers: { 'x-auth-token': token }
                });
                alert('Plan deleted successfully!');
                fetchPlans();
                fetchStats();
            } catch (error) {
                console.error('Error deleting plan:', error);
                alert(error.response?.data?.message || 'Error deleting plan');
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
            includedServices: [{ serviceName: '', description: '' }],
            maxBookingsPerMonth: '',
            discountPercentage: '',
            priority: '0',
            isActive: true
        });
        setEditingPlan(null);
        setShowCreateForm(false);
    };

    const planTypeColors = {
        Basic: 'bg-gray-100 text-gray-800',
        Silver: 'bg-gray-100 text-gray-700',
        Gold: 'bg-yellow-100 text-yellow-800',
        Platinum: 'bg-purple-100 text-purple-800',
        Premium: 'bg-blue-100 text-blue-800'
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
                <h1 className="text-3xl font-bold text-gray-800">Subscription Plans Management</h1>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Create New Plan
                </button>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Subscriptions</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.totalSubscriptions}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Subscriptions</h3>
                        <p className="text-3xl font-bold text-green-600">{stats.activeSubscriptions}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Revenue</h3>
                        <p className="text-3xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Available Plans</h3>
                        <p className="text-3xl font-bold text-purple-600">{plans.length}</p>
                    </div>
                </div>
            )}

            {/* Create/Edit Form Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">
                                {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Plan Name (Internal)
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
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
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Plan Type
                                    </label>
                                    <select
                                        name="planType"
                                        value={formData.planType}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        required
                                    >
                                        <option value="Basic">Basic</option>
                                        <option value="Silver">Silver</option>
                                        <option value="Gold">Gold</option>
                                        <option value="Platinum">Platinum</option>
                                        <option value="Premium">Premium</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
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
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Bookings/Month (0 = Unlimited)
                                    </label>
                                    <input
                                        type="number"
                                        name="maxBookingsPerMonth"
                                        value={formData.maxBookingsPerMonth}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Percentage
                                    </label>
                                    <input
                                        type="number"
                                        name="discountPercentage"
                                        value={formData.discountPercentage}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Priority (Higher = Top)
                                    </label>
                                    <input
                                        type="number"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
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
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>

                            {/* Features */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            className="flex-1 p-2 border border-gray-300 rounded-md mr-2"
                                            placeholder="Enter feature"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    + Add Feature
                                </button>
                            </div>

                            {/* Included Services */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Included Services</label>
                                {formData.includedServices.map((service, index) => (
                                    <div key={index} className="border p-3 rounded-md mb-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={service.serviceName}
                                                onChange={(e) => handleServiceChange(index, 'serviceName', e.target.value)}
                                                className="p-2 border border-gray-300 rounded-md"
                                                placeholder="Service Name"
                                            />
                                            <input
                                                type="text"
                                                value={service.description}
                                                onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                                                className="p-2 border border-gray-300 rounded-md"
                                                placeholder="Service Description"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeService(index)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            Remove Service
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addService}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    + Add Service
                                </button>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                />
                                <label className="text-sm font-medium text-gray-700">Active Plan</label>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Plans List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Current Subscription Plans</h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Bookings</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {plans.map((plan) => (
                                <tr key={plan._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{plan.displayName}</div>
                                            <div className="text-sm text-gray-500">{plan.description}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${planTypeColors[plan.planType]}`}>
                                            {plan.planType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₹{plan.price.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {plan.duration} days
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {plan.maxBookingsPerMonth || 'Unlimited'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {plan.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(plan)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(plan._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlansManagement;