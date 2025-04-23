import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  FaFileUpload,
  FaCheckCircle,
  FaTimesCircle,
  FaFilePdf,
  FaFileImage,
} from "react-icons/fa";
import { HOST, INVOICE_ROUTE, USER_ROUTE } from "../utils/constants";
import { useInvoice } from "../context/InvoiceContext";

const CreateInvoiceModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    vendorName: "",
    amount: "",
    dueDate: "",
    category: "",
    notes: "",
    assignedTo: "",
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const respone = await axios.get(`${HOST}${USER_ROUTE}`, {
          withCredentials: "true",
        });

        if (respone.status === 200) {
          setUsers(respone.data);
        }
      } catch (error) {
        console.log(errors);
      }
    };

    fetchAllUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFilePreview(null);
    setFileName("");
    setErrors((prev) => ({ ...prev, file: "" }));

    if (selectedFile) {
      const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(selectedFile.type)) {
        setErrors((prev) => ({
          ...prev,
          file: "Only PDF, PNG, or JPEG files are allowed",
        }));
        setFile(null);
        return;
      }

      if (selectedFile.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          file: "File size must be less than 5MB",
        }));
        setFile(null);
        return;
      }

      if (selectedFile.type === "application/pdf") {
        setFileName(selectedFile.name);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.vendorName.trim())
      newErrors.vendorName = "Vendor name is required";
    if (!form.amount) {
      newErrors.amount = "Amount is required";
    } else if (parseFloat(form.amount) <= 0) {
      newErrors.amount = "Amount must be positive";
    }
    if (!form.dueDate) newErrors.dueDate = "Due date is required";
    if (!form.category) newErrors.category = "Category is required";
    return newErrors;
  };

  const { triggerRefresh } = useInvoice();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    if (file) formData.append("file", file);

    try {
      const response = await axios.post(`${HOST}${INVOICE_ROUTE}`, formData, {
        withCredentials: "true",
      });
      toast.success("Invoice created successfully");
      setForm({
        vendorName: "",
        amount: "",
        dueDate: "",
        category: "",
        notes: "",
        assignedTo: "",
      });
      setFile(null);
      setFilePreview(null);
      setFileName("");
      setErrors({});
      onClose();
    } catch (error) {
      console.error(
        "Error creating invoice:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
      triggerRefresh();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FaFileUpload className="mr-2 text-blue-600" /> Create New Invoice
        </h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Vendor Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Vendor Name
            </label>
            <input
              type="text"
              name="vendorName"
              value={form.vendorName}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 ${
                errors.vendorName ? "border-red-500" : ""
              }`}
            />
            {errors.vendorName && (
              <p className="mt-1 text-sm text-red-500">{errors.vendorName}</p>
            )}
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Amount (₹)
            </label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              step="0.01"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 ${
                errors.amount ? "border-red-500" : ""
              }`}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          {/* Due Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              min={format(new Date(), "yyyy-MM-dd")}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 ${
                errors.dueDate ? "border-red-500" : ""
              }`}
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-500">{errors.dueDate}</p>
            )}
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 ${
                errors.category ? "border-red-500" : ""
              }`}
            >
              <option value="">Select a category</option>
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
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50"
              rows="4"
            />
          </div>

          {/* Assigned To */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Assign To (Optional)
            </label>
            <select
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <FaFileUpload className="mr-1 text-blue-600" /> Attach File
              (Optional, PDF/PNG/JPEG)
            </label>
            <input
              type="file"
              accept=".pdf,.png,.jpeg"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white file:hover:bg-blue-700"
            />
            {errors.file && (
              <p className="mt-1 text-sm text-red-500">{errors.file}</p>
            )}
            {filePreview && (
              <div className="mt-2">
                <img
                  src={filePreview}
                  alt="Preview"
                  className="max-w-xs rounded-md shadow-sm"
                />
              </div>
            )}
            {fileName && (
              <p className="mt-2 text-sm text-gray-600 flex items-center">
                <FaFilePdf className="mr-1 text-red-500" /> Selected PDF:{" "}
                {fileName}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition flex items-center"
              disabled={isSubmitting}
            >
              <FaTimesCircle className="mr-1" /> Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition flex items-center ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Creating..."
              ) : (
                <>
                  <FaCheckCircle className="mr-1" /> Create Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;
