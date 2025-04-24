import React, { useState } from "react";
import { toast } from "sonner";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const { login } = useUser();

  const handleSignIn = (e) => {
    e.preventDefault();

    let userData = {};
    if (email) userData.email = email;
    if (password) userData.password = password;

    login(userData, navigate);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col md:flex-row max-w-4xl w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="w-full md:w-1/2 bg-blue-50 p-8 flex items-center justify-center">
          <div className="text-center">
            <img
              src="/illustration.jpg"
              alt="Invoice Illustration"
              className="w-3/4 mx-auto"
            />
            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              Welcome to InvoicePro
            </h2>
            <p className="mt-2 text-gray-600">
              Manage your invoices with ease and efficiency.
            </p>
          </div>
        </div>
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Login
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Access your invoice dashboard
          </p>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <MdVisibilityOff size={20} />
                  ) : (
                    <MdVisibility size={20} />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Sign In
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="mailto:admin@invoicepro.com"
              className="text-blue-600 hover:underline"
            >
              Contact admin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
