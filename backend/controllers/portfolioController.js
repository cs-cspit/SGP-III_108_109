const Portfolio = require('../models/Portfolio');

// ============ PUBLIC PORTFOLIO ENDPOINTS ============

// Get all public portfolios with filtering and pagination
exports.getPublicPortfolios = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 12, 
            category = '', 
            tags = '', 
            search = '',
            featured = false
        } = req.query;
        
        const filter = { isPublic: true };
        
        if (category) filter.category = category;
        if (featured === 'true') filter.isFeatured = true;
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            filter.tags = { $in: tagArray };
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        const portfolios = await Portfolio.find(filter)
            .select('title description category images videos tags location eventDate isFeatured views likes createdAt')
            .sort({ isFeatured: -1, sortOrder: -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Portfolio.countDocuments(filter);
        
        // Get categories for filtering
        const categories = await Portfolio.distinct('category', { isPublic: true });
        
        // Get popular tags
        const popularTags = await Portfolio.aggregate([
            { $match: { isPublic: true } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);
        
        res.json({
            success: true,
            data: {
                portfolios,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                },
                filters: {
                    categories,
                    popularTags: popularTags.map(tag => tag._id)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching portfolios:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching portfolios',
            error: error.message
        });
    }
};

// Get single portfolio by ID
exports.getPortfolioById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const portfolio = await Portfolio.findById(id);
        
        if (!portfolio || !portfolio.isPublic) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found'
            });
        }
        
        // Increment view count
        portfolio.views += 1;
        await portfolio.save();
        
        res.json({
            success: true,
            data: portfolio
        });
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching portfolio',
            error: error.message
        });
    }
};

// Get featured portfolios
exports.getFeaturedPortfolios = async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        
        const portfolios = await Portfolio.find({ 
            isPublic: true, 
            isFeatured: true 
        })
        .select('title description category images tags location views likes createdAt')
        .sort({ sortOrder: -1, createdAt: -1 })
        .limit(parseInt(limit));
        
        res.json({
            success: true,
            data: portfolios
        });
    } catch (error) {
        console.error('Error fetching featured portfolios:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured portfolios',
            error: error.message
        });
    }
};

// Get portfolios by category
exports.getPortfoliosByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 12 } = req.query;
        
        const portfolios = await Portfolio.find({ 
            isPublic: true, 
            category: category 
        })
        .select('title description images tags location eventDate views likes createdAt')
        .sort({ isFeatured: -1, sortOrder: -1, createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
        
        const total = await Portfolio.countDocuments({ 
            isPublic: true, 
            category: category 
        });
        
        res.json({
            success: true,
            data: {
                portfolios,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    total,
                    category
                }
            }
        });
    } catch (error) {
        console.error('Error fetching portfolios by category:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching portfolios by category',
            error: error.message
        });
    }
};

// ============ ADMIN PORTFOLIO MANAGEMENT ============

// Get all portfolios (admin)
exports.getAllPortfolios = async (req, res) => {
    try {
        const { 
            category = '', 
            isPublic = '', 
            isFeatured = '',
            search = ''
        } = req.query;
        
        const filter = {};
        
        if (category) filter.category = category;
        if (isPublic !== '') filter.isPublic = isPublic === 'true';
        if (isFeatured !== '') filter.isFeatured = isFeatured === 'true';
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const portfolios = await Portfolio.find(filter)
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: portfolios
        });
    } catch (error) {
        console.error('Error fetching portfolios (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching portfolios',
            error: error.message
        });
    }
};

// Create new portfolio (admin)
exports.createPortfolio = async (req, res) => {
    try {
        const { title, description, category, subcategory, location, eventDate, tags, isPublic, isFeatured } = req.body;
        
        // Process uploaded images
        const images = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach((file, index) => {
                images.push({
                    url: `/uploads/portfolio/${file.filename}`,
                    caption: req.body[`captions[${index}]`] || '',
                    isPrimary: index === 0
                });
            });
        }
        
        // Parse tags
        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        
        const portfolioData = {
            title,
            description,
            category,
            subcategory: subcategory || '',
            location: location || '',
            eventDate: eventDate || null,
            tags: tagsArray,
            images,
            isPublic: isPublic === 'true' || isPublic === true,
            isFeatured: isFeatured === 'true' || isFeatured === true
        };
        
        const portfolio = new Portfolio(portfolioData);
        await portfolio.save();
        
        res.status(201).json({
            success: true,
            message: 'Portfolio created successfully',
            data: portfolio
        });
    } catch (error) {
        console.error('Error creating portfolio:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating portfolio',
            error: error.message
        });
    }
};

