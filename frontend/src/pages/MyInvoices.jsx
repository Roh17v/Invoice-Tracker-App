import React, { useState, useEffect } from "react";
import {
  FaUserEdit,
  FaHistory,
  FaFilter,
  FaCheck,
  FaTimes,
  FaSearch,
  FaEye,
} from "react-icons/fa";
import {
  Dialog,
  TransitionChild,
  Transition,
  DialogTitle,
  DialogPanel,
} from "@headlessui/react";
import Navbar from "../components/Navbar";
import InvoiceHistory from "../components/InvoiceHistory";
import Loader from "../components/Loader";
import { toast } from "sonner";
import axios from "axios";
import { format } from "date-fns";
import { HOST, INVOICE_ROUTE, USER_ROUTE } from "../utils/constants";
import { useUser } from "../context/UserContext";
import { Fragment } from "react";

const MyInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [newAssignee, setNewAssignee] = useState({});
  const [actionNote, setActionNote] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);

  const { user } = useUser();
  const currentUser = {
    _id: user.id,
    role: user.role,
  };

  // Filter states
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    vendor: "",
    category: "",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(10);

  // Fetch users
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await axios.get(`${HOST}${USER_ROUTE}`, {
          withCredentials: true,
        });
        setUsers(response.data);
      } catch (error) {
        console.error(
          "Error fetching users:",
          error.response?.data || error.message
        );
        toast.error("Failed to load users");
      }
    };
    fetchAllUsers();
  }, []);

  // Fetch invoices
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.vendor) queryParams.append("vendor", filters.vendor);
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.startDate) queryParams.append("fromDate", filters.startDate);
      if (filters.endDate) queryParams.append("toDate", filters.endDate);

      const response = await axios.get(
        `${HOST}${INVOICE_ROUTE}?${queryParams.toString()}`,
        {
          withCredentials: true,
        }
      );

      setInvoices(response.data);
      applyClientSideFilters(response.data);
    } catch (err) {
      console.error(
        "Error fetching invoices:",
        err.response?.data || err.message
      );
      setError("Failed to load invoices");
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Apply client-side filters
  const applyClientSideFilters = (data) => {
    let result = [...data];
    if (filters.status) {
      result = result.filter((inv) => inv.status === filters.status);
    }
    if (filters.startDate) {
      result = result.filter(
        (inv) => new Date(inv.dueDate) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      result = result.filter(
        (inv) => new Date(inv.dueDate) <= new Date(filters.endDate)
      );
    }
    if (filters.vendor) {
      result = result.filter((inv) =>
        inv.vendorName.toLowerCase().includes(filters.vendor.toLowerCase())
      );
    }
    if (filters.category) {
      result = result.filter((inv) => inv.category === filters.category);
    }
    setFilteredInvoices(result);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Handle search button click
  const handleSearch = () => {
    fetchInvoices();
  };

  // Handle invoice actions (approve, reject, reassign)
  const handleInvoiceAction = async (invoiceId, action, data = {}) => {
    try {
      const response = await axios.put(
        `${HOST}/api/invoices/${invoiceId}`,
        data,
        {
          withCredentials: true,
        }
      );

      setInvoices((prev) =>
        prev.map((inv) =>
          inv._id === invoiceId
            ? {
                ...inv,
                status: response.data.invoice.status,
                assignedTo: response.data.invoice.assignedTo,
                logs: response.data.invoice.logs,
              }
            : inv
        )
      );
      setFilteredInvoices((prev) =>
        prev.map((inv) =>
          inv._id === invoiceId
            ? {
                ...inv,
                status: response.data.invoice.status,
                assignedTo: response.data.invoice.assignedTo,
                logs: response.data.invoice.logs,
              }
            : inv
        )
      );

      toast.success(`Invoice ${action} successfully`);
      if (action === "approved") setShowApproveModal(false);
      if (action === "rejected") setShowRejectModal(false);
      if (action === "reassigned") setShowReassignModal(false);
    } catch (err) {
      console.error(
        `Error ${action} invoice:`,
        err.response?.data || err.message
      );
      toast.error(`Failed to ${action} invoice`);
    }
  };

  // Open approve modal
  const handleOpenApproveModal = (invoice) => {
    setSelectedInvoice(invoice);
    setActionNote("");
    setShowApproveModal(true);
  };

  // Approve invoice
  const handleApprove = (invoiceId) => {
    handleInvoiceAction(invoiceId, "approved", {
      status: "approved",
      note: actionNote.trim() || "Approved by reviewer",
    });
  };

  // Open reject modal
  const handleOpenRejectModal = (invoice) => {
    setSelectedInvoice(invoice);
    setActionNote("");
    setShowRejectModal(true);
  };

  // Reject invoice
  const handleReject = (invoiceId) => {
    handleInvoiceAction(invoiceId, "rejected", {
      status: "rejected",
      note: actionNote.trim() || "Rejected by reviewer",
    });
  };

  // Open reassign modal
  const handleOpenReassignModal = (invoice) => {
    setSelectedInvoice(invoice);
    setNewAssignee((prev) => ({ ...prev, [invoice._id]: "" }));
    setActionNote("");
    setShowReassignModal(true);
  };

  // Reassign invoice
  const handleReassign = async (invoiceId) => {
    if (!newAssignee[invoiceId]?.trim()) {
      toast.error("Please select a valid assignee");
      return;
    }
    handleInvoiceAction(invoiceId, "reassigned", {
      assignedTo: newAssignee[invoiceId],
      note: actionNote.trim(),
    });
  };

  // Open history modal
  const openHistory = (invoice) => {
    setSelectedInvoice(invoice);
    setShowHistory(true);
  };

  // Open file modal
  const openFileModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowFileModal(true);
  };

  // Pagination logic
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(
    indexOfFirstInvoice,
    indexOfLastInvoice
  );
  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Determine file type
  const isImage = (filePath) => /\.(jpg|jpeg|png|gif)$/i.test(filePath);
  const isPDF = (filePath) => /\.pdf$/i.test(filePath);

  if (isLoading) return <Loader />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 mt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Invoices Dashboard
            </h2>
          </div>

          {/* Filters */}
          <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaFilter className="mr-2 text-blue-600" /> Filter Invoices
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 text-sm"
                >
                  <option value="">All Statuses</option>
                  {["pending", "approved", "rejected", "paid"].map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vendor
                </label>
                <input
                  type="text"
                  name="vendor"
                  value={filters.vendor}
                  onChange={handleFilterChange}
                  placeholder="Search vendor..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 text-sm"
                >
                  <option value="">All Categories</option>
                  {[
                    "utilities",
                    "software",
                    "office supplies",
                    "travel",
                    "consulting",
                    "marketing",
                    "maintenance",
                    "training",
                    "legal",
                    "subscription",
                    "insurance",
                    "it services",
                    "logistics",
                    "hr services",
                    "miscellaneous",
                  ].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center text-sm"
              >
                <FaSearch className="mr-2" /> Search
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          {/* Invoices Table */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                      Assigned To
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentInvoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-4 text-center text-gray-500 text-sm"
                      >
                        No invoices found
                      </td>
                    </tr>
                  ) : (
                    currentInvoices.map((invoice) => (
                      <tr
                        key={invoice._id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{invoice.number || invoice._id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {invoice.vendorName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          ₹{invoice.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden lg:table-cell">
                          {invoice.category.charAt(0).toUpperCase() +
                            invoice.category.slice(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              invoice.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : invoice.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : invoice.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {invoice.status.charAt(0).toUpperCase() +
                              invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden md:table-cell">
                          {invoice.assignedTo?.name || "Unassigned"}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex flex-col space-y-2">
                            {invoice.status === "pending" &&
                              (invoice.assignedTo?._id === currentUser._id ||
                                currentUser.role === "admin") && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleOpenApproveModal(invoice)
                                    }
                                    className="text-green-600 hover:text-green-800 flex items-center text-sm"
                                  >
                                    <FaCheck className="mr-1 h-4 w-4" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleOpenRejectModal(invoice)
                                    }
                                    className="text-red-600 hover:text-red-800 flex items-center text-sm"
                                  >
                                    <FaTimes className="mr-1 h-4 w-4" />
                                    Reject
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleOpenReassignModal(invoice)
                                    }
                                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                                  >
                                    <FaUserEdit className="mr-1 h-4 w-4" />
                                    Reassign
                                  </button>
                                </>
                              )}
                            {invoice.filePath && (
                              <button
                                onClick={() => openFileModal(invoice)}
                                className="text-gray-600 hover:text-gray-800 flex items-center text-sm"
                              >
                                <FaEye className="mr-1 h-4 w-4" />
                                View
                              </button>
                            )}
                            <button
                              onClick={() => openHistory(invoice)}
                              className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                            >
                              <FaHistory className="mr-1 h-4 w-4" />
                              History
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          )}

          {/* Modals */}
          {showHistory && selectedInvoice && (
            <InvoiceHistory
              invoice={selectedInvoice}
              onClose={() => setShowHistory(false)}
            />
          )}
          {showApproveModal && selectedInvoice && (
            <Transition appear show={showApproveModal} as={Fragment}>
              <Dialog
                as="div"
                className="relative z-50"
                onClose={() => setShowApproveModal(false)}
              >
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 backdrop-blur-md bg-opacity-50" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4">
                    <TransitionChild
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <DialogPanel className="w-full max-w-md bg-white rounded-lg p-6">
                        <DialogTitle
                          as="h3"
                          className="text-lg font-semibold text-gray-900 mb-4"
                        >
                          Approve Invoice #
                          {selectedInvoice.number || selectedInvoice._id}
                        </DialogTitle>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Note (Optional)
                        </label>
                        <textarea
                          value={actionNote}
                          onChange={(e) => setActionNote(e.target.value)}
                          placeholder="Enter note..."
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 mb-4"
                          rows={4}
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setShowApproveModal(false)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleApprove(selectedInvoice._id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition text-sm"
                          >
                            Approve
                          </button>
                        </div>
                      </DialogPanel>
                    </TransitionChild>
                  </div>
                </div>
              </Dialog>
            </Transition>
          )}
          {showRejectModal && selectedInvoice && (
            <Transition appear show={showRejectModal} as={Fragment}>
              <Dialog
                as="div"
                className="relative z-50"
                onClose={() => setShowRejectModal(false)}
              >
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 backdrop-blur-md bg-opacity-50" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4">
                    <TransitionChild
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <DialogPanel className="w-full max-w-md bg-white rounded-lg p-6">
                        <DialogTitle
                          as="h3"
                          className="text-lg font-semibold text-gray-900 mb-4"
                        >
                          Reject Invoice #
                          {selectedInvoice.number || selectedInvoice._id}
                        </DialogTitle>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Note (Optional)
                        </label>
                        <textarea
                          value={actionNote}
                          onChange={(e) => setActionNote(e.target.value)}
                          placeholder="Enter note..."
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50 mb-4"
                          rows={4}
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setShowRejectModal(false)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReject(selectedInvoice._id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </DialogPanel>
                    </TransitionChild>
                  </div>
                </div>
              </Dialog>
            </Transition>
          )}
          {showReassignModal && selectedInvoice && (
            <Transition appear show={showReassignModal} as={Fragment}>
              <Dialog
                as="div"
                className="relative z-50"
                onClose={() => setShowReassignModal(false)}
              >
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 backdrop-blur-md bg-opacity-50" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4">
                    <TransitionChild
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <DialogPanel className="w-full max-w-md bg-white rounded-lg p-6">
                        <DialogTitle
                          as="h3"
                          className="text-lg font-semibold text-gray-900 mb-4"
                        >
                          Reassign Invoice #
                          {selectedInvoice.number || selectedInvoice._id}
                        </DialogTitle>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Assignee
                        </label>
                        <select
                          value={newAssignee[selectedInvoice._id] || ""}
                          onChange={(e) =>
                            setNewAssignee((prev) => ({
                              ...prev,
                              [selectedInvoice._id]: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 mb-4"
                        >
                          <option value="">Select assignee</option>
                          {users.map((user) => (
                            <option key={user._id} value={user._id}>
                              {user.name}
                            </option>
                          ))}
                        </select>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Note (Optional)
                        </label>
                        <textarea
                          value={actionNote}
                          onChange={(e) => setActionNote(e.target.value)}
                          placeholder="Enter note..."
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 mb-4"
                          rows={4}
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setShowReassignModal(false)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReassign(selectedInvoice._id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
                          >
                            Reassign
                          </button>
                        </div>
                      </DialogPanel>
                    </TransitionChild>
                  </div>
                </div>
              </Dialog>
            </Transition>
          )}
          {showFileModal && selectedInvoice && (
            <Transition appear show={showFileModal} as={Fragment}>
              <Dialog
                as="div"
                className="relative z-50"
                onClose={() => setShowFileModal(false)}
              >
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 backdrop-blur-md bg-opacity-50" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4">
                    <TransitionChild
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <DialogPanel className="w-full max-w-4xl bg-white rounded-lg p-6">
                        <DialogTitle
                          as="h3"
                          className="text-lg font-semibold text-gray-900 mb-4"
                        >
                          View Invoice #
                          {selectedInvoice.number || selectedInvoice._id}
                        </DialogTitle>
                        <div className="mb-4">
                          {isImage(selectedInvoice.filePath) ? (
                            <img
                              src={`${HOST}/${selectedInvoice.filePath}`}
                              alt="Invoice"
                              className="w-full h-auto max-h-[70vh] object-contain"
                              onError={() =>
                                toast.error("Failed to load image")
                              }
                            />
                          ) : isPDF(selectedInvoice.filePath) ? (
                            <iframe
                              src={`${HOST}/${selectedInvoice.filePath}`}
                              title="Invoice PDF"
                              className="w-full h-[70vh]"
                              onError={() => toast.error("Failed to load PDF")}
                            />
                          ) : (
                            <p className="text-red-600 text-sm">
                              Unsupported file format
                            </p>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => setShowFileModal(false)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition text-sm"
                          >
                            Close
                          </button>
                        </div>
                      </DialogPanel>
                    </TransitionChild>
                  </div>
                </div>
              </Dialog>
            </Transition>
          )}
        </div>
      </div>
    </>
  );
};

export default MyInvoices;
