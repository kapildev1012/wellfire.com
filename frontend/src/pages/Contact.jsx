import React, { useState, useEffect } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    stageName: "",
    contact: "",
    email: "",
    industry: "",
    message: "",
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState([]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Auto-save draft functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.name || formData.email || formData.message) {
        const draft = {
          ...formData,
          timestamp: new Date().toLocaleString(),
          id: Date.now(),
        };
        const existingDrafts = JSON.parse(
          localStorage.getItem("contactDrafts") || "[]"
        );
        const newDrafts = [draft, ...existingDrafts.slice(0, 2)]; // Keep only 3 drafts
        localStorage.setItem("contactDrafts", JSON.stringify(newDrafts));
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData]);

  // Load saved drafts on component mount
  useEffect(() => {
    const drafts = JSON.parse(localStorage.getItem("contactDrafts") || "[]");
    setSavedDrafts(drafts);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, file: "File must be less than 10MB" });
        return;
      }
      setFile(selectedFile);
      setErrors({ ...errors, file: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.contact.trim()) {
      newErrors.contact = "Contact number is required";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.contact.trim())) {
      newErrors.contact = "Please enter a valid phone number";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Please tell us about yourself and your goals";
    } else if (formData.message.trim().length < 20) {
      newErrors.message = "Message should be at least 20 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendEmail = () => {
    const subject = `New Talent Application - ${formData.name}`;
    const body = `
New talent application received:

Name: ${formData.name}
Stage Name: ${formData.stageName || "Not provided"}
Phone: ${formData.contact}
Email: ${formData.email}
Industry: ${formData.industry || "Not specified"}

Message:
${formData.message}

${file ? `File attached: ${file.name}` : "No file attached"}

Application submitted on: ${new Date().toLocaleString()}
    `;

    const mailtoLink = `mailto:info.wellfire@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Send email automatically
      sendEmail();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setShowSuccess(true);

      // Clear form and localStorage
      setFormData({
        name: "",
        stageName: "",
        contact: "",
        email: "",
        industry: "",
        message: "",
      });
      setFile(null);
      setCurrentStep(1);
      localStorage.removeItem("contactDrafts");

      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadDraft = (draft) => {
    setFormData({
      name: draft.name,
      stageName: draft.stageName,
      contact: draft.contact,
      email: draft.email,
      industry: draft.industry,
      message: draft.message,
    });
  };

  const nextStep = () => {
    if (currentStep === 1) {
      const stepOneErrors = {};
      if (!formData.name.trim()) stepOneErrors.name = "Full name is required";
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
        stepOneErrors.email = "Valid email is required";
      }
      if (!formData.contact.trim())
        stepOneErrors.contact = "Contact is required";

      if (Object.keys(stepOneErrors).length === 0) {
        setCurrentStep(2);
        setErrors({});
      } else {
        setErrors(stepOneErrors);
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleCall = () => {
    window.location.href = "tel:+917506312117";
  };

  const handleWhatsApp = () => {
    const message = `Hi! I'm interested in working with WELLFIRE Entertainment. My name is ${
      formData.name || "[Your Name]"
    }.`;
    window.open(
      `https://wa.me/917506312117?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleQuickEmail = () => {
    window.location.href =
      "mailto:info.wellfire@gmail.com?subject=Quick Inquiry - WELLFIRE Entertainment";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  bg-black text-white">

      {/* Auto-save Indicator */}
      {isTyping && (
        <div className="fixed bottom-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-full text-sm z-40 flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Saving draft...</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black mb-3 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
            JOIN OUR  NETWORK
          </h1>
         
          {/* Enhanced Contact Info Bar */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm">
           
          
          </div>
        </div>
      </div>

      {/* Saved Drafts Section */}
      {savedDrafts.length > 0 && currentStep === 1 && (
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <h3 className="text-sm font-medium text-yellow-300 mb-2">
                 Continue from where you left off
              </h3>
              <div className="flex flex-wrap gap-2">
                {savedDrafts.slice(0, 2).map((draft, index) => (
                  <button
                    key={draft.id}
                    onClick={() => loadDraft(draft)}
                    className="bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-100 px-2 sm:px-3 py-1 rounded text-xs transition-colors"
                  >
                    {draft.name || "Unnamed"} - {draft.timestamp}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Section */}
      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Enhanced Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-400">
                  Step {currentStep} of 2
                </span>
                {currentStep === 1 && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                   
                  </span>
                )}
                {currentStep === 2 && (
                  <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                    Profile Details
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {showPreview ? "Hide Preview" : "Show Preview"} 
              </button>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500 relative"
                style={{ width: currentStep === 1 ? "50%" : "100%" }}
              >
                <div className="absolute right-0 top-0 h-full w-4 bg-white/30 animate-pulse rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="mb-8 bg-gray-800/20 rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-lg font-semibold mb-4">
                 Application Preview
              </h3>
              <div className="text-sm space-y-2 text-gray-300">
                <p>
                  <strong>Name:</strong> {formData.name || "Not entered"}
                </p>
                <p>
                  <strong>Stage Name:</strong>{" "}
                  {formData.stageName || "Not provided"}
                </p>
                <p>
                  <strong>Email:</strong> {formData.email || "Not entered"}
                </p>
                <p>
                  <strong>Phone:</strong> {formData.contact || "Not entered"}
                </p>
                <p>
                  <strong>Industry:</strong>{" "}
                  {formData.industry || "Not specified"}
                </p>
                <p>
                  <strong>Message:</strong>{" "}
                  {formData.message
                    ? `${formData.message.substring(0, 100)}...`
                    : "Not entered"}
                </p>
                <p>
                  <strong>File:</strong> {file ? file.name : "No file selected"}
                </p>
              </div>
            </div>
          )}

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-700/50 shadow-2xl">
            {currentStep === 1 ? (
              /* Step 1: Enhanced Basic Info */
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">
                    Let's Get Started 
                  </h2>
                 
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center">
                    Full Name <span className="text-red-500 ml-1">*</span>
                    <span className="ml-2 text-xs text-gray-500">
                      (as per official documents)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full legal name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full bg-gray-700/50 border ${
                      errors.name ? "border-red-500" : "border-gray-600"
                    } text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg focus:border-red-500 focus:outline-none transition-all duration-300 focus:ring-2 focus:ring-red-500/20 text-sm sm:text-base`}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <span className="mr-1">⚠️</span> {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center">
                    Stage/Professional Name
                    <span className="text-gray-500 text-xs ml-2">
                      (Optional)
                    </span>
                   
                  </label>
                  <input
                    type="text"
                    name="stageName"
                    placeholder="e.g., John Artist, DJ Phoenix, MC Thunder"
                    value={formData.stageName}
                    onChange={handleChange}
                    className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg focus:border-red-500 focus:outline-none transition-all duration-300"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    The name you perform or work under professionally
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center">
                      Phone Number <span className="text-red-500 ml-1">*</span>
                      <span className="ml-2 text-xs text-gray-500">
                         We'll call
                      </span>
                    </label>
                    <input
                      type="tel"
                      name="contact"
                      placeholder="+91 98765 43210"
                      value={formData.contact}
                      onChange={handleChange}
                      className={`w-full bg-gray-700/50 border ${
                        errors.contact ? "border-red-500" : "border-gray-600"
                      } text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg focus:border-red-500 focus:outline-none transition-all duration-300 focus:ring-2 focus:ring-red-500/20 text-sm sm:text-base`}
                    />
                    {errors.contact && (
                      <p className="text-red-400 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠️</span> {errors.contact}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center">
                      Email Address <span className="text-red-500 ml-1">*</span>
                      <span className="ml-2 text-xs text-gray-500">
                         Primary communication
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full bg-gray-700/50 border ${
                        errors.email ? "border-red-500" : "border-gray-600"
                      } text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg focus:border-red-500 focus:outline-none transition-all duration-300 focus:ring-2 focus:ring-red-500/20 text-sm sm:text-base`}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠️</span> {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={nextStep}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <span>Continue to Profile Details</span>
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Enhanced Profile Details */
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Your Profile </h2>
                  <p className="text-gray-400">
                    Share your background and aspirations with us
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center">
                    Industry/Field
                    <span className="text-gray-500 text-xs ml-2">
                      (Optional)
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                       Help us categorize your talent
                    </span>
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg focus:border-red-500 focus:outline-none transition-all duration-300"
                  >
                    <option value="">Select your primary field</option>
                    <option value="Music">
                       Music (Singer, Musician, Composer)
                    </option>
                    <option value="Film">
                       Film & TV (Actor, Director, Producer)
                    </option>
                    <option value="Dance">
                       Dance (Choreographer, Dancer)
                    </option>
                    <option value="Comedy">
                       Comedy (Stand-up, Comedy Writing)
                    </option>
                    <option value="Theater">
                       Theater (Stage Actor, Playwright)
                    </option>
                    <option value="Content">
                       Content Creation (YouTube, Social Media)
                    </option>
                    <option value="Writing">
                       Writing (Screenwriter, Author)
                    </option>
                    <option value="Photography">
                       Photography/Videography
                    </option>
                    <option value="Other">
                       Other (Please specify in message)
                    </option>
                  </select>
                  <p className="text-gray-500 text-xs mt-1">
                    Choose the field that best represents your primary talent
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center">
                    About You & Your Goals{" "}
                    <span className="text-red-500 ml-1">*</span>
                    <span className="ml-2 text-xs text-gray-500">
                       Be authentic and specific
                    </span>
                  </label>
                  <textarea
                    name="message"
                    placeholder="Tell us your story! Include:
"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    className={`w-full bg-gray-700/50 border ${
                      errors.message ? "border-red-500" : "border-gray-600"
                    } text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg focus:border-red-500 focus:outline-none transition-all duration-300 resize-vertical focus:ring-2 focus:ring-red-500/20 text-sm sm:text-base`}
                  ></textarea>
                  <div className="flex justify-between items-center mt-1">
                    {errors.message ? (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠️</span> {errors.message}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-xs">
                        Minimum 20 characters • Be detailed and honest
                      </p>
                    )}
                    <span
                      className={`text-xs ${
                        formData.message.length < 20
                          ? "text-red-400"
                          : "text-gray-500"
                      }`}
                    >
                      {formData.message.length}/1000
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center">
                    Resume/Portfolio
                    <span className="text-gray-500 text-xs ml-2">
                      (Highly Recommended)
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                       Showcase your best work
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mp3,.zip"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="w-full bg-gray-700/30 border-2 border-dashed border-gray-600 hover:border-red-500 text-gray-400 hover:text-white px-3 sm:px-4 py-6 sm:py-8 rounded-lg cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-2 sm:space-y-3 hover:bg-gray-700/50"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 sm:w-8 sm:h-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-base sm:text-lg font-medium">
                          {file
                            ? "Click to change file"
                            : "Drop your file here or click to browse"}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          PDF, DOC, Images, Videos, Audio, ZIP (Max 10MB)
                        </p>
                        <p className="text-xs text-gray-600 mt-1 sm:mt-2">
                           Portfolio, demo reel, music samples, or resume
                        </p>
                      </div>
                    </label>
                  </div>

                  {file && (
                    <div className="mt-4 bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                              {file.type || "Unknown type"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-red-600/20 transition-colors"
                          title="Remove file"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                  {errors.file && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠️</span> {errors.file}
                    </p>
                  )}
                </div>

                {/* Social Media Links - New Feature */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center">
                    Social Media/Portfolio Links
                    <span className="text-gray-500 text-xs ml-2">
                      (Optional)
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                       Show us your online presence
                    </span>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder=" YouTube/Spotify profile"
                      className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-2 rounded-lg focus:border-red-500 focus:outline-none transition-all duration-300 text-sm"
                    />
                    <input
                      type="url"
                      placeholder="Instagram handle"
                      className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-2 rounded-lg focus:border-red-500 focus:outline-none transition-all duration-300 text-sm"
                    />
                    <input
                      type="url"
                      placeholder=" LinkedIn/Portfolio website"
                      className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-2 rounded-lg focus:border-red-500 focus:outline-none transition-all duration-300 text-sm"
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    Add links to your best work and social profiles
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6">
                  <button
                    onClick={prevStep}
                    className="w-full sm:flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full sm:flex-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-300 transform ${
                      isSubmitting
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105 hover:shadow-xl"
                    } flex items-center justify-center space-x-2 text-sm sm:text-base`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Submitting & Sending Email...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Profile & Send Email</span>
                        <span className="text-lg"></span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Enhanced Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-4">
          <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white p-8 rounded-2xl shadow-2xl max-w-md mx-auto text-center transform animate-bounce border border-green-500/50">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <svg
                className="w-12 h-12 text-white animate-pulse"
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
            <h3 className="text-3xl font-bold mb-4 flex items-center justify-center space-x-2">
            
            </h3>
            <p className="mb-4 text-lg">
              Your profile has been submitted successfully!
            </p>
            <div className="bg-white/20 rounded-lg p-4 mb-4 backdrop-blur-sm">
            
              <p className="text-sm font-medium">
                 You'll hear from us soon!
              </p>
            </div>
            <p className="text-sm opacity-90">
              We'll review your application and get back to you within{" "}
              <strong>2-3 business days</strong>.
            </p>
            <div className="mt-4 flex justify-center space-x-2">
              <button
                onClick={handleWhatsApp}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors"
              >
        
              </button>
              <button
                onClick={handleCall}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-black/80 py-8 px-4 sm:px-6 border-t border-gray-800">
        
      </div>
    </div>
  );
};

export default Contact;
