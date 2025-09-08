import React from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout Components
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";

// Pages
import Investors from "./pages/Investors";
import InvestorProduct from "./pages/InvestorProduct";
import ProfileEdit from "./pages/ProfileEdit";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CategoryPage from "./pages/CategoryPage";
import LatestCollection1 from "./components/LatestCollection1";
import Photo from "./pages/Photo";

const App = () => {
  return (
    <>
      {/* ✅ Scroll to top on route change */}
      <ScrollToTop />
      
      {/* ✅ Toast Notification */}
      <ToastContainer
        position="top-center"
        autoClose={1000}
        limit={1}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />

      {/* ✅ Global UI Components */}
      <Navbar />

      {/* ✅ Main Routes */}
      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <Routes>
          <Route path="/" element={<Home />} />
           <Route path="/investors" element={<Investors />} />
          <Route path="/investorproduct/:id?" element={<InvestorProduct />} />
          <Route path="/profile-edit" element={<ProfileEdit />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/Latestcollection1" element={<LatestCollection1 />} />
          <Route path="/photo" element={<Photo />} />
        </Routes>

        <Footer />
      </div>
    </>
  );
};

export default App;
