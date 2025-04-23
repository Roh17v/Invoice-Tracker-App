import React from "react";

const InvoiceHistory = ({ invoice, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
        >
          ✕
        </button>
        <h3 className="text-xl font-bold mb-4">
          History for #{invoice.number}
        </h3>
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {invoice.logs.map((log, idx) => (
            <li key={idx} className="text-sm text-gray-700 border-b pb-1">
              <strong>{log.user.name}</strong> {log.action} on{" "}
              {new Date(log.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InvoiceHistory;
