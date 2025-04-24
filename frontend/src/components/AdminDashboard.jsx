import React, { useState, useEffect } from "react";
import {
  FaTrash,
  FaUserPlus, // Added for Create User button
} from "react-icons/fa";
import {
  Dialog,
  TransitionChild,
  Transition,
  DialogTitle,
  DialogPanel,
} from "@headlessui/react";
import Loader from "./Loader";
import { toast } from "sonner";
import axios from "axios";
import {
  CREATE_NEW_USER,
  DELETE_USER_ROUTE,
  GET_ALL_USERS_ADMIN,
  HOST,
  USER_ROUTE,
} from "../utils/constants";
import { useUser } from "../context/UserContext";
import { Fragment } from "react";
import Invoices from "./Invoices";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false); // New modal state
  const [newUser, setNewUser] = useState({
    // Form state
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [formErrors, setFormErrors] = useState({}); // Validation errors
  const { user } = useUser();

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${HOST}${GET_ALL_USERS_ADMIN}`, {
          withCredentials: true,
        });
        setUsers(response.data);
      } catch (err) {
        console.error(
          "Error fetching users:",
          err.response?.data || err.message
        );
        setError("Failed to load users");
        toast.error("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Delete user
  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${HOST}${DELETE_USER_ROUTE}/${userId}`, {
        withCredentials: true,
      });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setShowDeleteModal(false);
      toast.success("User deleted successfully");
    } catch (err) {
      console.error("Error deleting user:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  // Create user
  const validateForm = () => {
    const errors = {};
    if (!newUser.name.trim()) errors.name = "Name is required";
    if (!newUser.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = "Invalid email format";
    }
    if (!newUser.password.trim()) {
      errors.password = "Password is required";
    } else if (newUser.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (!newUser.role) errors.role = "Role is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;
    try {
      const response = await axios.post(`${HOST}${CREATE_NEW_USER}`, newUser, {
        withCredentials: true,
      });
      setUsers((prev) => [...prev, response.data]);
      setShowCreateUserModal(false);
      setNewUser({ name: "", email: "", password: "", role: "" });
      setFormErrors({});
      toast.success("User created successfully");
    } catch (err) {
      console.error("Error creating user:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to create user");
    }
  };

  // Open modals
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openCreateUserModal = () => {
    setNewUser({ name: "", email: "", password: "", role: "" });
    setFormErrors({});
    setShowCreateUserModal(true);
  };

  if (isLoading) return <Loader />;
  if (user.role !== "admin") return null; // Extra client-side check

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 mt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Admin Dashboard
            </h2>
          </div>

          {/* Invoices Section */}
          <div className="mb-12">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              All Invoices
            </h3>
            <Invoices />
          </div>

          {/* Users Section */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">All Users</h3>
                <button
                  onClick={openCreateUserModal}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center text-sm"
                >
                  <FaUserPlus className="mr-2" /> Create User
                </button>
              </div>
              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-4 text-center text-gray-500 text-sm"
                        >
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users &&
                      users.map((u) => (
                        <tr
                          key={u?._id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {u?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {u?.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {u?.role.charAt(0).toUpperCase() + u?.role.slice(1)}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <button
                              onClick={() => openDeleteModal(u)}
                              className="text-red-600 hover:text-red-800 flex items-center text-sm"
                              disabled={u?._id === user.id}
                            >
                              <FaTrash className="mr-1 h-4 w-4" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Delete User Modal */}
          {showDeleteModal && selectedUser && (
            <Transition appear show={showDeleteModal} as={Fragment}>
              <Dialog
                as="div"
                className="relative z-50"
                onClose={() => setShowDeleteModal(false)}
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
                          Delete User
                        </DialogTitle>
                        <p className="text-sm text-red-600 font-medium mb-4">
                          Are you sure you want to delete{" "}
                          <span className="font-semibold">
                            {selectedUser.name}
                          </span>{" "}
                          (
                          <span className="font-mono">
                            {selectedUser.email}
                          </span>
                          )? <br />
                          <strong>
                            All invoices assigned to this user will be
                            permanently deleted.
                          </strong>
                          <br />
                          This action <span className="uppercase">
                            cannot
                          </span>{" "}
                          be undone.
                        </p>

                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setShowDeleteModal(false)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteUser(selectedUser._id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </DialogPanel>
                    </TransitionChild>
                  </div>
                </div>
              </Dialog>
            </Transition>
          )}

          {/* Create User Modal */}
          {showCreateUserModal && (
            <Transition appear show={showCreateUserModal} as={Fragment}>
              <Dialog
                as="div"
                className="relative z-50"
                onClose={() => setShowCreateUserModal(false)}
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
                          Create New User
                        </DialogTitle>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Name
                            </label>
                            <input
                              type="text"
                              value={newUser.name}
                              onChange={(e) =>
                                setNewUser((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 text-sm"
                              placeholder="Enter name"
                            />
                            {formErrors.name && (
                              <p className="text-red-600 text-sm mt-1">
                                {formErrors.name}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Email
                            </label>
                            <input
                              type="email"
                              value={newUser.email}
                              onChange={(e) =>
                                setNewUser((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 text-sm"
                              placeholder="Enter email"
                            />
                            {formErrors.email && (
                              <p className="text-red-600 text-sm mt-1">
                                {formErrors.email}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Password
                            </label>
                            <input
                              type="password"
                              value={newUser.password}
                              onChange={(e) =>
                                setNewUser((prev) => ({
                                  ...prev,
                                  password: e.target.value,
                                }))
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 text-sm"
                              placeholder="Enter password"
                            />
                            {formErrors.password && (
                              <p className="text-red-600 text-sm mt-1">
                                {formErrors.password}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Role
                            </label>
                            <select
                              value={newUser.role}
                              onChange={(e) =>
                                setNewUser((prev) => ({
                                  ...prev,
                                  role: e.target.value,
                                }))
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 text-sm"
                            >
                              <option value="">Select role</option>
                              <option value="admin">Admin</option>
                              <option value="reviewer">Reviewer</option>
                            </select>
                            {formErrors.role && (
                              <p className="text-red-600 text-sm mt-1">
                                {formErrors.role}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                          <button
                            onClick={() => setShowCreateUserModal(false)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCreateUser}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
                          >
                            Create
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

export default AdminDashboard;