// Update portfolio (admin)
exports.updatePortfolio = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, subcategory, location, eventDate, tags, isPublic, isFeatured } = req.body;
        
        const portfolio = await Portfolio.findById(id);
        
        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found'
            });
        }
        
        // Update basic fields
        portfolio.title = title || portfolio.title;
        portfolio.description = description || portfolio.description;
        portfolio.category = category || portfolio.category;
        portfolio.subcategory = subcategory || portfolio.subcategory;
        portfolio.location = location || portfolio.location;
        portfolio.eventDate = eventDate || portfolio.eventDate;
        portfolio.isPublic = isPublic === 'true' || isPublic === true;
        portfolio.isFeatured = isFeatured === 'true' || isFeatured === true;
        
        // Update tags
        if (tags) {
            portfolio.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
        
        // Add new images if uploaded
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map((file, index) => ({
                url: `/uploads/portfolio/${file.filename}`,
                caption: req.body[`captions[${index}]`] || '',
                isPrimary: portfolio.images.length === 0 && index === 0
            }));
            portfolio.images.push(...newImages);
        }
        
        await portfolio.save();
        
        res.json({
            success: true,
            message: 'Portfolio updated successfully',
            data: portfolio
        });
    } catch (error) {
        console.error('Error updating portfolio:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating portfolio',
            error: error.message
        });
    }
};

// Delete portfolio (admin)
exports.deletePortfolio = async (req, res) => {
    try {
        const { id } = req.params;
        
        const portfolio = await Portfolio.findByIdAndDelete(id);
        
        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Portfolio deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting portfolio:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting portfolio',
            error: error.message
        });
    }
};

// Toggle portfolio visibility (admin)
exports.togglePortfolioVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        
        const portfolio = await Portfolio.findById(id);
        
        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found'
            });
        }
        
        portfolio.isPublic = !portfolio.isPublic;
        await portfolio.save();
        
        res.json({
            success: true,
            message: `Portfolio ${portfolio.isPublic ? 'published' : 'unpublished'} successfully`,
            data: portfolio
        });
    } catch (error) {
        console.error('Error toggling portfolio visibility:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating portfolio visibility',
            error: error.message
        });
    }
};

// Toggle featured status (admin)
exports.toggleFeaturedStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        const portfolio = await Portfolio.findById(id);
        
        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found'
            });
        }
        
        portfolio.isFeatured = !portfolio.isFeatured;
        await portfolio.save();
        
        res.json({
            success: true,
            message: `Portfolio ${portfolio.isFeatured ? 'featured' : 'unfeatured'} successfully`,
            data: portfolio
        });
    } catch (error) {
        console.error('Error toggling featured status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating featured status',
            error: error.message
        });
    }
};

// Get portfolio statistics (admin)
exports.getPortfolioStatistics = async (req, res) => {
    try {
        const totalPortfolios = await Portfolio.countDocuments();
        const publicPortfolios = await Portfolio.countDocuments({ isPublic: true });
        const featuredPortfolios = await Portfolio.countDocuments({ isFeatured: true });
        
        // Category statistics
        const categoryStats = await Portfolio.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: '$likes' }
                }
            },
            { $sort: { count: -1 } }
        ]);
        
        // Most viewed portfolios
        const mostViewed = await Portfolio.find({ isPublic: true })
            .select('title category views createdAt')
            .sort({ views: -1 })
            .limit(5);
        
        // Recent portfolios
        const recentPortfolios = await Portfolio.find()
            .select('title category isPublic isFeatured views createdAt')
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json({
            success: true,
            data: {
                overview: {
                    totalPortfolios,
                    publicPortfolios,
                    featuredPortfolios,
                    draftPortfolios: totalPortfolios - publicPortfolios
                },
                categoryStats,
                mostViewed,
                recentPortfolios
            }
        });
    } catch (error) {
        console.error('Error fetching portfolio statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching portfolio statistics',
            error: error.message
        });
    }
};