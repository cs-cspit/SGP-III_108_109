const mongoose = require('mongoose');
const SubscriptionPlan = require('./models/SubscriptionPlan');

const defaultPackages = [
  {
    name: 'silver-package',
    displayName: 'Silver Package',
    description: 'Perfect for small events with basic photography needs',
    price: 50000,
    duration: 1,
    features: [
      '1 Photographer',
      '1 Videographer',
      'Full event coverage',
      'Online gallery',
      'High-resolution images'
    ],
    includedServices: [
      { serviceName: 'Photography', description: 'Professional event photography', quantity: 1 },
      { serviceName: 'Videography', description: 'Event videography with highlights', quantity: 1 }
    ],
    manpower: {
      photographers: 1,
      videographers: 1,
      candidPhotographers: 0,
      cinematographers: 0,
      droneOperators: 0
    },
    maxBookingsPerMonth: 0,
    discountPercentage: 0,
    isActive: true,
    planType: 'Silver',
    priority: 1
  },
  {
    name: 'gold-package',
    displayName: 'Gold Package',
    description: 'Ideal for medium-sized events with comprehensive coverage',
    price: 100000,
    duration: 1,
    features: [
      '1 Photographer',
      '1 Videographer',
      '1 Candid Photographer',
      'Full event coverage',
      'Online gallery',
      'High-resolution images',
      '4K video highlights'
    ],
    includedServices: [
      { serviceName: 'Photography', description: 'Professional event photography', quantity: 1 },
      { serviceName: 'Videography', description: 'Event videography with highlights', quantity: 1 },
      { serviceName: 'Candid Photography', description: 'Candid moments capture', quantity: 1 }
    ],
    manpower: {
      photographers: 1,
      videographers: 1,
      candidPhotographers: 1,
      cinematographers: 0,
      droneOperators: 0
    },
    maxBookingsPerMonth: 0,
    discountPercentage: 0,
    isActive: true,
    planType: 'Gold',
    priority: 2
  },
  {
    name: 'platinum-package',
    displayName: 'Platinum Package',
    description: 'Premium package for large events with extensive coverage',
    price: 150000,
    duration: 1,
    features: [
      '1 Photographer',
      '1 Videographer',
      '1 Candid Photographer',
      '1 Cinematographer',
      'Full event coverage',
      'Online gallery',
      'High-resolution images',
      '4K video highlights',
      'Drone footage',
      'Same-day delivery'
    ],
    includedServices: [
      { serviceName: 'Photography', description: 'Professional event photography', quantity: 1 },
      { serviceName: 'Videography', description: 'Event videography with highlights', quantity: 1 },
      { serviceName: 'Candid Photography', description: 'Candid moments capture', quantity: 1 },
      { serviceName: 'Cinematography', description: 'Cinematic video production', quantity: 1 }
    ],
    manpower: {
      photographers: 1,
      videographers: 1,
      candidPhotographers: 1,
      cinematographers: 1,
      droneOperators: 0
    },
    maxBookingsPerMonth: 0,
    discountPercentage: 0,
    isActive: true,
    planType: 'Platinum',
    priority: 3
  },
  {
    name: 'diamond-package',
    displayName: 'Diamond Package',
    description: 'Ultimate package for premium events with complete coverage',
    price: 300000,
    duration: 1,
    features: [
      '2 Photographers',
      '2 Videographers',
      '2 Candid Photographers',
      '2 Cinematographers',
      '1 Drone Operator',
      'Full event coverage',
      'Online gallery',
      'High-resolution images',
      '4K video highlights',
      'Drone footage',
      'Same-day delivery',
      'Premium album'
    ],
    includedServices: [
      { serviceName: 'Photography', description: 'Professional event photography', quantity: 2 },
      { serviceName: 'Videography', description: 'Event videography with highlights', quantity: 2 },
      { serviceName: 'Candid Photography', description: 'Candid moments capture', quantity: 2 },
      { serviceName: 'Cinematography', description: 'Cinematic video production', quantity: 2 },
      { serviceName: 'Drone Photography', description: 'Aerial photography and videography', quantity: 1 }
    ],
    manpower: {
      photographers: 2,
      videographers: 2,
      candidPhotographers: 2,
      cinematographers: 2,
      droneOperators: 1
    },
    maxBookingsPerMonth: 0,
    discountPercentage: 0,
    isActive: true,
    planType: 'Diamond',
    priority: 4
  }
];

const seedPackages = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/studio-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing packages
    await SubscriptionPlan.deleteMany({});
    
    // Insert default packages
    await SubscriptionPlan.insertMany(defaultPackages);
    
    console.log('Default packages seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding packages:', error);
    process.exit(1);
  }
};

seedPackages();