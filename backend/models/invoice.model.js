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
        "utilities", "software", "office supplies", "travel", "consulting", 
        "marketing", "maintenance", "training", "legal", "subscription", 
        "insurance", "it services", "logistics", "hr services", "miscellaneous"
      ]
      ,
      required: true,
    },
    notes: String,
    filePath: String,

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "paid"],
      default: "pending",
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
          enum: ["submitted", "approved", "rejected", "reassigned", "paid"],
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
      "utilities", "software", "office supplies", "travel", "consulting",
      "marketing", "maintenance", "training", "legal", "subscription",
      "insurance", "it services", "logistics", "hr services", "miscellaneous"
    )
    .lowercase()
    .required()
    .messages({
      "any.only": "Category is not valid",
      "any.required": "Category is required",
    }),

  notes: Joi.string().allow("").optional(),

  filePath: Joi.string().allow("").optional(),

  assignedTo: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null)
    .optional(),
});

export const Invoice = mongoose.model("Invoice", invoiceSchema);
