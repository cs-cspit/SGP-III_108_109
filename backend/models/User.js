const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'staff'],
    default: 'customer'
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    country: { type: String, default: 'India' }
  },
  idProof: {
    type: { type: String, default: '' }, // Aadhar, PAN, Driving License
    number: { type: String, default: '' },
    imageUrl: { type: String, default: '' }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isBlacklisted: {
    type: Boolean,
    default: false
  },
  blacklistReason: {
    type: String,
    default: ''
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  lastBookingDate: {
    type: Date
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  profileImage: {
    type: String,
    default: ''
  },
  preferences: {
    equipmentTypes: [{ type: String }],
    eventTypes: [{ type: String }],
    communicationMethod: {
      type: String,
      enum: ['email', 'sms', 'both'],
      default: 'email'
    }
  }
}, {
  timestamps: true
});

// Index for better search performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isBlacklisted: 1 });

module.exports = mongoose.model("User", UserSchema);
