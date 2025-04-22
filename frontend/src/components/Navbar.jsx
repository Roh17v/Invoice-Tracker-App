import React, { useState } from "react";
import { Link } from "react-router-dom"; // For navigation (use # if not using react-router)
import { useUser } from "../context/UserContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { logout } = useUser();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Branding */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              InvoicePro
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/dashboard"
              className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
              onClick={toggleMenu}
            >
              Dashboard
            </Link>
            <button
              onClick={() => {
                handleLogout();
                toggleMenu();
              }}
              className="w-full text-left bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
