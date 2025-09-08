import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Services = () => {
  const [latest, setLatest] = useState({
    music: null,
    film: null,
    commercial: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestItems = async () => {
      try {
        setIsLoading(true);
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
        const response = await axios.get(`${backendUrl}/api/investment-product/list`);
        
        if (response.data.success && response.data.products) {
          const products = response.data.products;
          
          const getLatest = (category) => {
            return products
              .filter((item) => item.category?.toLowerCase() === category.toLowerCase())
              .sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id))[0] || null;
          };

          setLatest({
            music: getLatest("music"),
            film: getLatest("film"),
            commercial: getLatest("commercial"),
          });
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestItems();
  }, []);

  const ServiceCard = ({ product, title, target, description }) => {
    if (!product) {
      return (
        <motion.div
          className="flex flex-col gap-3 animate-pulse"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="w-full h-48 bg-gray-300 rounded-xl"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
        </motion.div>
      );
    }
    
    return (
      <motion.div
        className="flex flex-col gap-3 cursor-pointer group"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        onClick={() => {
          window.scrollTo(0, 0);
          navigate(`/latestcollection1#${target}`);
        }}
      >
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={product.coverImage || product.image || "https://via.placeholder.com/400x300?text=No+Image"}
            alt={product.productTitle || product.name || title}
            className="w-full h-48 sm:h-52 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 text-xs rounded-full bg-black/70 text-white border border-white/30 backdrop-blur">
              {product.category || title}
            </span>
          </div>
        </div>

        {/* Product Name */}
        <h3 
          className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-1"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: "600",
          }}
        >
          {product.productTitle || product.name || title}
        </h3>

        {/* Description - Exactly 3 lines */}
        <p 
          className="text-gray-600 text-xs sm:text-sm leading-relaxed"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: "400",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </p>
      </motion.div>
    );
  };

  return (
    <section className="bg-gray-50 px-6 md:px-12 lg:px-20 py-12 md:py-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6 md:gap-10 px-2 md:px-0">
        {/* Left Intro */}
        <div>
          <h2 
            className="text-2xl text-black sm:text-3xl font-bold mb-5 uppercase"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: "800",
            }}
          >
            Services
          </h2>
          <p 
            className="text-gray-600 mb-5 text-xs sm:text-sm leading-relaxed"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: "400",
            }}
          >
            Explore our latest highlights in Films, Music, and Commercials. Each category showcases our newest work, blending creativity, vision, and innovation to deliver outstanding experiences.
          </p>
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/contact');
            }}
            className="font-semibold text-gray-900 border-b-2 border-red-500 inline-block hover:text-red-600 transition-colors duration-300"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: "600",
            }}
          >
            Get in touch
          </button>
        </div>

        {/* Right Side - Service Cards */}
        <div className="md:col-span-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          <ServiceCard
            product={latest.film}
            title="Films"
            target="films"
            description="Our films explore powerful stories with stunning visuals and deep emotion. From short films to feature productions, we focus on creativity and storytelling that connects with audiences worldwide."
          />
          <ServiceCard
            product={latest.music}
            title="Music"
            target="music"
            description="We create original music that inspires, moves, and resonates deeply. From cinematic scores to modern tracks, our music production blends creativity with emotion for unique soundscapes."
          />
          <ServiceCard
            product={latest.commercial}
            title="Commercials"
            target="commercials"
            description="Our commercials bring brands to life with bold ideas and striking visuals. We craft campaigns that resonate emotionally, engage audiences, and make brands stand out effectively."
          />
        </div>
      </div>
    </section>
  );
};

export default Services;
