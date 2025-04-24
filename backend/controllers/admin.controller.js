import { Invoice, invoiceValidationSchema } from "../models/invoice.model.js";
import { User, userValidationSchema } from "../models/user.model.js";
import { createError } from "../utils/error.js";

export const createInvoiceAdmin = async (req, res, next) => {
  try {
    const { error } = invoiceValidationSchema.validate(req.body);
    if (error) return next(createError(400, error.details[0].message));

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
          note: "Invoice submitted.",
        },
      ],
    });

    const savedInvoice = await invoice.save();

    res.status(201).json({
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
    invoice.assignedTo = assignedTo || invoice.assignedTo;
    invoice.logs.push({
      action: status,
      user: req.user._id,
      note: note || "Status updated",
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

    return res.status(200).json({ message: "User and assigned invoices deleted successfully." });
  } catch (error) {
    next(error);
  }
};

