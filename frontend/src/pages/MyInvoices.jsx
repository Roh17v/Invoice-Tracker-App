import React, { useState, useEffect } from "react";
import { FaUserEdit, FaHistory } from "react-icons/fa";
import Navbar from "../components/Navbar";
import InvoiceHistory from "../components/InvoiceHistory";
import Loader from "../components/Loader";
import { toast } from "sonner";

const MyInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [newAssignee, setNewAssignee] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching dummy invoices
  useEffect(() => {
    setTimeout(() => {
      setInvoices([
        {
          _id: "inv1",
          number: "101",
          total: 5500,
          assignedTo: { name: "Ravi Kumar" },
          logs: [
            {
              user: { name: "Admin" },
              action: "created invoice",
              timestamp: new Date(),
            },
          ],
        },
        {
          _id: "inv2",
          number: "102",
          total: 8200,
          assignedTo: { name: "Neha Sharma" },
          logs: [],
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleReassign = (invoiceId) => {
    if (!newAssignee[invoiceId]?.trim()) {
      toast.error("Please enter a valid assignee name");
      return;
    }

    const updatedInvoices = invoices.map((inv) =>
      inv._id === invoiceId
        ? {
            ...inv,
            assignedTo: { name: newAssignee[invoiceId] },
            logs: [
              ...inv.logs,
              {
                user: { name: "CurrentUser" },
                action: `reassigned to ${newAssignee[invoiceId]}`,
                timestamp: new Date(),
              },
            ],
          }
        : inv
    );

    setInvoices(updatedInvoices);
    setNewAssignee((prev) => ({ ...prev, [invoiceId]: "" }));
    toast.success(`Invoice reassigned to ${newAssignee[invoiceId]}`);
  };

  const openHistory = (invoice) => {
    setSelectedInvoice(invoice);
    setShowHistory(true);
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8 mt-16 pb-[1000px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">My Invoices</h2>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              onClick={() => console.log("Add new invoice")}
            >
              + New Invoice
            </button>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No invoices found
                      </td>
                    </tr>
                  ) : (
                    invoices.map((invoice) => (
                      <tr key={invoice._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{invoice.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{invoice.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.assignedTo.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder="New assignee"
                              value={newAssignee[invoice._id] || ""}
                              onChange={(e) =>
                                setNewAssignee((prev) => ({
                                  ...prev,
                                  [invoice._id]: e.target.value,
                                }))
                              }
                              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                            <button
                              onClick={() => handleReassign(invoice._id)}
                              className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition flex items-center text-sm"
                            >
                              <FaUserEdit className="mr-1" /> Reassign
                            </button>
                          </div>
                          <button
                            onClick={() => openHistory(invoice)}
                            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                          >
                            <FaHistory className="mr-1" /> View History
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {showHistory && selectedInvoice && (
            <InvoiceHistory
              invoice={selectedInvoice}
              onClose={() => setShowHistory(false)}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default MyInvoices;
