const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');

// ============ PUBLIC ROUTES ============

// Get public portfolios with filtering and pagination
router.get('/public', portfolioController.getPublicPortfolios);

// Get featured portfolios
router.get('/featured', portfolioController.getFeaturedPortfolios);

// Get portfolios by category
router.get('/category/:category', portfolioController.getPortfoliosByCategory);

// Get single portfolio by ID
router.get('/:id', portfolioController.getPortfolioById);

// ============ ADMIN ROUTES (Protected) ============

// Portfolio management
router.get('/admin/all', auth, adminAuth, portfolioController.getAllPortfolios);
router.get('/admin/statistics', auth, adminAuth, portfolioController.getPortfolioStatistics);
router.post('/admin', auth, adminAuth, portfolioController.createPortfolio);
router.put('/admin/:id', auth, adminAuth, portfolioController.updatePortfolio);
router.delete('/admin/:id', auth, adminAuth, portfolioController.deletePortfolio);
router.put('/admin/:id/visibility', auth, adminAuth, portfolioController.togglePortfolioVisibility);
router.put('/admin/:id/featured', auth, adminAuth, portfolioController.toggleFeaturedStatus);

module.exports = router;