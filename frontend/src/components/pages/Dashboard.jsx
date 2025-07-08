import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  FaBars,
  FaTachometerAlt,
  FaBoxOpen,
  FaUserAlt,
  FaCog,
  FaSun,
  FaMoon,
  FaGlobe,
  FaBell,
  FaCaretDown,
  FaTh,
  FaCashRegister,
  FaBox,
  FaSearch,
  FaStickyNote,
  FaGavel,
  FaWarehouse,
  FaChartLine,
  FaExchangeAlt,
  FaUsers,
  FaUserTie,
  FaFileUpload,
  FaFileAlt,
  FaBlog,
  FaBullhorn,
  FaHeadset,
  FaHandshake,
  FaCreditCard,
  FaCoins,
  FaMobileAlt,
  FaGlobeAfrica,
  FaGlobeAsia,
  FaPuzzlePiece,
  FaUserShield,
  FaServer,
  FaArrowUp,
  FaArrowDown,
  FaShoppingCart,
  FaMoneyBillWave,
  FaStore,
  FaCube,
  FaEye,
  FaFilter,
} from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./Layout.css";

export default function MultiVendorDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [darkMode, setDarkMode] = useState(false);
  const [showFlagDropdown, setShowFlagDropdown] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [openMenu, setOpenMenu] = useState({});
  const [activeView, setActiveView] = useState("dashboard");

  const profileRef = useRef(null);

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleLogout = () => {
    alert("Logging out...");
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowAddDropdown(false);
    setShowFlagDropdown(false);
  };

  const selectFlag = (country) => {
    setSelectedFlag(country);
    setShowFlagDropdown(false);
  };

  const toggleAddDropdown = () => {
    setShowAddDropdown(!showAddDropdown);
    setShowFlagDropdown(false);
    setShowProfileDropdown(false);
  };

  const toggleFlagDropdown = () => {
    setShowFlagDropdown(!showFlagDropdown);
    setShowAddDropdown(false);
    setShowProfileDropdown(false);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`layout ${darkMode ? "dark" : ""}`}>
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-logo">
            <div className="logo-icon" style={{ display:"flex", justifyContent:"left" }} >
              <img src="/wallet final logo.png" alt="" style={{ width: 50 }} /> <span> ShopyMall </span>
             </div>
          </div>
          {isMobile && (
            <button
              className="close-btn"
              onClick={() => setIsSidebarOpen(false)}
            >
              <AiOutlineClose />
            </button>
          )}
        </div>

        <div className="sidebar-search">
          <FaSearch className="search-icon" />
          <input className="search-input" type="text" placeholder="Search in menu" />
        </div>

        <ul className="sidebar-nav">
          <li className="active">
            <div onClick={() => setActiveView("dashboard")}>
              <FaTh />
              <Link to="/admin/Dashboardcontent" className="dashboardlink">
                Dashboard
              </Link>{" "}
            </div>
          </li>
          <li>
            <div className="dropdown-toggle" onClick={() => toggleMenu("pos")}>
              <FaCashRegister />
              POS System
            </div>
            {openMenu["pos"] && (
              <ul className="submenu">
                <li>
                  <div>
                    {" "}
                    <Link to="/pos/sale" className="linkproduct">
                      POS Manager
                    </Link>
                  </div>
                </li>
                <li>
                  <div>
                    <Link to="/pos/return" className="linkproduct">
                      POS Configuration
                    </Link>
                  </div>
                </li>
              </ul>
            )}
          </li>
          <li>
            <div
              className="dropdown-toggle"
              onClick={() => toggleMenu("products")}
            >
              <FaBox /> Products
            </div>
            {openMenu["products"] && (
              <ul className="submenu">
                <li>
                  {" "}
                  <li>
                    <div>
                      <Link to="/admin/brands" className="linkproduct">
                        Brands
                      </Link>
                    </div>
                  </li>
                  <li>
                    <div>
                      <Link to="/admin/categories" className="linkproduct">
                    Verticals
                      </Link>
                    </div>
                  </li>
                  <li>
                    <div>
                      <Link to="/admin/subcategories" className="linkproduct">
                        Categories
                      </Link>
                    </div>
                  </li>
                  <li>
                    <div>
                      {" "}
                      <Link
                        to="/admin/subsubcategories"
                        className="linkproduct"
                      >
                        Subcategories
                      </Link>
                    </div>
                  </li>
                  
                </li>
                <li>
                  <div>
                     <Link to="/admin/all-product" className="linkproduct">
                      All Products
                    </Link>
                  </div>
                </li>
              </ul>
            )}
          </li>

          <li>
            <div
              className="dropdown-toggle"
              onClick={() => toggleMenu("seller")}
            >
              <FaCashRegister /> Seller Product
            </div>
            {openMenu["seller"] && (
              <ul className="submenu">
                <li>
                  <div>
                    {" "}
                    <Link
                      to="/products/seller/physical"
                      className="linkproduct"
                    >
                      Physical Products
                    </Link>
                  </div>
                </li>
                <li>
                  <div>
                    <Link to="/products/seller/digital" className="linkproduct">
                      Digital Products
                    </Link>
                  </div>
                </li>
              </ul>
            )}
          </li>

          <li>
            <div onClick={() => setActiveView("orders")}>
              <FaShoppingCart /> Orders
            </div>
          </li>

          <li>
            <div onClick={() => setActiveView("customers")}>
              <FaUserAlt /> Customers
            </div>
          </li>

          <li>
            <div
              className="dropdown-toggle"
              onClick={() => toggleMenu("payments")}
            >
              <FaCreditCard /> Payments
            </div>
            {openMenu["payments"] && (
              <ul className="submenu">
                <li>
                  <div>Payment Methods</div>
                </li>
                <li>
                  <div>Payment Reports</div>
                </li>
                <li>
                  <div>Refunds</div>
                </li>
              </ul>
            )}
          </li>

          <li>
            <div
              className="dropdown-toggle"
              onClick={() => toggleMenu("reports")}
            >
              <FaChartLine /> Reports
            </div>
            {openMenu["reports"] && (
              <ul className="submenu">
                <li>
                  <div>Sales Report</div>
                </li>
                <li>
                  <div>Product Report</div>
                </li>
                <li>
                  <div>Vendor Report</div>
                </li>
              </ul>
            )}
          </li>

          <li>
            <div onClick={() => setActiveView("settings")}>
              <FaCog /> Settings
            </div>
          </li>
        </ul>
      </div>

      {isMobile && isSidebarOpen && (
        <div className="overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Main Content */}
      <div className="main">
        <div className="topbar">
          {isMobile && (
            <button
              className="toggle-btn"
              onClick={() => setIsSidebarOpen(true)}
            >
              <FaBars />
            </button>
          )}

          <div className="topbar-right">
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            <button className="notification-btn">
              <FaBell />
              <span className="notification-badge">3</span>
            </button>

            <div className="dropdown-container">
              <button className="add-btn" onClick={toggleAddDropdown}>
                Add New +
              </button>
              {showAddDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-item">+ New Brand</div>
                  <div className="dropdown-item">+ New Category</div>
                  <div className="dropdown-item">+ New Product</div>
                  <div className="dropdown-item">+ New Vendor</div>
                </div>
              )}
            </div>

            <div ref={profileRef} className="profile-container">
              <div className="profile-info" onClick={toggleProfileDropdown}>
                <img
                  src="https://randomuser.me/api/portraits/men/45.jpg"
                  alt="Admin"
                  className="profile-pic"
                />
                <div className="profile-text">
                  <span className="profile-name">Gunjan Bansal</span>
                  <FaCaretDown className="dropdown-arrow" />
                </div>
              </div>

              {showProfileDropdown && (
                <div className="dropdown-menu profile-menu">
                  <div className="dropdown-item">User Profile</div>
                  <div className="dropdown-item">Account Settings</div>
                  <div className="dropdown-item logout" onClick={handleLogout}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
