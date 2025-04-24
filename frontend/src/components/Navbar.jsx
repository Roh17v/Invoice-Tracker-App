import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { logout, user } = useUser();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY <= lastScrollY || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const linkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      location.pathname === path
        ? "text-blue-600"
        : "text-gray-600 hover:text-blue-600"
    }`;

  const isAdmin = user?.role === "admin";
  const isReviewer = user?.role === "reviewer";

  return (
    <nav
      className={`bg-white shadow-md fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              InvoicePro
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className={linkClass("/")}>
              Home
            </Link>

            {isReviewer && (
              <Link to="/my-invoices" className={linkClass("/my-invoices")}>
                My Invoices
              </Link>
            )}

            {/* Only visible to admin */}
            {isAdmin && (
              <Link
                to="/admin-dashboard"
                className={linkClass("/admin-dashboard")}
              >
                Admin Dashboard
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 cursor-pointer"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-blue-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu content */}
      {isOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/" onClick={toggleMenu} className={linkClass("/")}>
            Home
          </Link>

          {isReviewer && (
            <Link
              to="/my-invoices"
              onClick={toggleMenu}
              className={linkClass("/my-invoices")}
            >
              My Invoices
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin-dashboard"
              onClick={toggleMenu}
              className={linkClass("/admin-dashboard")}
            >
              Admin Dashboard
            </Link>
          )}

          <button
            onClick={() => {
              handleLogout();
              toggleMenu();
            }}
            className="w-full text-left bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 cursor-pointer"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
