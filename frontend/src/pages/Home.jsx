import React, { useState, useEffect } from "react";
import {
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaMoneyCheckAlt,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import { useUser } from "../context/UserContext";

const StatusTile = ({ status, count, icon, bgColor, textColor }) => (
  <div
    className={`p-6 rounded-lg shadow-md ${bgColor} ${textColor} hover:shadow-lg transition duration-200 flex items-center space-x-4 min-w-[150px]`}
  >
    <div>{icon}</div>
    <div>
      <h2 className="text-lg font-semibold">{status}</h2>
      <p className="text-2xl font-bold">{count}</p>
    </div>
  </div>
);

const HomePage = () => {
  const { user } = useUser();

  const [invoiceStats, setInvoiceStats] = useState({
    pending: 5,
    approved: 3,
    rejected: 2,
    paid: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([
    "Invoice #1023 was approved 2 hours ago",
    "Invoice #1005 was paid yesterday",
    "Invoice #1010 was rejected due to incorrect details",
  ]);


  const statusTiles = [
    {
      status: "Pending",
      count: invoiceStats.pending,
      icon: <FaClock className="w-6 h-6" />,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
    },
    {
      status: "Approved",
      count: invoiceStats.approved,
      icon: <FaCheckCircle className="w-6 h-6" />,
      bgColor: "bg-green-100",
      textColor: "text-green-800",
    },
    {
      status: "Rejected",
      count: invoiceStats.rejected,
      icon: <FaTimesCircle className="w-6 h-6" />,
      bgColor: "bg-red-100",
      textColor: "text-red-800",
    },
    {
      status: "Paid",
      count: invoiceStats.paid,
      icon: <FaMoneyCheckAlt className="w-6 h-6" />,
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
    },
  ];

  if (isLoading) return <Loader />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <h2 className="text-xl text-gray-600 mb-6">
            Welcome back, {user?.name || "User"} 👋
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {statusTiles.map((tile) => (
              <StatusTile key={tile.status} {...tile} />
            ))}
          </div>

          <div className="mb-10">
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
              + New Invoice
            </button>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Recent Activity
            </h2>
            <ul className="bg-white rounded-lg shadow-md p-4 space-y-3">
              {recentActivity.map((activity, idx) => (
                <li key={idx} className="text-gray-700">
                  {activity}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
