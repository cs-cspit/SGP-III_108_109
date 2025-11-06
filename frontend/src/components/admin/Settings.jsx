import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Define setting categories
  const categories = [
    { id: 'general', name: 'General' },
    { id: 'pricing', name: 'Pricing' },
    { id: 'email', name: 'Email' },
    { id: 'booking', name: 'Booking' },
    { id: 'payment', name: 'Payment' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/settings', {
        headers: { 'x-auth-token': token }
      });
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Error fetching settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const setting = settings.find(s => s.settingKey === key);
      if (setting) {
        const updatedSettings = settings.map(s => 
          s.settingKey === key ? { ...s, settingValue: value } : s
        );
        setSettings(updatedSettings);
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Error updating setting');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/admin/settings', settings, {
        headers: { 'x-auth-token': token }
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const getSettingsByCategory = (category) => {
    return settings.filter(setting => setting.category === category);
  };

  const renderSettingInput = (setting) => {
    const value = setting.settingValue;
    
    switch (setting.settingType) {
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={(e) => updateSetting(setting.settingKey, e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              {value === true || value === 'true' ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => updateSetting(setting.settingKey, e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateSetting(setting.settingKey, e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">Manage your studio management system configuration</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === category.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="p-6">
          <div className="space-y-6">
            {getSettingsByCategory(activeTab).map((setting) => (
              <div key={setting.settingKey} className="border-b border-gray-200 pb-6">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {setting.settingKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h3>
                    {setting.description && (
                      <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
                    )}
                  </div>
                  <div className="w-1/3">
                    {renderSettingInput(setting)}
                  </div>
                </div>
              </div>
            ))}
            
            {getSettingsByCategory(activeTab).length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No settings found for this category</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;