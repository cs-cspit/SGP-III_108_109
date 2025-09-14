const mongoose = require('mongoose');

// Legacy Camera Schema for backward compatibility
const cameraSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    image_url: {
        type: String,
        required: true
    }
}, { collection: 'Camaras_Rent' });

const Camera = mongoose.model('Camera', cameraSchema);

module.exports = Camera;