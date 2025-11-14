import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';

const PortfolioGallery = () => {
    const [portfolios, setPortfolios] = useState([]);
    const [featuredPortfolios, setFeaturedPortfolios] = useState([]);
    const [categories, setCategories] = useState([]);
    const [popularTags, setPopularTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedPortfolio, setSelectedPortfolio] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isBrowserFullScreen, setIsBrowserFullScreen] = useState(false);

    useEffect(() => {
        fetchPortfolios();
        fetchFeaturedPortfolios();
    }, [currentPage, selectedCategory, searchTerm]);

    const fetchPortfolios = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/portfolio/public', {
                params: {
                    page: currentPage,
                    limit: 12,
                    category: selectedCategory,
                    search: searchTerm
                }
            });
            
            setPortfolios(response.data.data.portfolios || []);
            setTotalPages(response.data.data.pagination?.totalPages || 1);
            setCategories(response.data.data.filters?.categories || []);
            setPopularTags(response.data.data.filters?.popularTags || []);
        } catch (error) {
            console.error('Error fetching portfolios:', error);
            setPortfolios([]);
            setTotalPages(1);
            setCategories([]);
            setPopularTags([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchFeaturedPortfolios = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/portfolio/featured', {
                params: { limit: 6 }
            });
            setFeaturedPortfolios(response.data.data || []);
        } catch (error) {
            console.error('Error fetching featured portfolios:', error);
            setFeaturedPortfolios([]);
        }
    };

    const fetchPortfolioDetails = async (id) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/portfolio/${id}`);
            setSelectedPortfolio(response.data.data);
            setActiveImageIndex(0);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching portfolio details:', error);
            alert('Error loading portfolio details: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCategoryFilter = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchPortfolios();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'Wedding': '💒',
            'Pre-Wedding': '💕',
            'Studio': '📸',
            'Baby Shoot': '👶',
            'Corporate': '🏢',
            'Event': '🎉',
            'Fashion': '👗',
            'Portrait': '👤',
            'Product': '📦',
            'Other': '🎨'
        };
        return icons[category] || '📷';
    };

    // Function to get proper image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/api/placeholder/400/300';
        // If it's already a full URL, return as is
        if (imagePath.startsWith('http')) return imagePath;
        // If it's a relative path with /uploads/portfolio, return full URL
        if (imagePath.startsWith('/uploads/portfolio')) {
            return `http://localhost:5000${imagePath}`;
        }
        // Otherwise, assume it's a relative path
        return `http://localhost:5000${imagePath}`;
    };

    // Navigation for image gallery in modal
    const nextImage = () => {
        if (selectedPortfolio && selectedPortfolio.images) {
            setActiveImageIndex((prev) => (prev + 1) % selectedPortfolio.images.length);
        }
    };

    const prevImage = () => {
        if (selectedPortfolio && selectedPortfolio.images) {
            setActiveImageIndex((prev) => (prev - 1 + selectedPortfolio.images.length) % selectedPortfolio.images.length);
        }
    };

    // Full screen functionality
    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    // Browser full screen functionality
    const enterBrowserFullScreen = async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                await document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                await document.documentElement.msRequestFullscreen();
            }
        } catch (error) {
            console.error('Error entering full screen:', error);
        }
    };

    const exitBrowserFullScreen = async () => {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                await document.msExitFullscreen();
            }
        } catch (error) {
            console.error('Error exiting full screen:', error);
        }
    };

    const toggleBrowserFullScreen = () => {
        if (isBrowserFullScreen) {
            exitBrowserFullScreen();
        } else {
            enterBrowserFullScreen();
        }
    };

    // Handle full screen changes
    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsBrowserFullScreen(!!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement
            ));
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
        document.addEventListener('msfullscreenchange', handleFullScreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
            document.removeEventListener('msfullscreenchange', handleFullScreenChange);
        };
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!showModal) return;

            if (e.key === 'Escape') {
                if (isBrowserFullScreen) {
                    exitBrowserFullScreen();
                } else if (isFullScreen) {
                    setIsFullScreen(false);
                } else {
                    setShowModal(false);
                }
            } else if (e.key === 'ArrowRight') {
                nextImage();
            } else if (e.key === 'ArrowLeft') {
                prevImage();
            } else if (e.key === 'f' || e.key === 'F') {
                toggleFullScreen();
            } else if (e.key === 'b' || e.key === 'B') {
                toggleBrowserFullScreen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showModal, isFullScreen, isBrowserFullScreen, selectedPortfolio]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Featured Portfolios */}
                    {featuredPortfolios.length > 0 && (
                        <div className="mb-20">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-3xl font-bold text-gray-900">Featured Work</h2>
                                <div className="h-px flex-1 bg-gray-200 ml-4"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {featuredPortfolios.map((portfolio) => (
                                    <div
                                        key={portfolio._id}
                                        className="group cursor-pointer bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-gray-300"
                                        onClick={() => fetchPortfolioDetails(portfolio._id)}
                                    >
                                        <div className="relative h-64 overflow-hidden">
                                            <img
                                                src={portfolio.images?.[0]?.url ? getImageUrl(portfolio.images[0].url) : '/api/placeholder/400/300'}
                                                alt={portfolio.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                                                    ⭐ Featured
                                                </span>
                                            </div>
                                            <div className="absolute top-4 right-4">
                                                <span className="bg-gray-900 bg-opacity-80 text-white px-3 py-1 rounded-lg text-sm">
                                                    {getCategoryIcon(portfolio.category)} {portfolio.category}
                                                </span>
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                                <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                    <h3 className="text-xl font-bold mb-1">{portfolio.title}</h3>
                                                    <p className="text-sm opacity-90 line-clamp-2">{portfolio.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{portfolio.title}</h3>
                                            <p className="text-gray-600 mb-4 line-clamp-2">{portfolio.description}</p>
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                    </svg>
                                                    {portfolio.views || 0} views
                                                </span>
                                                <span className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                                                    </svg>
                                                    {portfolio.likes || 0} likes
                                                </span>
                                                <span>{formatDate(portfolio.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Filters and Search */}
                    <div className="mb-12 bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex-1 max-w-2xl w-full">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search portfolios..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white shadow-sm transition-all"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </form>

                            {/* Category Filter */}
                            <div className="flex flex-wrap gap-2 justify-center">
                                <button
                                    onClick={() => handleCategoryFilter('')}
                                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
                                        selectedCategory === '' 
                                            ? 'bg-gray-900 text-white shadow-lg' 
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                    }`}
                                >
                                    All Categories
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => handleCategoryFilter(category)}
                                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
                                            selectedCategory === category 
                                                ? 'bg-gray-900 text-white shadow-lg' 
                                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                        }`}
                                    >
                                        {getCategoryIcon(category)} {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                        {portfolios.map((portfolio) => (
                            <div
                                key={portfolio._id}
                                className="group cursor-pointer bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-gray-300"
                                onClick={() => fetchPortfolioDetails(portfolio._id)}
                            >
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={portfolio.images?.[0]?.url ? getImageUrl(portfolio.images[0].url) : '/api/placeholder/300/200'}
                                        alt={portfolio.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                                            {getCategoryIcon(portfolio.category)} {portfolio.category}
                                        </span>
                                    </div>
                                    {portfolio.isFeatured && (
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                                ⭐ Featured
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                        <div className="text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <h3 className="font-bold text-sm mb-1 truncate">{portfolio.title}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{portfolio.title}</h3>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{portfolio.description}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span className="flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                            {portfolio.images?.length || 0}
                                        </span>
                                        <span className="flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                            </svg>
                                            {portfolio.views || 0}
                                        </span>
                                        <span>{portfolio.createdAt ? new Date(portfolio.createdAt).getFullYear() : ''}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mb-8">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                            >
                                Previous
                            </button>
                            
                            <div className="flex space-x-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const page = i + 1;
                                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-4 py-2 border border-gray-300 rounded-lg text-sm ${
                                                    currentPage === page
                                                        ? 'bg-gray-900 text-white'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                                } shadow-sm transition-colors`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                                        return <span key={page} className="px-2 py-2 text-gray-500">...</span>;
                                    }
                                    return null;
                                })}
                            </div>
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* Portfolio Modal */}
                    {showModal && selectedPortfolio && (
                        <div className={`fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 ${
                            isBrowserFullScreen ? 'fullscreen-browser' : isFullScreen ? 'fullscreen-modal' : ''
                        }`}>
                            <div className={`bg-white rounded-2xl max-w-6xl w-full ${
                                isBrowserFullScreen ? 'h-screen w-screen rounded-none' : isFullScreen ? 'h-screen rounded-none' : 'max-h-[90vh]'
                            } overflow-hidden shadow-2xl`}>
                                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedPortfolio.title}</h2>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={toggleFullScreen}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                            title={isFullScreen ? "Exit modal full screen" : "Modal full screen"}
                                        >
                                            {isFullScreen ? (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"></path>
                                                </svg>
                                            )}
                                        </button>
                                        <button
                                            onClick={toggleBrowserFullScreen}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                            title={isBrowserFullScreen ? "Exit browser full screen" : "Browser full screen"}
                                        >
                                            {isBrowserFullScreen ? (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5"></path>
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 3H3m18 0v18M3 21V3m18 0l-2.5 2.5M3 21l2.5-2.5m13.5-13.5L21 3m-2.5 2.5L21 21m-2.5-2.5L3 3m2.5 2.5L3 21"></path>
                                                </svg>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Close"
                                        >
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className={`overflow-y-auto ${
                                    isBrowserFullScreen ? 'h-[calc(100vh-80px)]' : isFullScreen ? 'h-[calc(100vh-80px)]' : 'max-h-[80vh]'
                                } p-6`}>
                                    {/* Portfolio Info */}
                                    <div className="mb-8">
                                        <div className="flex flex-wrap items-center gap-4 mb-6">
                                            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                                                {getCategoryIcon(selectedPortfolio.category)} {selectedPortfolio.category}
                                            </span>
                                            {selectedPortfolio.location && (
                                                <span className="text-gray-600 text-sm flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                    </svg>
                                                    {selectedPortfolio.location}
                                                </span>
                                            )}
                                            {selectedPortfolio.eventDate && (
                                                <span className="text-gray-600 text-sm flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                    </svg>
                                                    {formatDate(selectedPortfolio.eventDate)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-700 text-lg mb-6">{selectedPortfolio.description}</p>
                                        
                                        {/* Tags */}
                                        {selectedPortfolio.tags?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {selectedPortfolio.tags.map((tag, index) => (
                                                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Stats */}
                                        <div className="flex items-center space-x-8 text-sm text-gray-600 mb-6">
                                            <span className="flex items-center">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                </svg>
                                                {selectedPortfolio.views || 0} views
                                            </span>
                                            <span className="flex items-center">
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                                                </svg>
                                                {selectedPortfolio.likes || 0} likes
                                            </span>
                                            <span className="flex items-center">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                                {formatDate(selectedPortfolio.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Image Gallery */}
                                    <div className="mb-8">
                                        {selectedPortfolio.images?.length > 0 && (
                                            <div className="relative">
                                                <div className={`relative ${
                                                    isBrowserFullScreen ? 'h-[80vh]' : isFullScreen ? 'h-[70vh]' : 'h-96 md:h-[500px]'
                                                } rounded-xl overflow-hidden mb-4`}>
                                                    <img
                                                        src={getImageUrl(selectedPortfolio.images[activeImageIndex]?.url)}
                                                        alt={selectedPortfolio.images[activeImageIndex]?.caption || selectedPortfolio.title}
                                                        className="w-full h-full object-contain bg-gray-100"
                                                    />
                                                    {selectedPortfolio.images[activeImageIndex]?.caption && (
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
                                                            <p className="text-center">{selectedPortfolio.images[activeImageIndex].caption}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Navigation Arrows */}
                                                {selectedPortfolio.images.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={prevImage}
                                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                                                            title="Previous image"
                                                        >
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={nextImage}
                                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                                                            title="Next image"
                                                        >
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                            </svg>
                                                        </button>
                                                    </>
                                                )}
                                                
                                                {/* Image Indicators */}
                                                <div className="flex justify-center space-x-2 mt-4">
                                                    {selectedPortfolio.images.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setActiveImageIndex(index)}
                                                            className={`w-3 h-3 rounded-full transition-all ${
                                                                index === activeImageIndex ? 'bg-gray-900' : 'bg-gray-300'
                                                            }`}
                                                            title={`View image ${index + 1}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Thumbnail Grid */}
                                        {selectedPortfolio.images?.length > 1 && (
                                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 mt-6">
                                                {selectedPortfolio.images.map((image, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => setActiveImageIndex(index)}
                                                        className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                                            index === activeImageIndex ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'
                                                        }`}
                                                        title={`View image ${index + 1}`}
                                                    >
                                                        <img
                                                            src={getImageUrl(image.url)}
                                                            alt={image.caption || `Image ${index + 1}`}
                                                            className="w-full h-16 object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Videos */}
                                    {selectedPortfolio.videos?.length > 0 && (
                                        <div className="mt-8">
                                            <h3 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-200">Videos</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {selectedPortfolio.videos.map((video, index) => (
                                                    <div key={index} className="relative">
                                                        <video
                                                            controls
                                                            poster={video.thumbnail}
                                                            className="w-full h-64 object-cover rounded-lg"
                                                        >
                                                            <source src={video.url} type="video/mp4" />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                        {video.caption && (
                                                            <p className="text-sm text-gray-600 mt-2">{video.caption}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PortfolioGallery;