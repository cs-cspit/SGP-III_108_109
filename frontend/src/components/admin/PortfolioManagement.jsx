import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaStar, FaRegStar,
  FaUpload, FaImage, FaFolder, FaTimes, FaCheck, FaSearch, FaFilter
} from 'react-icons/fa';

const PortfolioManagement = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'public', 'private', 'featured'
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Wedding',
    subcategory: '',
    location: '',
    eventDate: '',
    tags: '',
    isPublic: true,
    isFeatured: false
  });
  
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  const categories = [
    'Wedding', 'Pre-Wedding', 'Studio', 'Baby Shoot', 
    'Corporate', 'Event', 'Fashion', 'Portrait', 'Product', 'Other'
  ];

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/portfolio/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Backend returns data directly in response.data.data
      const portfolioData = Array.isArray(response.data.data) ? response.data.data : [];
      setPortfolios(portfolioData);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch portfolios');
      setPortfolios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    // Create preview URLs
    const previews = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      caption: ''
    }));
    setImagePreview(previews);
  };

  const handleCaptionChange = (index, caption) => {
    const updatedPreviews = [...imagePreview];
    updatedPreviews[index].caption = caption;
    setImagePreview(updatedPreviews);
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = imagePreview.filter((_, i) => i !== index);
    setImages(updatedImages);
    setImagePreview(updatedPreviews);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length === 0 && modalMode === 'create') {
      toast.error('Please select at least one image');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          submitData.append(key, formData[key].split(',').map(t => t.trim()).join(','));
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      // Append images with captions
      images.forEach((image, index) => {
        submitData.append('images', image);
        submitData.append(`captions[${index}]`, imagePreview[index]?.caption || '');
      });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };

      if (modalMode === 'create') {
        await axios.post('http://localhost:5000/api/portfolio/admin', submitData, config);
        toast.success('Portfolio created successfully!');
      } else {
        await axios.put(`http://localhost:5000/api/portfolio/admin/${selectedPortfolio._id}`, submitData, config);
        toast.success('Portfolio updated successfully!');
      }

      fetchPortfolios();
      closeModal();
    } catch (error) {
      console.error('Error saving portfolio:', error);
      toast.error(error.response?.data?.message || 'Failed to save portfolio');
    } finally {
      setUploadProgress(0);
    }
  };

  const handleEdit = (portfolio) => {
    setSelectedPortfolio(portfolio);
    setModalMode('edit');
    setFormData({
      title: portfolio.title,
      description: portfolio.description,
      category: portfolio.category,
      subcategory: portfolio.subcategory || '',
      location: portfolio.location || '',
      eventDate: portfolio.eventDate ? new Date(portfolio.eventDate).toISOString().split('T')[0] : '',
      tags: portfolio.tags?.join(', ') || '',
      isPublic: portfolio.isPublic,
      isFeatured: portfolio.isFeatured
    });
    setImagePreview(portfolio.images?.map(img => ({ 
      url: getImageUrl(img.url), 
      caption: img.caption || '', 
      name: img.url.split('/').pop() || '' 
    })) || []);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this portfolio? This action cannot be undone.')) return;

    try {
      setDeletingId(id);
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/portfolio/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Portfolio deleted successfully!');
      fetchPortfolios();
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast.error(error.response?.data?.message || 'Failed to delete portfolio');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleVisibility = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/portfolio/admin/${id}/visibility`, 
        { isPublic: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Portfolio ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
      fetchPortfolios();
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast.error(error.response?.data?.message || 'Failed to update visibility');
    }
  };

  const toggleFeatured = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/portfolio/admin/${id}/featured`, 
        { isFeatured: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Portfolio ${!currentStatus ? 'featured' : 'unfeatured'} successfully!`);
      fetchPortfolios();
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error(error.response?.data?.message || 'Failed to update featured status');
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedPortfolio(null);
    setFormData({
      title: '',
      description: '',
      category: 'Wedding',
      subcategory: '',
      location: '',
      eventDate: '',
      tags: '',
      isPublic: true,
      isFeatured: false
    });
    setImages([]);
    setImagePreview([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMode('create');
    setSelectedPortfolio(null);
    setFormData({
      title: '',
      description: '',
      category: 'Wedding',
      subcategory: '',
      location: '',
      eventDate: '',
      tags: '',
      isPublic: true,
      isFeatured: false
    });
    setImages([]);
    setImagePreview([]);
    setUploadProgress(0);
  };

  // Full screen functionality for image preview
  const openFullScreen = (imageUrl) => {
    setFullScreenImage(imageUrl);
    setIsFullScreen(true);
  };

  const closeFullScreen = () => {
    setIsFullScreen(false);
    setFullScreenImage(null);
  };

  // Keyboard navigation for full screen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullScreen && e.key === 'Escape') {
        closeFullScreen();
      }
    };

    if (isFullScreen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen]);

  // Filter and sort portfolios
  const filteredPortfolios = portfolios
    .filter(portfolio => {
      const matchesSearch = portfolio.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           portfolio.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || portfolio.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'public' && portfolio.isPublic) ||
                           (filterStatus === 'private' && !portfolio.isPublic) ||
                           (filterStatus === 'featured' && portfolio.isFeatured);
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio Management</h1>
            <p className="text-gray-600 mt-1">Manage your photography portfolio</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 shadow-lg"
          >
            <FaPlus />
            <span>Add New Portfolio</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search portfolios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="featured">Featured</option>
            </select>
            
            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="createdAt">Date Created</option>
                <option value="title">Title</option>
                <option value="category">Category</option>
                <option value="views">Views</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
              <FaImage className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Portfolios</p>
              <p className="text-2xl font-bold text-gray-900">{portfolios.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 text-green-600 mr-4">
              <FaEye className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Public</p>
              <p className="text-2xl font-bold text-gray-900">{portfolios.filter(p => p.isPublic).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600 mr-4">
              <FaStar className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Featured</p>
              <p className="text-2xl font-bold text-gray-900">{portfolios.filter(p => p.isFeatured).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gray-100 text-gray-600 mr-4">
              <FaEyeSlash className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Private</p>
              <p className="text-2xl font-bold text-gray-900">{portfolios.filter(p => !p.isPublic).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading portfolios...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolios.map(portfolio => (
            <div key={portfolio._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200">
              {/* Portfolio Image */}
              <div className="relative h-52 bg-gray-100">
                {portfolio.images?.[0]?.url ? (
                  <img
                    src={getImageUrl(portfolio.images[0].url)}
                    alt={portfolio.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaImage className="text-gray-300 text-4xl" />
                  </div>
                )}
                
                {/* Status Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  {portfolio.isFeatured && (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                      <FaStar className="mr-1" /> Featured
                    </span>
                  )}
                  {!portfolio.isPublic && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                      <FaEyeSlash className="mr-1" /> Private
                    </span>
                  )}
                  {portfolio.isPublic && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                      <FaEye className="mr-1" /> Public
                    </span>
                  )}
                </div>
              </div>

              {/* Portfolio Info */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{portfolio.title}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {portfolio.category}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{portfolio.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="flex items-center">
                    <FaImage className="mr-1" /> {portfolio.images?.length || 0} images
                  </span>
                  <span className="flex items-center">
                    <FaEye className="mr-1" /> {portfolio.views || 0} views
                  </span>
                  <span>{portfolio.createdAt ? new Date(portfolio.createdAt).toLocaleDateString() : ''}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(portfolio)}
                    className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center justify-center font-medium"
                  >
                    <FaEdit className="mr-1" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => toggleVisibility(portfolio._id, portfolio.isPublic)}
                    className={`px-3 py-2 rounded-lg transition-colors text-sm flex items-center justify-center font-medium ${
                      portfolio.isPublic
                        ? 'bg-gray-500 hover:bg-gray-600 text-white'
                        : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                    }`}
                    title={portfolio.isPublic ? 'Make Private' : 'Make Public'}
                  >
                    {portfolio.isPublic ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  
                  <button
                    onClick={() => toggleFeatured(portfolio._id, portfolio.isFeatured)}
                    className={`px-3 py-2 rounded-lg transition-colors text-sm flex items-center justify-center font-medium ${
                      portfolio.isFeatured
                        ? 'bg-gray-500 hover:bg-gray-600 text-white'
                        : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                    }`}
                    title={portfolio.isFeatured ? 'Unfeature' : 'Feature'}
                  >
                    {portfolio.isFeatured ? <FaStar /> : <FaRegStar />}
                  </button>
                  
                  <button
                    onClick={() => handleDelete(portfolio._id)}
                    disabled={deletingId === portfolio._id}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center justify-center font-medium disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === portfolio._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <FaTrash />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredPortfolios.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
          <FaImage className="mx-auto text-gray-300 text-6xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No portfolios found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
          <button
            onClick={openCreateModal}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 mx-auto"
          >
            <FaPlus />
            <span>Create your first portfolio</span>
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl my-8 shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalMode === 'create' ? 'Create New Portfolio' : 'Edit Portfolio'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Portfolio Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="e.g., Sarah & John's Wedding"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="Describe this portfolio in detail..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="e.g., Outdoor, Traditional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="e.g., Mumbai, India"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="e.g., outdoor, romantic, sunset"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Portfolio Images {modalMode === 'create' && '*'}
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors bg-gray-50">
                  <input
                    type="file"
                    id="imageUpload"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <FaUpload className="text-4xl text-gray-400 mb-3" />
                    <span className="text-gray-700 font-medium mb-1">Click to upload images</span>
                    <span className="text-gray-500 text-sm">
                      Select multiple images (JPG, PNG, WebP)
                    </span>
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreview.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Previews</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="relative rounded-lg overflow-hidden">
                            <img
                              src={preview.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openFullScreen(preview.url)}
                              className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                              title="View full screen"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"></path>
                              </svg>
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Caption (optional)"
                            value={preview.caption}
                            onChange={(e) => handleCaptionChange(index, e.target.value)}
                            className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-transparent"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gray-900 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Visibility Options */}
              <div className="flex flex-wrap gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="mr-3 h-5 w-5 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Make Public</span>
                    <p className="text-xs text-gray-500">Visible to all users</p>
                  </div>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="mr-3 h-5 w-5 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Feature Portfolio</span>
                    <p className="text-xs text-gray-500">Highlight on homepage</p>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadProgress > 0 && uploadProgress < 100}
                  className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {modalMode === 'create' ? 'Create Portfolio' : 'Update Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Screen Image Viewer */}
      {isFullScreen && fullScreenImage && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={fullScreenImage}
              alt="Full screen view"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={closeFullScreen}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-all"
              title="Close full screen"
            >
              <FaTimes className="text-2xl" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManagement;