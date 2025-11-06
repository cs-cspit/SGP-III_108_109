const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Wedding', 'Pre-Wedding', 'Studio', 'Baby Shoot', 'Corporate', 'Event', 'Fashion', 'Portrait', 'Product', 'Other'],
        required: true
    },
    subcategory: {
        type: String,
        default: ''
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        caption: {
            type: String,
            default: ''
        },
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    videos: [{
        url: {
            type: String
        },
        thumbnail: {
            type: String
        },
        caption: {
            type: String,
            default: ''
        }
    }],
    tags: [{
        type: String
    }],
    location: {
        type: String,
        default: ''
    },
    eventDate: {
        type: Date
    },
    equipment: [{
        type: String
    }],
    isPublic: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    seoTitle: {
        type: String,
        default: ''
    },
    seoDescription: {
        type: String,
        default: ''
    },
    metaKeywords: [{
        type: String
    }]
}, {
    timestamps: true,
    collection: 'Portfolios'
});

// Index for better performance
portfolioSchema.index({ category: 1, isPublic: 1 });
portfolioSchema.index({ isFeatured: 1, sortOrder: -1 });
portfolioSchema.index({ tags: 1 });
portfolioSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);