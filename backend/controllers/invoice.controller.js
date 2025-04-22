import { invoiceValidationSchema } from "../models/invoice.model.js";
import { Invoice } from "../models/invoice.model.js";
import { createError } from "../utils/error.js";

export const createInvoice = async (req, res, next) => {
  try {
    const { error } = invoiceValidationSchema.validate(req.body);
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    const {
      vendorName,
      amount,
      dueDate,
      category,
      notes,
      assignedTo,
    } = req.body;

    const userId = req.user._id;

    const filePath = req.file ? req.file.path : null;

    const invoice = new Invoice({
      vendorName,
      amount,
      dueDate,
      category,
      notes,
      filePath,
      createdBy: userId,
      assignedTo: assignedTo || userId,
      logs: [
        {
          action: "submitted",
          user: userId,
          note: "Invoice submitted.",
        },
      ],
    });

    const savedInvoice = await invoice.save();

    return res.status(201).json({
      message: "Invoice created successfully",
      invoice: savedInvoice,
    });
  } catch (err) {
    next(err);
  }
};

export const updateInvoiceStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, note, assignedTo } = req.body;
  
      const invoice = await Invoice.findById(id);
      if (!invoice) return next(createError(404, "Invoice not Found!"));
  
      // Only assigned reviewer or admin can update
      if (
        req.user.role !== "admin" &&
        invoice.assignedTo?.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: "Access denied" });
      }
  
      if (status) invoice.status = status;
      if (assignedTo) invoice.assignedTo = assignedTo;
  
      invoice.logs.push({
        action: status || "reassigned",
        user: req.user._id,
        timestamp: new Date(),
        note: note || ""
      });
  
      await invoice.save();
      res.status(200).json({ message: "Invoice updated", invoice });
    } catch (error) {
      next(error);
    }
};

export const getInvoiceById = async (req, res, next) => {
    try {
      const invoice = await Invoice.findById(req.params.id)
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")
        .populate("logs.user", "name email");
  
      if (!invoice) return res.status(404).json({ message: "Invoice not found" });
  
      res.status(200).json(invoice);
    } catch (error) {
      next(error);
    }
};

export const getInvoicesByUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const invoices = await Invoice.find({
      $or: [{ createdBy: userId }, { assignedTo: userId }]
    });

    res.status(200).json(invoices);
  } catch (error) {
    next(error);
  }
};

//get invoices with filters
export const getAllInvoices = async (req, res, next) => {
  try {
    const { status, vendor, category, fromDate, toDate } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (vendor) filter.vendorName = new RegExp(vendor, "i");
    if (category) filter.category = category;
    if (fromDate || toDate) {
      filter.dueDate = {};
      if (fromDate) filter.dueDate.$gte = new Date(fromDate);
      if (toDate) filter.dueDate.$lte = new Date(toDate);
    }

    const invoices = await Invoice.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.status(200).json(invoices);
  } catch (error) {
    next(error);
  }
};


  
  
