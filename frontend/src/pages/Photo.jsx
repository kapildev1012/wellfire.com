import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";

const Photo = () => {
  const { products } = useContext(ShopContext);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch all investment products
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setIsLoading(true);
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
        const response = await axios.get(`${backendUrl}/api/investment-product/list`);
        
        if (response.data.success && response.data.products) {
          setAllProducts(response.data.products);
          setFilteredProducts(response.data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  // Filter products by category
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredProducts(allProducts);
    } else {
      const filtered = allProducts.filter(
        (product) => product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, allProducts]);

  const categories = ["All", "Music", "Film", "Commercial"];

  const handleImageClick = (product) => {
    // Scroll to top before opening new content
    window.scrollTo(0, 0);
    
    if (product.youtubeLink) {
      window.open(product.youtubeLink, "_blank");
    } else if (product.videoFile) {
      window.open(product.videoFile, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading all photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: "900",
              letterSpacing: "0.1em",
            }}
          >
            OUR PORTFOLIO
          </h1>
          <p className="text-gray-400 text-sm sm:text-lg">
            Explore our complete collection of creative works
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center mb-6 sm:mb-8"
        >
          <div className="flex flex-wrap gap-2 sm:gap-4 px-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 sm:px-6 py-2 rounded-full transition-all duration-300 text-sm sm:text-base ${
                  selectedCategory === category
                    ? "bg-white text-black"
                    : "bg-transparent text-white border border-white/30 hover:border-white/60"
                }`}
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: "600",
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Products Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mb-6 sm:mb-8"
        >
          <p className="text-gray-400 text-sm sm:text-base">
            Showing {filteredProducts.length} {selectedCategory === "All" ? "items" : selectedCategory.toLowerCase() + " items"}
          </p>
        </motion.div>

        {/* Photo Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => handleImageClick(product)}
              >
                <div className="relative overflow-hidden rounded-lg bg-gray-900 aspect-square">
                  <img
                    src={
                      product.coverImage ||
                      product.image ||
                      "https://via.placeholder.com/400x400?text=No+Image"
                    }
                    alt={product.productTitle || product.name || "Product"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Category Badge */}
                  {product.category && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 text-xs sm:text-xs rounded-full bg-black/70 text-white border border-white/30 backdrop-blur">
                        {product.category}
                      </span>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3
                      className="text-white font-bold text-xs sm:text-sm mb-1 line-clamp-2"
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: "700",
                      }}
                    >
                      {product.productTitle || product.name}
                    </h3>
                    <div className="flex items-center gap-1 sm:gap-2 text-xs">
                      <span className="text-gray-300 truncate">
                        {product.artistName || "Unknown Artist"}
                      </span>
                      {product.youtubeLink && (
                        <span className="text-red-400 flex items-center gap-1 flex-shrink-0">
                          <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.5 6.2s-.2-1.6-.8-2.3c-.8-.8-1.7-.8-2.1-.9C17.8 2.8 12 2.8 12 2.8h0s-5.8 0-8.6.3c-.4 0-1.3.1-2.1.9-.6.7-.8 2.3-.8 2.3S0 8.1 0 10v1.9c0 1.9.2 3.8.2 3.8s.2 1.6.8 2.3c.8.8 1.8.8 2.3.9 1.7.2 7.2.3 8.7.3 0 0 5.8 0 8.6-.3.4 0 1.3-.1 2.1-.9.6-.7.8-2.3.8-2.3s.2-1.9.2-3.8V10c0-1.9-.2-3.8-.2-3.8zM9.6 13.8V7.9l6.1 3-6.1 2.9z" />
                          </svg>
                          <span className="hidden sm:inline">Watch</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center py-20"
          >
            <p className="text-gray-400 text-lg">
              No {selectedCategory === "All" ? "" : selectedCategory.toLowerCase() + " "}items found
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Photo;
