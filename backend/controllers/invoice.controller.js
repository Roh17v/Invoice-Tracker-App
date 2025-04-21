import { invoiceValidationSchema } from "../models/invoice.model.js";
import { Invoice } from "../models/invoice.model.js";

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
          action: "Submitted",
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
