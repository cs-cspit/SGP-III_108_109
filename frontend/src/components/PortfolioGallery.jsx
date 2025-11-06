import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

    useEffect(() => {
        fetchPortfolios();
        fetchFeaturedPortfolios();
    }, [currentPage, selectedCategory, searchTerm]);

    const fetchPortfolios = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/portfolio/public', {
                params: {
                    page: currentPage,
                    limit: 12,
                    category: selectedCategory,
                    search: searchTerm
                }
            });
            
            setPortfolios(response.data.data.portfolios);
            setTotalPages(response.data.data.pagination.totalPages);
            setCategories(response.data.data.filters.categories);
            setPopularTags(response.data.data.filters.popularTags);
        } catch (error) {
            console.error('Error fetching portfolios:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFeaturedPortfolios = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/portfolio/featured', {
                params: { limit: 6 }
            });
            setFeaturedPortfolios(response.data.data);
        } catch (error) {
            console.error('Error fetching featured portfolios:', error);
        }
    };

    const fetchPortfolioDetails = async (id) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/portfolio/${id}`);
            setSelectedPortfolio(response.data.data);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching portfolio details:', error);
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Portfolio</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Discover our stunning collection of photography and videography work across various categories. 
                    Each project tells a unique story captured through our lens.
                </p>
            </div>

            {/* Featured Portfolios */}
            {featuredPortfolios.length > 0 && (
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Featured Work</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredPortfolios.map((portfolio) => (
                            <div
                                key={portfolio._id}
                                className="group cursor-pointer bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                onClick={() => fetchPortfolioDetails(portfolio._id)}
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={portfolio.images[0]?.url || '/api/placeholder/400/300'}
                                        alt={portfolio.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            ⭐ Featured
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                            {getCategoryIcon(portfolio.category)} {portfolio.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{portfolio.title}</h3>
                                    <p className="text-gray-600 mb-4 line-clamp-2">{portfolio.description}</p>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>👁 {portfolio.views} views</span>
                                        <span>❤️ {portfolio.likes} likes</span>
                                        <span>{formatDate(portfolio.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-md">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search portfolios..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </form>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleCategoryFilter('')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                selectedCategory === '' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            All Categories
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => handleCategoryFilter(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    selectedCategory === category 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {getCategoryIcon(category)} {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Portfolio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {portfolios.map((portfolio) => (
                    <div
                        key={portfolio._id}
                        className="group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                        onClick={() => fetchPortfolioDetails(portfolio._id)}
                    >
                        <div className="relative h-48 overflow-hidden">
                            <img
                                src={portfolio.images[0]?.url || '/api/placeholder/300/200'}
                                alt={portfolio.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2">
                                <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                                    {getCategoryIcon(portfolio.category)} {portfolio.category}
                                </span>
                            </div>
                            {portfolio.isFeatured && (
                                <div className="absolute top-2 left-2">
                                    <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                        ⭐ Featured
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-800 mb-1 truncate">{portfolio.title}</h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{portfolio.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>👁 {portfolio.views}</span>
                                <span>❤️ {portfolio.likes}</span>
                                <span>{new Date(portfolio.createdAt).getFullYear()}</span>
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
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    
                    <span className="px-4 py-2 text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Portfolio Modal */}
            {showModal && selectedPortfolio && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">{selectedPortfolio.title}</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {/* Portfolio Info */}
                            <div className="mb-6">
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                        {getCategoryIcon(selectedPortfolio.category)} {selectedPortfolio.category}
                                    </span>
                                    {selectedPortfolio.location && (
                                        <span className="text-gray-600 text-sm">📍 {selectedPortfolio.location}</span>
                                    )}
                                    {selectedPortfolio.eventDate && (
                                        <span className="text-gray-600 text-sm">📅 {formatDate(selectedPortfolio.eventDate)}</span>
                                    )}
                                </div>
                                <p className="text-gray-700 mb-4">{selectedPortfolio.description}</p>
                                
                                {/* Tags */}
                                {selectedPortfolio.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {selectedPortfolio.tags.map((tag, index) => (
                                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Stats */}
                                <div className="flex items-center space-x-6 text-sm text-gray-600">
                                    <span>👁 {selectedPortfolio.views} views</span>
                                    <span>❤️ {selectedPortfolio.likes} likes</span>
                                    <span>📅 {formatDate(selectedPortfolio.createdAt)}</span>
                                </div>
                            </div>

                            {/* Images Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedPortfolio.images.map((image, index) => (
                                    <div key={index} className="group relative">
                                        <img
                                            src={image.url}
                                            alt={image.caption || selectedPortfolio.title}
                                            className="w-full h-64 object-cover rounded-lg"
                                        />
                                        {image.caption && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                                                <p className="text-sm">{image.caption}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Videos */}
                            {selectedPortfolio.videos.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-4">Videos</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    );
};

export default PortfolioGallery;