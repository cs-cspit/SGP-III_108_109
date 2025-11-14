const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    equipmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Camera', // Reference to the Camera model (Equipment)
        required: true
    },
    dateAdded: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    collection: 'Favorites'
});

// Create compound index to ensure one favorite per user per equipment
favoriteSchema.index({ userId: 1, equipmentId: 1 }, { unique: true });

// Add method to populate equipment details
favoriteSchema.methods.populateEquipment = function() {
    return this.populate('equipmentId', 'name price rating image_url');
};

module.exports = mongoose.model('Favorite', favoriteSchema);