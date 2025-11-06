import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUsers, FaCalendarAlt, FaDollarSign, FaBox, FaExclamationTriangle,
  FaChartLine, FaCamera, FaClock
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/dashboard/stats', {
        headers: { 'x-auth-token': token }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center text-red-500">Error loading dashboard stats</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Studio Admin Dashboard</h1>
        <p className="text-gray-600">Overview of your studio management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaCalendarAlt className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overview.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaDollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{stats.overview.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaUsers className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overview.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaCamera className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Equipment</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overview.totalEquipment}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Equipment Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Available</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                {stats.inventory.available}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Rented</span>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                {stats.inventory.rented}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Maintenance</span>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                {stats.inventory.maintenance}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions & Alerts</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FaClock className="h-5 w-5 text-gray-700 mr-3" />
                <span className="text-sm font-medium text-gray-800">Pending Bookings</span>
              </div>
              <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
                {stats.bookings.pending}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FaExclamationTriangle className="h-5 w-5 text-gray-700 mr-3" />
                <span className="text-sm font-medium text-gray-800">Low Stock Items</span>
              </div>
              <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
                {stats.alerts.lowStock.length}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FaCalendarAlt className="h-5 w-5 text-gray-700 mr-3" />
                <span className="text-sm font-medium text-gray-800">Today's Bookings</span>
              </div>
              <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
                {stats.bookings.today}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FaExclamationTriangle className="h-5 w-5 text-gray-700 mr-3" />
                <span className="text-sm font-medium text-gray-800">Pending Requests</span>
              </div>
              <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
                {stats.alerts.pendingRequests}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {stats.recentActivity.recentBookings.map((booking) => (
              <div key={booking._id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{booking.bookingId}</p>
                  <p className="text-sm text-gray-600">{booking.customerId?.name}</p>
                  <p className="text-xs text-gray-500">{booking.eventType}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{booking.totalAmount}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    booking.status === 'Confirmed' ? 'bg-gray-100 text-gray-800' :
                    booking.status === 'Pending' ? 'bg-gray-200 text-gray-900' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
          <div className="space-y-3">
            {stats.alerts.lowStock.slice(0, 5).map((item) => (
              <div key={item._id} className="flex justify-between items-center p-3 border rounded-lg border-gray-200 bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.type}</p>
                </div>
                <div className="text-right">
                  <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {item.availableQuantity} left
                  </span>
                </div>
              </div>
            ))}
            {stats.alerts.lowStock.length === 0 && (
              <p className="text-gray-500 text-center py-4">No low stock items</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;