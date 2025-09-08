import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import aboutImg from "../assets/about_img.png";

const About = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    // Trigger visibility for staggered animations
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, x: -50 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        delay: 0.3,
        ease: "easeOut",
      },
    },
  };

  const stats = [
    { number: "500+", label: "Projects Completed" },
    { number: "98%", label: "Client Satisfaction" },
    { number: "5+", label: "Years Experience" },
    { number: "24/7", label: "Support Available" },
  ];

  return (
    <div className="bg-primary min-h-screen">
      {/* Background Elements */}
      <div className="gradient-mesh fixed inset-0 pointer-events-none" />
      <div className="bg-noise fixed inset-0 pointer-events-none" />

      <section className="relative w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-20 lg:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="space-y-16 md:space-y-20"
        >
          {/* Main Content Section */}
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-16">
            {/* LEFT SIDE IMAGE */}
            <motion.div
              variants={imageVariants}
              className="w-full lg:w-2/5 relative group"
            >
              <div className="relative overflow-hidden rounded-3xl bg-card border border-primary shadow-xl">
                {/* Image container with enhanced styling */}
                <div className="relative overflow-hidden">
                  <img
                    src={aboutImg}
                    alt="About Us"
                    className="w-full h-[280px] sm:h-[350px] md:h-[400px] lg:h-[480px] object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                
                  
                </div>

              
              </div>
            </motion.div>

            {/* RIGHT SIDE CONTENT */}
            <motion.div
              variants={textVariants}
              className="w-full lg:w-3/5 text-center lg:text-left space-y-6 md:space-y-8"
            >
              {/* Title with enhanced styling */}
              <div className="space-y-4">
               

                <motion.h1
                  variants={itemVariants}
                  className="text-display text-primary font-secondary leading-none"
                >
                  ABOUT <span className="text-gradient">US</span>
                </motion.h1>

                <motion.div
                  variants={itemVariants}
                  className="w-20 h-1 bg-red-600 mx-auto lg:mx-0 rounded-full"
                />
              </div>

              {/* Description paragraphs */}
              <motion.div
                variants={itemVariants}
                className="space-y-4 md:space-y-6"
              >
                <p className="text-body text-secondary leading-relaxed font-primary">
                  We are passionate about delivering{" "}
                  <span className="text-accent font-semibold">
                    high-quality products
                  </span>{" "}
                  and creating unique shopping experiences. Our mission is to
                  provide value, trust, and satisfaction to every customer we
                  serve.
                </p>

                <p className="text-caption text-tertiary leading-relaxed font-primary">
                  With years of experience in the industry, we specialize in
                  creating exceptional content that resonates with audiences
                  worldwide. Our team combines{" "}
                  <span className="text-secondary font-medium">
                    creativity with technical expertise
                  </span>{" "}
                  to deliver outstanding results that exceed expectations.
                </p>

               
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
              
              </motion.div>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="card p-6 md:p-8 text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="text-headline text-accent font-bold font-mono mb-2 group-hover:text-red-400 transition-colors">
                  {stat.number}
                </div>
                <div className="text-caption text-secondary font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
           
          </motion.div>

        
         
        </motion.div>
      </section>
    </div>
  );
};

export default About;
