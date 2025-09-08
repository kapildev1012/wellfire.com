import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import aboutImg from "../assets/about_img.png";

const AboutPreview = () => {
  const navigate = useNavigate();

  const handleReadMore = () => {
    window.scrollTo(0, 0);
    navigate('/about');
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="flex flex-col md:flex-row items-center gap-8 md:gap-16"
      >
        {/* LEFT SIDE IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="w-full md:w-1/3 rounded-xl overflow-hidden shadow-lg"
        >
          <img
            src={aboutImg}
            alt="About Us"
            className="w-full h-[280px] md:h-[360px] object-cover hover:scale-105 transition-transform duration-700"
          />
        </motion.div>

        {/* RIGHT SIDE CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="w-full md:w-2/3 text-center md:text-left space-y-3 md:space-y-5"
        >
          <h2
            className="font-extrabold text-xl md:text-3xl lg:text-4xl tracking-wide uppercase text-gray-900"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: "800",
            }}
          >
            ABOUT US
          </h2>

          {/* Truncated Text - Only 3 lines */}
          <div className="relative">
            <p
              className="text-xs md:text-sm lg:text-base text-gray-600 leading-relaxed"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: "400",
                display: "-webkit-box",
                WebkitLineClamp: 5,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              We are passionate about delivering high-quality products and creating unique shopping experiences. Our mission is to provide value, trust, and satisfaction to every customer we serve. We specialize in creating exceptional content that resonates with audiences worldwide.
            </p>
            
            {/* Gradient Fade Effect */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          </div>

          {/* Read More Button */}
          <motion.button
            onClick={handleReadMore}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white font-medium uppercase tracking-wide text-sm rounded-md overflow-hidden transition-all duration-300 hover:bg-gray-800"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: "500",
            }}
          >
            <span className="relative z-10">Read More</span>
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.button>

        </motion.div>
      </motion.div>
    </section>
  );
};

export default AboutPreview;
