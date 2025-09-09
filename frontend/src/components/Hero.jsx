import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import heroVideo from "../assets/hero.mp4";

const Hero = () => {
  const videoRef = useRef(null);
  const [showText, setShowText] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Enhanced mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const isTouchDevice = "ontouchstart" in window;
      setIsMobile(width < 768 || isTouchDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle video loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => setIsVideoLoaded(true);
    video.addEventListener("loadeddata", handleLoadedData);

    return () => video.removeEventListener("loadeddata", handleLoadedData);
  }, []);

  // Handle video and text timing - Fixed syntax error
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const t = video.currentTime;

      // Fixed the visibility ranges syntax
      const shouldShow =
        (t >= 14.7 && t <= 37) || (t >= 42 && t <= 62.7) || t >= 69.6;

      if (shouldShow !== showText) {
        setShowText(shouldShow);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [showText]);

  return (
    <div
      className="w-full"
      style={{ fontFamily: "Montserrat, sans-serif", fontWeight: "800" }}
    >
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="w-full px-4 py-6 sm:px-6 sm:py-8">
          {/* Video Section for Mobile */}
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative w-full overflow-hidden rounded-lg shadow-2xl"
          >
            {/* Loading placeholder */}
            {!isVideoLoaded && (
              <div className="w-full h-64 bg-gray-900 flex items-center justify-center rounded-lg">
                <div className="animate-pulse text-white text-sm">
                  Loading...
                </div>
              </div>
            )}

            <video
              ref={videoRef}
              src={heroVideo}
              autoPlay
              loop
              muted
              playsInline
              poster="" // Add poster image path here
              className={`w-full h-auto min-h-[250px] max-h-[70vh] object-cover rounded-lg ${
                !isVideoLoaded ? "hidden" : ""
              }`}
              style={{ aspectRatio: "16/9" }}
            />

            {/* Subtle overlay for mobile */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none rounded-lg"></div>

            {/* Mobile Text Overlay */}
            <AnimatePresence>
              {showText && isVideoLoaded && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center z-10 px-6 py-4"
                >
                  <div className="text-center text-white uppercase tracking-wide max-w-sm mx-auto px-4">
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="text-2xl sm:text-3xl mb-4 leading-tight"
                      style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                    >
                      WELLFIRE
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="text-xs sm:text-sm mb-4 leading-relaxed opacity-90 px-2"
                      style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                    >
                      YOUR SUBTITLE OR DESCRIPTION HERE
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        </div>
      ) : (
        /* Desktop/Laptop Layout - Video at actual size with navbar padding */
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="relative w-full flex items-center justify-center overflow-hidden pt-16 md:pt-25 lg:pt-10"
        >
          {/* Video Container */}
          <div className="relative w-full max-w-none flex justify-center">
            {/* Background Video - Actual Size */}
            <video
              ref={videoRef}
              src={heroVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-auto h-auto max-w-full max-h-[calc(100vh-5rem)] object-contain"
            />

            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>

            {/* Desktop Content Overlay */}
            <AnimatePresence>
              {showText && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center z-10 px-4 sm:px-6 md:px-12"
                >
                  <div className="text-center text-white uppercase tracking-wider">
                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="text-4xl md:text-6xl lg:text-8xl mb-6"
                      style={{ textShadow: "3px 3px 6px rgba(0,0,0,0.7)" }}
                    >
                      WELLFIRE
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-sm md:text-base lg:text-lg text-centre mb-8 max-w-3xl"
                      style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.7)" }}
                    >
                      WE DREAM WE CREATE WE PRESENT
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default Hero;