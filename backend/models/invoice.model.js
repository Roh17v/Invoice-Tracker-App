import mongoose from "mongoose";
import Joi from "joi";

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

const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
}, "ObjectId Validation");

export const invoiceValidationSchema = Joi.object({
  vendorName: Joi.string().trim().required().messages({
    "string.empty": "Vendor name is required",
  }),

  amount: Joi.number().positive().required().messages({
    "number.base": "Amount must be a number",
    "number.positive": "Amount must be positive",
    "any.required": "Amount is required",
  }),

  dueDate: Joi.date().required().messages({
    "date.base": "Due date must be a valid date",
    "any.required": "Due date is required",
  }),

  category: Joi.string()
    .valid(
      "Utilities", "Software", "Office Supplies", "Travel", "Consulting",
      "Marketing", "Maintenance", "Training", "Legal", "Subscription",
      "Insurance", "IT Services", "Logistics", "HR Services", "Miscellaneous"
    )
    .required()
    .messages({
      "any.only": "Category is not valid",
      "any.required": "Category is required",
    }),

  notes: Joi.string().allow("").optional(),

  filePath: Joi.string().allow("").optional(),

  assignedTo: objectId.allow(null).optional(),

});

export const Invoice = mongoose.model("Invoice", invoiceSchema);
