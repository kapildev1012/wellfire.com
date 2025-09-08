import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import footerImg from "../assets/footer-image.jpg"; // ✅ replace with your actual image path

const Footer = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    window.scrollTo(0, 0);
    navigate(path);
  };

  const testimonials = [
    {
      text: "Wellfire Studio transformed our brand with exceptional creativity and professionalism.",
      author: "Sarah Johnson",
      role: "Creative Director, TechCorp",
    },
    {
      text: "Outstanding work that exceeded all our expectations. True creative partners.",
      author: "Michael Chen",
      role: "CEO, StartupVision",
    },
    {
      text: "The most talented team we've ever worked with. Incredible results every time.",
      author: "Emma Davis",
      role: "Marketing Head, BrandFlow",
    },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer
      id="footer-section"
      className="w-full py-10 text-white font-['Inter',sans-serif] relative overflow-hidden rounded-2xl bg-black"
    >
      <div className="relative bg-gradient-to-b from-gray-900 to-black border-t border-gray-500/20 ">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10">
          {/* Main Footer Grid with Image */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 mb-8 lg:mb-10 items-start">
            {/* Left Content */}
            <div className="lg:col-span-3 space-y-5 text-sm sm:text-base">
              {/* Company Info */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 bg-gradient-to-r from-red-500 via-pink-400 to-red-600 bg-clip-text text-transparent">
                  Wellfire Studio
                </h3>
                <p className="text-gray-400 leading-relaxed text-xs sm:text-sm max-w-md">
                  We craft extraordinary visual experiences that captivate
                  audiences and drive results. Every frame tells a story, every
                  project creates impact.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="tel:+919876543210"
                  className="group p-3 bg-white/5 rounded-lg border border-white/10 hover:border-red-500/30 transition-all duration-300 hover:scale-101"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300 text-xs">Call Us</span>
                  </div>
                  <p className="text-white font-semibold text-sm">
                    +91 98765 433210
                  </p>
                </a>

                <a
                  href="mailto:wellfire@studio.com"
                  className="group p-3 bg-white/5 rounded-lg border border-white/10 hover:border-red-500/30 transition-all duration-300 hover:scale-101"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300 text-xs">Email Us</span>
                  </div>
                  <p className="text-white font-semibold text-sm">
                    wellfire@studio.com
                  </p>
                </a>
              </div>

              {/* Location */}
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 text-xs">Visit Us</span>
                </div>
                <p className="text-white font-semibold text-sm">
                  123 Creative Street, Design District
                  <br />
                  Mumbai, India 400001
                </p>
              </div>
            </div>

            {/* Right Side Image */}
            <div className="lg:col-span-2">
              <img
                src={footerImg}
                alt="Wellfire Studio"
                className="w-full rounded-2xl shadow-lg border border-white/10 object-cover max-h-72"
              />
              
              {/* Navigation Links - Directly Below Photo */}
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                {[
                  { name: "About Us", href: "/about" },
                  { name: "Our Services", href: "/services" },
                  { name: "Portfolio", href: "/photo" },
                  { name: "Contact", href: "/contact" },
                ].map((link) => (
                  <button
                    key={link.name}
                    onClick={() => handleNavigation(link.href)}
                    className="hover:text-red-400 transition-colors duration-300"
                  >
                    {link.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 bg-gradient-to-r from-black via-red-950/10 to-black">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
              © 2024 Wellfire Studio. Crafted for creative excellence.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
              <button
                onClick={() => handleNavigation('/privacy')}
                className="hover:text-red-400 flex items-center gap-1"
              >
                Privacy Policy <ExternalLink className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleNavigation('/terms')}
                className="hover:text-red-400 flex items-center gap-1"
              >
                Terms <ExternalLink className="w-3 h-3" />
              </button>
              <button 
                onClick={() => handleNavigation('/cookies')} 
                className="hover:text-red-400"
              >
                Cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
