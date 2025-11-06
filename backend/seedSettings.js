const mongoose = require('mongoose');
const AdminSettings = require('./models/AdminSettings');

const defaultSettings = [
  // General Settings
  {
    settingKey: 'studioName',
    settingValue: 'My Studio',
    settingType: 'string',
    category: 'general',
    description: 'Name of your studio',
    isPublic: true
  },
  {
    settingKey: 'studioEmail',
    settingValue: 'info@studioname.com',
    settingType: 'string',
    category: 'general',
    description: 'Primary contact email for your studio',
    isPublic: true
  },
  {
    settingKey: 'studioPhone',
    settingValue: '+1 (555) 123-4567',
    settingType: 'string',
    category: 'general',
    description: 'Primary contact phone number for your studio',
    isPublic: true
  },
  {
    settingKey: 'studioAddress',
    settingValue: '123 Studio Street, City, State 12345',
    settingType: 'string',
    category: 'general',
    description: 'Physical address of your studio',
    isPublic: true
  },
  
  // Pricing Settings
  {
    settingKey: 'taxRate',
    settingValue: 8.5,
    settingType: 'number',
    category: 'pricing',
    description: 'Tax rate percentage applied to bookings',
    isPublic: false
  },
  {
    settingKey: 'discountThreshold',
    settingValue: 1000,
    settingType: 'number',
    category: 'pricing',
    description: 'Minimum booking amount for discount eligibility',
    isPublic: false
  },
  {
    settingKey: 'discountPercentage',
    settingValue: 10,
    settingType: 'number',
    category: 'pricing',
    description: 'Discount percentage for eligible bookings',
    isPublic: false
  },
  
  // Email Settings
  {
    settingKey: 'smtpHost',
    settingValue: 'smtp.example.com',
    settingType: 'string',
    category: 'email',
    description: 'SMTP server host for sending emails',
    isPublic: false
  },
  {
    settingKey: 'smtpPort',
    settingValue: 587,
    settingType: 'number',
    category: 'email',
    description: 'SMTP server port',
    isPublic: false
  },
  {
    settingKey: 'smtpUsername',
    settingValue: 'your-email@example.com',
    settingType: 'string',
    category: 'email',
    description: 'SMTP username for authentication',
    isPublic: false
  },
  {
    settingKey: 'smtpPassword',
    settingValue: 'your-password',
    settingType: 'string',
    category: 'email',
    description: 'SMTP password for authentication',
    isPublic: false
  },
  {
    settingKey: 'enableEmailNotifications',
    settingValue: true,
    settingType: 'boolean',
    category: 'email',
    description: 'Enable email notifications for booking updates',
    isPublic: false
  },
  
  // Booking Settings
  {
    settingKey: 'bookingAdvanceNotice',
    settingValue: 24,
    settingType: 'number',
    category: 'booking',
    description: 'Minimum hours required for advance booking',
    isPublic: true
  },
  {
    settingKey: 'bookingCancellationFee',
    settingValue: 25,
    settingType: 'number',
    category: 'booking',
    description: 'Cancellation fee percentage',
    isPublic: true
  },
  {
    settingKey: 'allowBookingModifications',
    settingValue: true,
    settingType: 'boolean',
    category: 'booking',
    description: 'Allow customers to modify their bookings',
    isPublic: true
  },
  
  // Payment Settings
  {
    settingKey: 'currency',
    settingValue: 'USD',
    settingType: 'string',
    category: 'payment',
    description: 'Default currency for transactions',
    isPublic: true
  },
  {
    settingKey: 'paymentGateway',
    settingValue: 'stripe',
    settingType: 'string',
    category: 'payment',
    description: 'Payment gateway provider',
    isPublic: false
  },
  {
    settingKey: 'enableOnlinePayments',
    settingValue: true,
    settingType: 'boolean',
    category: 'payment',
    description: 'Enable online payment processing',
    isPublic: true
  }
];

const seedSettings = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/studio-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing settings
    await AdminSettings.deleteMany({});
    
    // Insert default settings
    await AdminSettings.insertMany(defaultSettings);
    
    console.log('Default settings seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding settings:', error);
    process.exit(1);
  }
};

seedSettings();