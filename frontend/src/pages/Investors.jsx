import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlay } from 'react-icons/fa';

const Investors = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
      const response = await axios.get(`${backendUrl}/api/investment-product/list`);
      
      if (response.data.success && response.data.products) {
        setProducts(response.data.products);
      } else {
        setError('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const calculateFundingPercentage = (current, total) => {
    if (total <= 0) return 0;
    return Math.min((current / total) * 100, 100);
  };

  const getStatusColor = (status) => {
    const colors = {
      funding: "bg-blue-500",
      "in-production": "bg-orange-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const handleProductClick = (productId) => {
    navigate(`/investorproduct/${productId}`);
  };

  const ProductCard = ({ product, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative bg-black rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 mb-4 sm:mb-6 cursor-pointer"
      onClick={() => handleProductClick(product._id)}
    >
      {/* Product Image */}
      <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
        {product.coverImage ? (
          <img
            src={product.coverImage}
            alt={product.productTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-800">
            No Image
          </div>
        )}

        {/* Status Badge - Only on Hover */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold text-white shadow-lg ${getStatusColor(
              product.productStatus
            )}`}
          >
            {(product.productStatus || 'funding').toUpperCase()}
          </span>
        </div>

      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
          {/* Video Thumbnail */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
            {product.videoThumbnail || product.coverImage ? (
              <img
                src={product.videoThumbnail || product.coverImage}
                alt={product.productTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-700"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Product Title */}
            <h3 className="text-white font-bold text-xs sm:text-sm mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
              {product.productTitle || 'Untitled Project'}
            </h3>
            
            {/* Artist Name */}
            <p className="text-gray-400 text-xs mb-1 sm:mb-2">
              {product.artistName || 'Unknown Artist'}
            </p>
          </div>
        </div>

        {/* Investment Progress */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Investment Progress</span>
            <span className="text-xs text-gray-300">
              {Math.round(calculateFundingPercentage(
                product.currentFunding || 0,
                product.totalBudget || 1
              ))}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-400 h-1.5 sm:h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(2, calculateFundingPercentage(
                  product.currentFunding || 0,
                  product.totalBudget || 1
                ))}%`,
              }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-green-400 font-semibold">
            {formatCurrency(product.currentFunding || 0)}
          </span>
          <span className="text-gray-400">
            of {formatCurrency(product.totalBudget || 0)}
          </span>
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Investment Projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button 
            onClick={fetchProducts}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
          >
            Investment Projects
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-4 sm:px-0"
          >
            Discover and invest in creative projects. All investment amounts are updated in real-time from our admin system.
          </motion.p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 sm:px-6 md:px-12 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">No investment projects available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {products.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Investors;