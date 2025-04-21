import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    vendorName: { type: String, required: "true" },
    amount: { type: Number, required: "true" },
    dueDate: {
      type: Date,
      required: "true",
    },
    category: {
      type: String,
      enum: [
        "Utilities",
        "Software",
        "Office Supplies",
        "Travel",
        "Consulting",
        "Marketing",
        "Maintenance",
        "Training",
        "Legal",
        "Subscription",
        "Insurance",
        "IT Services",
        "Logistics",
        "HR Services",
        "Miscellaneous",
      ],
      required: true,
    },
    notes: String,
    filePath: String,

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Paid"],
      default: "Pending",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    logs: [
      {
        action: {
          type: String,
          enum: ["Submitted", "Approved", "Rejected", "Reassigned"],
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

export const InvoiceSchema = mongoose.model("Invoice", invoiceSchema);
