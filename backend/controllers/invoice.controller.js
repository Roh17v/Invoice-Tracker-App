import { invoiceValidationSchema } from "../models/invoice.model.js";
import { Invoice } from "../models/invoice.model.js";
import { createError } from "../utils/error.js";
import mongoose from "mongoose";

export const createInvoice = async (req, res, next) => {
  try {
    const { error } = invoiceValidationSchema.validate(req.body);
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    const { vendorName, amount, dueDate, category, notes, assignedTo } =
      req.body;

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
          note: notes || "Invoice submitted.",
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

    let actionLabel = null;

    // Handle valid status updates
    const validStatuses = ["approved", "rejected", "paid"];
    if (status && validStatuses.includes(status)) {
      invoice.status = status;
      actionLabel = status;
    }

    // Handle reassignment
    if (assignedTo && assignedTo !== invoice.assignedTo?.toString()) {
      invoice.assignedTo = assignedTo;
      if (!actionLabel) actionLabel = "reassigned";
    }

    if (!actionLabel) {
      return res.status(400).json({ message: "No valid update provided" });
    }

    invoice.logs.push({
      action: actionLabel,
      user: req.user._id,
      timestamp: new Date(),
      note: note || "",
    });

    await invoice.save();
    res.status(200).json({ message: "Invoice updated successfully", invoice });
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
    const userId = req.user._id;

    const invoices = await Invoice.find({
      $or: [{ createdBy: userId }, { assignedTo: userId }],
    });

    res.status(200).json(invoices);
  } catch (error) {
    next(error);
  }
};

//get invoices with filters
export const getAllInvoicesForUser = async (req, res, next) => {
  try {
    const { status, vendor, category, fromDate, toDate } = req.query;
    const filter = {
      $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }],
    };

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

// GET /api/invoices/recent-activity
export const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user._id;

    const invoices = await Invoice.find({
      $or: [{ createdBy: userId }, { assignedTo: userId }],
    })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("logs.user", "name email")
      .lean();

    const activities = invoices
      .flatMap((invoice) =>
        invoice.logs.map((log) => ({
          action: log.action,
          invoiceId: invoice._id,
          vendorName: invoice.vendorName,
          amount: invoice.amount,
          status: invoice.status,
          timestamp: log.timestamp,
          userName: log.user?.name || "Unknown",
          userEmail: log.user?.email || "Unknown",
          note: log.note || "",
          createdBy: invoice.createdBy?.name || "Unknown",
          assignedTo: invoice.assignedTo?.name || "Unknown",
        }))
      )
      .sort((a, b) => b.timestamp - a.timestamp) // Sort by timestamp (newest first)
      .slice(0, 10); // Limit to 10 most recent activities

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ message: "Server error while fetching activity." });
  }
};

// GET /api/invoices/stats
export const getInvoiceStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Invoice.aggregate([
      {
        $match: {
          $or: [
            { createdBy: new mongoose.Types.ObjectId(userId) },
            { assignedTo: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
          totalAmount: 1,
        },
      },
    ]);

    const invoiceStats = {
      pending: { count: 0, totalAmount: 0 },
      approved: { count: 0, totalAmount: 0 },
      rejected: { count: 0, totalAmount: 0 },
      paid: { count: 0, totalAmount: 0 },
    };

    stats.forEach(({ status, count, totalAmount }) => {
      invoiceStats[status] = { count, totalAmount };
    });

    res.status(200).json(invoiceStats);
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching invoice stats." });
  }
};
