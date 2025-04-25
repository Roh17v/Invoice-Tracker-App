import { Invoice, invoiceValidationSchema } from "../models/invoice.model.js";
import { User, userValidationSchema } from "../models/user.model.js";
import { createError } from "../utils/error.js";

export const createInvoiceAdmin = async (req, res, next) => {
  try {
    const { error } = invoiceValidationSchema.validate(req.body);
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    const { vendorName, amount, dueDate, category, notes, assignedTo } =
      req.body;
    const userId = req.user._id;
    const filePath = req.file ? req.file.path : null;

    const logs = [
      {
        action: "submitted",
        user: userId,
        note: notes || "Invoice submitted.",
      },
    ];

    let finalAssignedTo = userId;

    if (assignedTo && assignedTo !== userId.toString()) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return next(createError(404, "Assigned user not found"));
      }

      finalAssignedTo = assignedUser._id;

      logs.push({
        action: "assigned",
        user: userId,
        note: `Invoice assigned to ${assignedUser.name} (${assignedUser.email})`,
      });
    }

    const invoice = new Invoice({
      vendorName,
      amount,
      dueDate,
      category,
      notes,
      filePath,
      createdBy: userId,
      assignedTo: finalAssignedTo,
      logs,
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

export const getAllInvoicesAdmin = async (req, res, next) => {
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

    const invoices = await Invoice.find(filter).populate([
      { path: "createdBy", select: "name email" },
      { path: "assignedTo", select: "name email" },
      { path: "logs.user", select: "name email" },
    ]);

    res.status(200).json(invoices);
  } catch (err) {
    next(err);
  }
};

export const getInvoiceByIdAdmin = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!invoice) return next(createError(404, "Invoice not found"));

    res.status(200).json(invoice);
  } catch (err) {
    next(err);
  }
};

export const updateInvoiceStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, note } = req.body;

    const validStatuses = ["pending", "approved", "rejected", "reassigned"];
    if (!validStatuses.includes(status)) {
      return next(createError(400, "Invalid status"));
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) return next(createError(404, "Invoice not found"));

    invoice.status = status;

    let logNote = note || "Status updated";

    if (
      status === "reassigned" &&
      assignedTo &&
      assignedTo !== invoice.assignedTo.toString()
    ) {
      const assignedUser = await User.findById(assignedTo).select("name email");
      if (!assignedUser)
        return next(createError(404, "Assigned user not found"));

      invoice.assignedTo = assignedUser._id;
      logNote = `Invoice reassigned to ${assignedUser.name} (${assignedUser.email})`;
    }

    invoice.logs.push({
      action: status,
      user: req.user._id,
      note: logNote,
    });

    const updatedInvoice = await invoice.save();

    await updatedInvoice.populate([
      { path: "createdBy", select: "name email" },
      { path: "assignedTo", select: "name email" },
      { path: "logs.user", select: "name email" },
    ]);

    res.status(200).json({
      message: "Invoice status updated successfully",
      invoice: updatedInvoice,
    });
  } catch (err) {
    next(err);
  }
};

export const getInvoicesByUserAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const invoices = await Invoice.find({
      $or: [{ createdBy: userId }, { assignedTo: userId }],
    })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!invoices || invoices.length === 0) {
      return next(createError(404, "No invoices found for this user"));
    }

    res.status(200).json(invoices);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { error } = userValidationSchema.validate(req.body);
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    const { email, password, role = "reviewer", name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError(409, "Email already registered."));
    }

    const newUser = new User({ name, email, password, role });
    const result = await newUser.save();

    return res.status(201).json({
      id: result._id,
      name: result.name,
      email: result.email,
      role: result.role,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const users = await User.find({ _id: { $ne: userId } });

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    await Invoice.deleteMany({ $or: [{ assignedTo: id }, { createdBy: id }] });

    await User.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ message: "User and assigned invoices deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceStatsAdmin = async (req, res) => {
  try {
    // Ensure only admins can access
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const stats = await Invoice.aggregate([
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

export const getRecentActivityAdmin = async (req, res) => {
  try {
    // Ensure only admin can access
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const invoices = await Invoice.find({})
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

