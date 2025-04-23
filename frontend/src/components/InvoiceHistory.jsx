import React from "react";
import { FaTimes, FaCheck, FaUserEdit, FaBan } from "react-icons/fa";
import {
  Transition,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { format } from "date-fns";
import { Fragment } from "react";

const InvoiceHistory = ({ invoice, onClose }) => {
  // Map actions to icons and colors for visual distinction
  const actionStyles = {
    approved: {
      icon: <FaCheck className="text-green-500" />,
      label: "Approved",
    },
    rejected: { icon: <FaBan className="text-red-500" />, label: "Rejected" },
    reassigned: {
      icon: <FaUserEdit className="text-blue-500" />,
      label: "Reassigned",
    },
  };

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </TransitionChild>

        {/* Modal */}
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
              <DialogPanel className="w-full max-w-lg bg-white rounded-xl p-6 shadow-xl transform transition-all">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <DialogTitle
                    as="h3"
                    className="text-xl font-semibold text-gray-900"
                  >
                    History for #{invoice.number || invoice._id}
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                    aria-label="Close history modal"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                {/* Log List */}
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                  {invoice.logs.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center">
                      No history available
                    </p>
                  ) : (
                    invoice.logs.map((log, idx) => (
                      <div
                        key={idx}
                        className="border-l-4 border-gray-200 pl-4 py-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-3">
                          {/* Action Icon */}
                          <div className="flex-shrink-0 mt-1">
                            {actionStyles[log.action]?.icon || (
                              <FaCheck className="text-gray-400" />
                            )}
                          </div>
                          {/* Log Details */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                <span className="font-semibold">
                                  {log.user?.name || "Unknown User"}
                                </span>{" "}
                                {actionStyles[log.action]?.label ||
                                  log.action.charAt(0).toUpperCase() +
                                    log.action.slice(1)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(
                                  new Date(log.timestamp),
                                  "MMM dd, yyyy HH:mm"
                                )}
                              </p>
                            </div>
                            {/* Note */}
                            <p className="mt-1 text-sm text-gray-600">
                              {log.note || "No note provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default InvoiceHistory;
