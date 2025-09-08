import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const InvestorProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    companyDetail: "",
    expectations: "",
  });

  const [productData, setProductData] = useState(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [countryCode, setCountryCode] = useState("+91");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      fetchProductData();
    }
  }, [id]);

  const fetchProductData = async () => {
    try {
      setIsLoadingProduct(true);
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
      const response = await axios.get(
        `${backendUrl}/api/investment-product/list`
      );

      if (response.data.success && response.data.products) {
        const product = response.data.products.find((p) => p._id === id);
        if (product) {
          setProductData(product);
        }
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(formData.phone.replace(/\s+/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.companyDetail.trim()) {
      newErrors.companyDetail = "Company details are required";
    }

    if (!formData.expectations.trim()) {
      newErrors.expectations = "Please describe your expectations";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendEmail = () => {
    const subject = `Business Partnership Inquiry - ${formData.name}`;
    const productInfo = productData
      ? `Product Name: ${productData.productTitle || "Unknown Product"}
Category: ${productData.category || "Not specified"}
Artist: ${productData.artistName || "Unknown Artist"}`
      : `Product ID: ${id || "Not specified"}`;

    const body = `
New Business Partnership Application:

Name: ${formData.name}
Email: ${formData.email}
Phone: ${countryCode} ${formData.phone}
Website: ${formData.website || "Not provided"}
Company Details: ${formData.companyDetail}

Expectations from Partnership:
${formData.expectations}

Investment Product Details:
${productInfo}

Application submitted on: ${new Date().toLocaleString()}
    `;

    const mailtoLink = `mailto:info.wellfire@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Send email
      sendEmail();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setShowSuccess(true);

      // Clear form
      setFormData({
        name: "",
        email: "",
        phone: "",
        website: "",
        companyDetail: "",
        expectations: "",
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div
        className={`w-full max-w-4xl mx-auto ${
          isMobile ? "px-4 py-6" : "px-6 py-12"
        }`}
      >
        {/* Header Section */}
        <div className={`text-center ${isMobile ? "mb-8" : "mb-12"}`}>
          <div
            className={`flex items-center justify-center ${
              isMobile ? "flex-col gap-6" : "gap-8 mb-8"
            }`}
          >
            {/* Mobile: Title First */}
            <div className={isMobile ? "text-center" : "text-left"}>
              <h1
                className={`font-bold mb-4 ${
                  isMobile
                    ? "text-4xl sm:text-4xl leading-tight"
                    : "text-5xl md:text-6xl"
                }`}
              >
                {isMobile ? (
                  <>Join Our Business Partnership</>
                ) : (
                  <>
                    Join Our Business
                    <br />
                    Partnership
                  </>
                )}
              </h1>
              <p
                className={`text-gray-400 ${
                  isMobile ? "text-base" : "text-lg"
                }`}
              >
                Collaborate, Innovate and Thrive together
              </p>
            </div>

            {/* Partnership Icon */}
            <div
              className={`bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 ${
                isMobile ? "w-28 h-28" : "w-58 h-58"
              }`}
            >
              <svg
                className={`text-white ${isMobile ? "w-12 h-12" : "w-24 h-24"}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9V3H13.5L19 8.5V9H21ZM21 11H19V21C19 21.6 18.6 22 18 22H16C15.4 22 15 21.6 15 21V16H13V21C13 21.6 12.6 22 12 22H10C9.4 22 9 21.6 9 21V11H7V21C7 21.6 6.6 22 6 22H4C3.4 22 3 21.6 3 21V11H1V9H21V11Z" />
                <circle cx="6" cy="4" r="2" />
                <circle cx="18" cy="4" r="2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className={`text-center ${isMobile ? "mb-6" : "mb-8"}`}>
          <h2
            className={`font-semibold mb-2 ${
              isMobile ? "text-xl" : "text-2xl md:text-3xl"
            }`}
          >
            Interested ?
          </h2>
          <p
            className={`text-gray-400 ${
              isMobile ? "text-sm px-2" : "text-base"
            }`}
          >
            Please submit your channel information for review
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`space-y-${isMobile ? "4" : "6"}`}
        >
          {/* Name and Email Row */}
          <div
            className={`grid gap-${isMobile ? "4" : "6"} ${
              isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            <div>
              <input
                type="text"
                name="name"
                placeholder="Name*"
                value={formData.name}
                onChange={handleChange}
                className={`w-full bg-transparent border-2 ${
                  errors.name ? "border-red-500" : "border-gray-600"
                } rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors ${
                  isMobile ? "px-3 py-3 text-sm" : "px-4 py-4"
                }`}
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email*"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-transparent border-2 ${
                  errors.email ? "border-red-500" : "border-gray-600"
                } rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors ${
                  isMobile ? "px-3 py-3 text-sm" : "px-4 py-4"
                }`}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Phone Number Row */}
          <div className={`flex ${isMobile ? "gap-2" : "gap-4"}`}>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className={`bg-transparent border-2 border-gray-600 rounded-lg text-white focus:border-red-500 focus:outline-none transition-colors ${
                isMobile ? "px-2 py-3 text-sm w-16" : "px-4 py-4 w-20"
              }`}
            >
              <option value="+91" className="bg-black">
                +91
              </option>
              <option value="+1" className="bg-black">
                +1
              </option>
              <option value="+44" className="bg-black">
                +44
              </option>
              <option value="+61" className="bg-black">
                +61
              </option>
              <option value="+971" className="bg-black">
                +971
              </option>
            </select>

            <div className="flex-1">
              <input
                type="tel"
                name="phone"
                placeholder="Phone number*"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full bg-transparent border-2 ${
                  errors.phone ? "border-red-500" : "border-gray-600"
                } rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors ${
                  isMobile ? "px-3 py-3 text-sm" : "px-4 py-4"
                }`}
              />
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Website */}
          <div>
            <input
              type="url"
              name="website"
              placeholder="Website (Optional)"
              value={formData.website}
              onChange={handleChange}
              className={`w-full bg-transparent border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors ${
                isMobile ? "px-3 py-3 text-sm" : "px-4 py-4"
              }`}
            />
          </div>

          {/* Company Detail */}
          <div>
            <textarea
              name="companyDetail"
              placeholder="Company Detail*"
              value={formData.companyDetail}
              onChange={handleChange}
              rows={isMobile ? "3" : "4"}
              className={`w-full bg-transparent border-2 ${
                errors.companyDetail ? "border-red-500" : "border-gray-600"
              } rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors resize-vertical ${
                isMobile ? "px-3 py-3 text-sm" : "px-4 py-4"
              }`}
            />
            {errors.companyDetail && (
              <p className="text-red-400 text-sm mt-1">
                {errors.companyDetail}
              </p>
            )}
          </div>

          {/* Expectations */}
          <div>
            <textarea
              name="expectations"
              placeholder="What do you expect from this Partnership?*"
              value={formData.expectations}
              onChange={handleChange}
              rows={isMobile ? "3" : "4"}
              className={`w-full bg-transparent border-2 ${
                errors.expectations ? "border-red-500" : "border-gray-600"
              } rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors resize-vertical ${
                isMobile ? "px-3 py-3 text-sm" : "px-4 py-4"
              }`}
            />
            {errors.expectations && (
              <p className="text-red-400 text-sm mt-1">{errors.expectations}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className={`text-center ${isMobile ? "pt-4" : "pt-6"}`}>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full transition-all duration-300 transform ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105 hover:shadow-xl active:scale-95"
              } ${
                isMobile ? "px-8 py-3 text-sm w-full max-w-xs" : "px-12 py-4"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-4">
          <div
            className={`bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white rounded-2xl shadow-2xl text-center transform animate-bounce border border-green-500/50 ${
              isMobile ? "p-6 max-w-sm mx-auto" : "p-8 max-w-md mx-auto"
            }`}
          >
            <div
              className={`bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm ${
                isMobile ? "w-16 h-16 mb-4" : "w-20 h-20 mb-6"
              }`}
            >
              <svg
                className={`text-white animate-pulse ${
                  isMobile ? "w-8 h-8" : "w-12 h-12"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3
              className={`font-bold mb-3 ${
                isMobile ? "text-xl" : "text-3xl mb-4"
              }`}
            >
              Partnership Application Submitted!
            </h3>
            <p className={`mb-3 ${isMobile ? "text-base" : "text-lg mb-4"}`}>
              Thank you for your interest in partnering with us!
            </p>
            <div
              className={`bg-white/20 rounded-lg backdrop-blur-sm mb-3 ${
                isMobile ? "p-3" : "p-4 mb-4"
              }`}
            >
              <p className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}>
                We'll review your application and get back to you soon!
              </p>
            </div>
            <p className={`opacity-90 ${isMobile ? "text-xs" : "text-sm"}`}>
              Our team will contact you within{" "}
              <strong>2-3 business days</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorProduct;
