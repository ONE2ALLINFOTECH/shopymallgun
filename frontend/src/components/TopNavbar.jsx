import React, { useState, useEffect, useRef } from "react";
import "./TopNavbar.css";
import { FaGlobe, FaBell, FaCaretDown } from "react-icons/fa";

const TopNavbar = () => {
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showFlagDropdown, setShowFlagDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [countries, setCountries] = useState([]);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };
  // Ref for closing profile dropdown on outside click
  const profileRef = useRef(null);

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

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowAddDropdown(false);
    setShowFlagDropdown(false);
  };

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  const selectFlag = (country) => {
    setSelectedFlag(country);
    setShowFlagDropdown(false);
  };

  // Close profile dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sorted);

        const india = sorted.find(
          (country) => country.cca2.toLowerCase() === "in"
        );
        setSelectedFlag(india || sorted[0]);
      })
      .catch((err) => console.error("Error fetching countries:", err));
  }, []);

  return (
    <nav className="top-navbar navbar navbar-expand-lg navbar-light bg-white shadow-sm px-3 py-2 w-100">
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          onClick={handleNavCollapse}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`${
            isNavCollapsed ? "collapse" : ""
          } navbar-collapse justify-content-between`}
        >
          <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <button className="icon-btn">
                <FaGlobe />
              </button>
            </div>

            <div className="nav-links d-flex flex-column flex-lg-row gap-3">
              <a href="/dashboard" className="nav-link active">
                Dashboard
              </a>
              <a href="#" className="nav-link">
                Orders
              </a>
              <a href="#" className="nav-link">
                Earnings
              </a>
              <a href="#" className="nav-link">
                Homepage Settings
              </a>
            </div>
          </div>

          <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3 position-relative mt-3 mt-lg-0">
            {/* Add New Dropdown */}
            <div className="position-relative">
              <button
                className="btn btn-sm btn-color"
                onClick={toggleAddDropdown}
              >
                Add New +
              </button>
              {showAddDropdown && (
                <div
                  className="dropdown-box position-absolute bg-white shadow p-3 add-new-product"
                  style={{ zIndex: 1000, minWidth: "200px" }}
                >
                  <a href="/admin/brands" className="dropdown-item d-block mb-2">
                    + New Brand
                  </a>
                  <a href="/admin/categories" className="dropdown-item d-block mb-2">
                    + New Category
                  </a>
                  <a
                    href="/admin/subcategories"
                    className="dropdown-item d-block mb-2"
                  >
                    + New Sub Category
                  </a>
                  <a href="/admin/add-product" className="dropdown-item d-block">
                    + New Product
                  </a>
                </div>
              )}
            </div>

            {/* Flag selector with caret */}
            <div className="position-relative">
              <button
                className="btn btn-sm btn-color d-flex align-items-center gap-1"
                onClick={toggleFlagDropdown}
                style={{ minWidth: "53px" }}
                disabled={!selectedFlag}
              >
                {selectedFlag && (
                  <>
                    <img
                      src={selectedFlag.flags.png}
                      alt={selectedFlag.name.common}
                      className="flag-icon"
                      style={{
                        width: "25px",
                        height: "18px",
                        borderRadius: "3px",
                      }}
                    />
                    <FaCaretDown />
                  </>
                )}
                {!selectedFlag && "Loading..."}
              </button>

              {showFlagDropdown && (
                <div
                  className="dropdown-box position-absolute bg-white shadow p-2"
                  style={{
                    zIndex: 1000,
                    top: "40px",
                    right: 0,
                    minWidth: "150px",
                    borderRadius: "6px",
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  {countries.map((country) => (
                    <div
                      key={country.cca3}
                      className="d-flex align-items-center gap-2 p-1 dropdown-item"
                      style={{ cursor: "pointer" }}
                      onClick={() => selectFlag(country)}
                    >
                      <img
                        src={country.flags.png}
                        alt={country.name.common}
                        style={{
                          width: "25px",
                          height: "18px",
                          borderRadius: "3px",
                        }}
                      />
                      <span>{country.name.common}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Icon */}
            <FaBell
              className="icon-btn"
              style={{ cursor: "pointer" }}
              onClick={() => alert("No new notifications!")}
            />

            {/* Profile Dropdown */}
            <div
              ref={profileRef}
              className="position-relative profile d-flex align-items-center"
              style={{ cursor: "pointer" }}
            >
              <div
                className="text-end pe-2 d-none d-lg-block"
                onClick={toggleProfileDropdown}
              >
                <div className="fw-bold d-flex align-items-center gap-1">
                  Gunjan Bansal <FaCaretDown style={{ fontSize: "0.75rem" }} />
                </div>
              </div>
              <img
                src="https://randomuser.me/api/portraits/men/45.jpg"
                alt="Admin"
                className="profile-pic"
                onClick={toggleProfileDropdown}
              />

              {showProfileDropdown && (
                <div
                  className="dropdown-box position-absolute bg-white shadow p-2"
                  style={{
                    zIndex: 1000,
                    top: "50px",
                    right: 0,
                    minWidth: "150px",
                    borderRadius: "6px",
                  }}
                >
                  <a
                    href="/profile"
                    className="dropdown-item py-2 px-3 d-block"
                    style={{ cursor: "pointer" }}
                  >
                    User Profile
                  </a>
                  <div
                    className="dropdown-item py-2 px-3 d-block text-danger"
                    style={{ cursor: "pointer" }}
                   onClick={handleLogout}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
